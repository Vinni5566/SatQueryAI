from __future__ import annotations

from typing import Any

from app.io.geotiff import (
    ALLOWED_EXTS,
    calculate_bounds_iou,
    extension_of,
    is_allowed_filename,
    preview_from_bytes,
)
from app.schemas import CompatibilityResult, ImageMetadata, JobType


def check_compatibility(
    job: JobType,
    files: list[tuple[str, bytes]],
    query: str = "",
) -> CompatibilityResult:
    """Hard gate before task inference or any model call. Never raises for validation failures.

    Validates:
    - File count vs job type (ask_scene: 1, before_after: 2, fusion: 2)
    - File format and extension support (GeoTIFF, PNG, JPEG)
    - Modality alignment (optical-optical / sar-sar for change; optical-sar for fusion)
    - CRS presence and geospatial IoU overlap >= 0.8 for georeferenced GeoTIFF pairs
    - Non-georeferenced benchmark fallback (skips CRS requirement)
    """
    try:
        # 1. Basic file count validation
        if not files:
            return CompatibilityResult(
                valid=False,
                error=f"No files provided. {job} requires input satellite images.",
            )

        # 2. Check each file for format and read metadata
        metadatas: list[ImageMetadata] = []
        notes: list[str] = []

        for idx, (filename, data) in enumerate(files):
            if not filename or not is_allowed_filename(filename):
                return CompatibilityResult(
                    valid=False,
                    error="Please use GeoTIFF (.tif/.tiff), or PNG/JPEG for official practice images.",
                )
            if not data or len(data) == 0:
                return CompatibilityResult(
                    valid=False,
                    error=f"File '{filename}' is empty (0 bytes).",
                )
            try:
                _, meta = preview_from_bytes(data, filename)
                metadatas.append(meta)
            except Exception as exc:  # noqa: BLE001 — surface as compatibility error
                return CompatibilityResult(
                    valid=False,
                    error=f"Failed to read image '{filename}': {exc}",
                )

            if extension_of(filename) not in {".tif", ".tiff"}:
                notes.append(f"Image {idx+1} ({filename}): Benchmark image · no CRS")

        # 3. Job-specific validation rules
        if job in {"ask_scene", "vqa", "grounding"}:
            if len(files) != 1:
                return CompatibilityResult(
                    valid=False,
                    error=f"Job '{job}' needs exactly one image, got {len(files)}.",
                )
            extras: dict[str, Any] = {}
            if notes:
                extras["note"] = notes[0]
            return CompatibilityResult(
                valid=True,
                metadata=metadatas[0],
                extras=extras,
            )

        if job in {"before_after", "bitemporal_change", "change"}:
            if len(files) != 2:
                return CompatibilityResult(
                    valid=False,
                    error=f"Bi-temporal change detection requires exactly 2 images (before and after), got {len(files)}.",
                )
            m1, m2 = metadatas[0], metadatas[1]

            # Modality match check: both must be optical or both SAR
            mod1 = m1.modality_guess
            mod2 = m2.modality_guess
            if mod1 != "unknown" and mod2 != "unknown" and mod1 != mod2:
                return CompatibilityResult(
                    valid=False,
                    error=(
                        f"Before/After change detection requires images of the same modality. "
                        f"Found mismatched modalities: image 1 is {mod1}, while image 2 is {mod2}."
                    ),
                    metadata=metadatas,
                )

            # Geospatial overlap check (IoU >= 0.8) if both have CRS & bounds
            extras_pair: dict[str, Any] = {"modalities": [mod1, mod2]}
            if m1.crs and m2.crs and m1.bounds and m2.bounds:
                iou = calculate_bounds_iou(m1.bounds, m2.bounds)
                extras_pair["iou"] = round(iou, 4)
                if iou < 0.8:
                    return CompatibilityResult(
                        valid=False,
                        error=(
                            f"Images do not sufficiently overlap for change detection: "
                            f"geospatial IoU is {iou:.2f} (minimum 0.80 required)."
                        ),
                        metadata=metadatas,
                        extras=extras_pair,
                    )
            else:
                extras_pair["note"] = "Benchmark image pair or unprojected raster · georeferencing checks skipped"

            return CompatibilityResult(
                valid=True,
                metadata=metadatas,
                extras=extras_pair,
            )

        if job in {"fusion", "cross_modal"}:
            if len(files) != 2:
                return CompatibilityResult(
                    valid=False,
                    error=f"Optical+SAR fusion requires exactly 2 images (1 optical and 1 SAR), got {len(files)}.",
                )
            m1, m2 = metadatas[0], metadatas[1]
            mod1, mod2 = m1.modality_guess, m2.modality_guess
            mods = {mod1, mod2}

            if not ("optical" in mods and "sar" in mods):
                # If modalities are both optical or both SAR
                return CompatibilityResult(
                    valid=False,
                    error=(
                        f"Cross-sensor fusion requires 1 optical image and 1 SAR image. "
                        f"Received modalities: '{mod1}' and '{mod2}'."
                    ),
                    metadata=metadatas,
                )

            extras_fusion: dict[str, Any] = {"modalities": [mod1, mod2]}
            if m1.crs and m2.crs and m1.bounds and m2.bounds:
                iou = calculate_bounds_iou(m1.bounds, m2.bounds)
                extras_fusion["iou"] = round(iou, 4)
                if iou < 0.8:
                    return CompatibilityResult(
                        valid=False,
                        error=(
                            f"Optical and SAR images do not sufficiently overlap for fusion: "
                            f"geospatial IoU is {iou:.2f} (minimum 0.80 required)."
                        ),
                        metadata=metadatas,
                        extras=extras_fusion,
                    )
            else:
                extras_fusion["note"] = "Benchmark fusion images · georeferencing checks skipped"

            return CompatibilityResult(
                valid=True,
                metadata=metadatas,
                extras=extras_fusion,
            )

        return CompatibilityResult(valid=False, error=f"Unsupported job: {job}")

    except Exception as exc:  # noqa: BLE001
        return CompatibilityResult(
            valid=False,
            error=f"Compatibility check unexpected error: {exc}",
        )


def allowed_extensions() -> set[str]:
    return set(ALLOWED_EXTS)
