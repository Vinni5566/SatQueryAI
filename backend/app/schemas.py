from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

FormatKind = Literal["geotiff", "raster"]
ModalityGuess = Literal["optical", "sar", "unknown"]
JobType = Literal["ask_scene"]


class ImageMetadata(BaseModel):
    width: int
    height: int
    band_count: int
    crs: str | None = None
    bounds: list[float] | None = None  # left, bottom, right, top
    modality_guess: ModalityGuess = "unknown"
    format_kind: FormatKind
    filename: str = ""


class PreviewResponse(BaseModel):
    preview_png_base64: str
    metadata: ImageMetadata


class CompatibilityResult(BaseModel):
    valid: bool
    error: str | None = None
    metadata: ImageMetadata | None = None
    extras: dict[str, Any] = Field(default_factory=dict)
