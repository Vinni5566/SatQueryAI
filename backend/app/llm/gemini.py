from __future__ import annotations

import base64
import os
from dataclasses import dataclass
from typing import Protocol

from app.config import Settings, get_settings


@dataclass
class ChatTurn:
    role: str  # user | assistant
    text: str


class ChatLLM(Protocol):
    def answer(
        self,
        history: list[ChatTurn],
        user_message: str,
        image_png_bytes: bytes | None,
    ) -> str:
        ...


class FakeLLM:
    def answer(
        self,
        history: list[ChatTurn],
        user_message: str,
        image_png_bytes: bytes | None,
    ) -> str:
        n = len(history)
        has_image = "yes" if image_png_bytes else "no"
        return (
            f"Echo: {user_message} "
            f"(context_turns={n}, image={has_image})"
        )


class GeminiLLM:
    """Gemini via API key (AI Studio) or Vertex with service-account credentials."""

    def __init__(self, settings: Settings) -> None:
        from google import genai

        self._model = settings.gemini_model
        if settings.gemini_api_key.strip():
            self._client = genai.Client(api_key=settings.gemini_api_key.strip())
            return

        if not settings.google_cloud_project:
            raise RuntimeError(
                "Set GEMINI_API_KEY or GOOGLE_CLOUD_PROJECT for Gemini."
            )
        if settings.google_application_credentials:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = (
                settings.google_application_credentials
            )
        self._client = genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.google_cloud_location,
        )

    def answer(
        self,
        history: list[ChatTurn],
        user_message: str,
        image_png_bytes: bytes | None,
    ) -> str:
        from google.genai import types

        contents: list[types.Content] = []
        for turn in history:
            role = "user" if turn.role == "user" else "model"
            contents.append(
                types.Content(role=role, parts=[types.Part.from_text(text=turn.text)])
            )

        parts: list[types.Part] = []
        if image_png_bytes:
            parts.append(
                types.Part.from_bytes(data=image_png_bytes, mime_type="image/png")
            )
        parts.append(types.Part.from_text(text=user_message))
        contents.append(types.Content(role="user", parts=parts))

        response = self._client.models.generate_content(
            model=self._model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are SatQuery AI, a helpful assistant for satellite imagery. "
                    "Answer clearly about the scene when an image is provided. "
                    "If unsure, say so. Keep answers concise."
                ),
            ),
        )
        text = (response.text or "").strip()
        return text or "I could not generate a response."


# Back-compat alias used in older imports/docs
VertexGeminiLLM = GeminiLLM

_llm: ChatLLM | None = None


def get_llm(settings: Settings | None = None) -> ChatLLM:
    global _llm
    if _llm is not None:
        return _llm
    cfg = settings or get_settings()
    if cfg.gemini_api_key.strip() or cfg.google_cloud_project.strip():
        try:
            _llm = GeminiLLM(cfg)
        except Exception:
            _llm = FakeLLM()
    else:
        _llm = FakeLLM()
    return _llm


def set_llm(llm: ChatLLM | None) -> None:
    global _llm
    _llm = llm


def png_b64_to_bytes(b64: str) -> bytes:
    return base64.b64decode(b64)
