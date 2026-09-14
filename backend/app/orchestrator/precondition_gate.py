"""Precondition Gate — Dev 1 implementation.

Evaluates workflow plan preconditions against input image metadata before any
model is called. If any required precondition fails, execution is halted immediately
with the specific failure reason.
"""
from __future__ import annotations

import logging
from typing import Any, Callable

from app.io.geotiff import calculate_bounds_iou
from app.schemas import ImageMetadata, Precondition, PreconditionResult

logger = logging.getLogger(__name__)

# Registry of check functions: check_id -> Callable[[Precondition, list[ImageMetadata], dict], tuple[bool, str | None]]
_CHECK_REGISTRY: dict[
    str,
    Callable[[Precondition, list[ImageMetadata], dict[str, Any]], tuple[bool, str | None]],
] = {}


def register_check(check_id: str):
    """Decorator to register a precondition check function."""
    def decorator(fn: Callable[[Precondition, list[ImageMetadata], dict[str, Any]], tuple[bool, str | None]]):
        _CHECK_REGISTRY[check_id] = fn
        return fn
    return decorator


@register_check("iou_overlap")
def check_iou_overlap(
    precondition: Precondition,
    metadatas: list[ImageMetadata],
    extras: dict[str, Any],
) -> tuple[bool, str | None]:
    """Check that two images have geospatial IoU overlap >= min_iou (default 0.8)."""
    if len(metadatas) < 2:
        return True, None

    min_iou = float(precondition.params.get("min_iou", 0.8))
    m1, m2 = metadatas[0], metadatas[1]

    # If georeferenced GeoTIFFs
    if m1.crs and m2.crs and m1.bounds and m2.bounds:
        iou = calculate_bounds_iou(m1.bounds, m2.bounds)
        extras["iou"] = round(iou, 4)
        if iou < min_iou:
            return (
                False,
                f"Geospatial overlap check failed: IoU is {iou:.2f}, below required minimum of {min_iou:.2f}.",
            )
        return True, None

    # For benchmark non-georeferenced images
    allow_benchmark = precondition.params.get("allow_benchmark", True)
    if allow_benchmark:
        return True, None

    return False, "Georeferenced bounds / CRS are required for IoU overlap check."


@register_check("modality_match")
def check_modality_match(
    precondition: Precondition,
    metadatas: list[ImageMetadata],
    extras: dict[str, Any],
) -> tuple[bool, str | None]:
    """Check that image modalities match required configuration."""
    expected = precondition.params.get("expected")  # e.g. "optical", "sar", "same", "both"
    if not expected or not metadatas:
        return True, None

    modalities = [m.modality_guess for m in metadatas]

    if expected == "same":
        if len(set(modalities)) > 1:
            return False, f"All images must share the same modality, got: {modalities}"
        return True, None

    if expected == "both":
        # Requires 1 optical and 1 sar
        mods = set(modalities)
        if not ("optical" in mods and "sar" in mods):
            return False, f"Job requires both optical and SAR imagery, got: {modalities}"
        return True, None

    if expected in {"optical", "sar"}:
        for idx, m in enumerate(metadatas):
            if m.modality_guess != "unknown" and m.modality_guess != expected:
                return False, f"Image {idx+1} modality is '{m.modality_guess}', expected '{expected}'."
        return True, None

    return True, None


@register_check("crs_present")
def check_crs_present(
    precondition: Precondition,
    metadatas: list[ImageMetadata],
    extras: dict[str, Any],
) -> tuple[bool, str | None]:
    """Check that all images contain a valid coordinate reference system."""
    for idx, m in enumerate(metadatas):
        if not m.crs:
            return False, f"Image {idx+1} ({m.filename}) is missing georeferencing CRS metadata."
    return True, None


@register_check("min_dimensions")
def check_min_dimensions(
    precondition: Precondition,
    metadatas: list[ImageMetadata],
    extras: dict[str, Any],
) -> tuple[bool, str | None]:
    """Check that images meet minimum pixel width and height."""
    min_w = int(precondition.params.get("min_width", 16))
    min_h = int(precondition.params.get("min_height", 16))

    for idx, m in enumerate(metadatas):
        if m.width < min_w or m.height < min_h:
            return False, f"Image {idx+1} resolution {m.width}x{m.height} is below minimum {min_w}x{min_h}."
    return True, None


@register_check("cloud_fraction_limit")
def check_cloud_fraction_limit(
    precondition: Precondition,
    metadatas: list[ImageMetadata],
    extras: dict[str, Any],
) -> tuple[bool, str | None]:
    """Check that estimated cloud coverage does not exceed maximum allowable threshold."""
    max_cloud = float(precondition.params.get("max_cloud", 0.5))
    cloud_frac = extras.get("cloud_fraction")
    if cloud_frac is not None and cloud_frac > max_cloud:
        return (
            False,
            f"Image cloud fraction ({cloud_frac*100:.1f}%) exceeds allowable threshold ({max_cloud*100:.1f}%).",
        )
    return True, None


@register_check("band_count_match")
def check_band_count_match(
    precondition: Precondition,
    metadatas: list[ImageMetadata],
    extras: dict[str, Any],
) -> tuple[bool, str | None]:
    """Check minimum required band count."""
    min_bands = int(precondition.params.get("min_bands", 1))
    for idx, m in enumerate(metadatas):
        if m.band_count < min_bands:
            return False, f"Image {idx+1} has {m.band_count} bands, requires at least {min_bands}."
    return True, None


def check_preconditions(
    preconditions: list[Precondition],
    metadata: ImageMetadata | list[ImageMetadata],
    extras: dict[str, Any] | None = None,
) -> PreconditionResult:
    """Execute all registered precondition checks against image metadata.

    Args:
        preconditions: Ordered list of Precondition objects from ResolvedPlan
        metadata: Single ImageMetadata or list of ImageMetadata
        extras: Optional dictionary of contextual metadata

    Returns:
        PreconditionResult(passed=True/False, failed_check=str|None, details=dict)
    """
    metadatas = [metadata] if isinstance(metadata, ImageMetadata) else list(metadata)
    extra_dict = extras.copy() if extras else {}

    for pre in preconditions:
        check_fn = _CHECK_REGISTRY.get(pre.check)
        if not check_fn:
            logger.warning("Unknown precondition check '%s', skipping", pre.check)
            continue

        passed, reason = check_fn(pre, metadatas, extra_dict)
        if not passed:
            if pre.required:
                logger.info("Precondition '%s' failed: %s", pre.check, reason)
                return PreconditionResult(
                    passed=False,
                    failed_check=reason or f"Precondition '{pre.check}' failed.",
                    details={"failed_precondition": pre.check, **extra_dict},
                )
            else:
                logger.debug("Optional precondition '%s' soft-failed: %s", pre.check, reason)

    return PreconditionResult(
        passed=True,
        failed_check=None,
        details=extra_dict,
    )
