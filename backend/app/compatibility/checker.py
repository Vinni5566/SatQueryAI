from __future__ import annotations

from app.io.geotiff import ALLOWED_EXTS, extension_of, is_allowed_filename, preview_from_bytes
from app.schemas import CompatibilityResult, JobType


def check_compatibility(
    job: JobType,
    files: list[tuple[str, bytes]],
) -> CompatibilityResult:
    """Hard gate before any model call. Never raises for validation failures."""
    if job == "ask_scene":
        if len(files) != 1:
            return CompatibilityResult(
                valid=False,
                error="Ask this scene needs exactly one image.",
            )
        filename, data = files[0]
        if not filename or not is_allowed_filename(filename):
            return CompatibilityResult(
                valid=False,
                error="Please use GeoTIFF (.tif/.tiff), or PNG/JPEG for official practice images.",
            )
        try:
            _, meta = preview_from_bytes(data, filename)
        except Exception as exc:  # noqa: BLE001 — surface as compatibility error
            return CompatibilityResult(valid=False, error=str(exc))

        note = None
        if extension_of(filename) not in {".tif", ".tiff"}:
            note = "Benchmark image · no CRS"
        return CompatibilityResult(
            valid=True,
            metadata=meta,
            extras={"note": note} if note else {},
        )

    return CompatibilityResult(valid=False, error=f"Unsupported job: {job}")


def allowed_extensions() -> set[str]:
    return set(ALLOWED_EXTS)
