from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

FormatKind = Literal["geotiff", "raster"]
ModalityGuess = Literal["optical", "sar", "unknown"]
JobType = Literal[
    "ask_scene",
    "before_after",
    "bitemporal_change",
    "change",
    "fusion",
    "cross_modal",
    "grounding",
    "vqa",
] | str


class ImageMetadata(BaseModel):
    width: int
    height: int
    band_count: int
    crs: str | None = None
    bounds: list[float] | None = None  # left, bottom, right, top
    transform: list[float] | None = None
    resolution: list[float] | None = None  # [res_x, res_y]
    driver: str | None = None
    modality_guess: ModalityGuess = "unknown"
    format_kind: FormatKind
    filename: str = ""
    stats: dict[str, Any] | None = None


class PreviewResponse(BaseModel):
    preview_png_base64: str
    metadata: ImageMetadata


class CompatibilityResult(BaseModel):
    valid: bool
    error: str | None = None
    metadata: ImageMetadata | list[ImageMetadata] | None = None
    extras: dict[str, Any] = Field(default_factory=dict)


class ToolOutput(BaseModel):
    text: str | None = None
    overlay: bytes | None = None
    score: float | None = None


class Precondition(BaseModel):
    check: str  # registered check ID, e.g. "iou_overlap"
    required: bool = True
    params: dict[str, Any] = Field(default_factory=dict)


class PreconditionResult(BaseModel):
    passed: bool
    failed_check: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)


