from __future__ import annotations

import base64
import io
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

from app.schemas import FormatKind, ImageMetadata, ModalityGuess

GEOTIFF_EXTS = {".tif", ".tiff"}
RASTER_EXTS = {".png", ".jpg", ".jpeg"}
ALLOWED_EXTS = GEOTIFF_EXTS | RASTER_EXTS
MAX_UPLOAD_BYTES = 80 * 1024 * 1024


def extension_of(filename: str) -> str:
    return Path(filename).suffix.lower()


def is_allowed_filename(filename: str) -> bool:
    return extension_of(filename) in ALLOWED_EXTS


def percentile_stretch(
    band: np.ndarray,
    lo: float = 2.0,
    hi: float = 98.0,
) -> np.ndarray:
    """Dynamic percentile stretch (default 2% - 98%) as standard in BigEarthNet/reBEN.

    Scales values to [0, 255] uint8 array. Handles NaNs, infinities, and uniform arrays.
    """
    finite = band[np.isfinite(band)]
    if finite.size == 0:
        return np.zeros_like(band, dtype=np.uint8)
    p_lo, p_hi = np.percentile(finite, [lo, hi])
    if p_hi <= p_lo:
        # Avoid division by zero when band has uniform intensity
        return np.zeros_like(band, dtype=np.uint8)
    scaled = (band - p_lo) / (p_hi - p_lo)
    scaled = np.nan_to_num(scaled, nan=0.0, posinf=1.0, neginf=0.0)
    scaled = np.clip(scaled, 0.0, 1.0)
    return (scaled * 255.0).astype(np.uint8)


# Alias for internal backwards compatibility
_percentile_stretch = percentile_stretch


def sar_log_transform(band: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    """Mandatory SAR log-scale dB conversion: 10 * log10(max(arr, 0) + eps) followed by stretch."""
    arr = np.maximum(band.astype(np.float64), 0.0)
    log_arr = 10.0 * np.log10(arr + eps)
    return percentile_stretch(log_arr, lo=2.0, hi=98.0)


_sar_log_preview = sar_log_transform


def lee_filter(band: np.ndarray, window_size: int = 5) -> np.ndarray:
    """Classical Lee filter for SAR speckle noise reduction.

    Pure NumPy implementation without heavy external dependencies.
    """
    if band.ndim != 2:
        return band

    band_f = band.astype(np.float64)
    r = window_size // 2
    pad = np.pad(band_f, r, mode="reflect")

    # Compute moving window statistics
    out = np.zeros_like(band_f)
    h, w = band_f.shape

    for y in range(h):
        y_min = y
        y_max = y + 2 * r + 1
        for x in range(w):
            x_min = x
            x_max = x + 2 * r + 1
            win = pad[y_min:y_max, x_min:x_max]
            mean = np.mean(win)
            var = np.var(win)
            if var < 1e-8:
                out[y, x] = mean
            else:
                noise_var = var * 0.5
                k = (var - noise_var) / var
                k = max(0.0, min(1.0, k))
                out[y, x] = mean + k * (band_f[y, x] - mean)

    return out.astype(band.dtype)


def calculate_bounds_iou(bounds1: list[float] | None, bounds2: list[float] | None) -> float:
    """Calculate Intersection-over-Union (IoU) of two bounding boxes in format [left, bottom, right, top]."""
    if not bounds1 or not bounds2 or len(bounds1) != 4 or len(bounds2) != 4:
        return 0.0

    b1_left, b1_bottom, b1_right, b1_top = bounds1
    b2_left, b2_bottom, b2_right, b2_top = bounds2

    inter_left = max(b1_left, b2_left)
    inter_bottom = max(b1_bottom, b2_bottom)
    inter_right = min(b1_right, b2_right)
    inter_top = min(b1_top, b2_top)

    if inter_right <= inter_left or inter_top <= inter_bottom:
        return 0.0

    inter_area = (inter_right - inter_left) * (inter_top - inter_bottom)
    area1 = (b1_right - b1_left) * (b1_top - b1_bottom)
    area2 = (b2_right - b2_left) * (b2_top - b2_bottom)

    if area1 <= 0 or area2 <= 0:
        return 0.0

    union_area = area1 + area2 - inter_area
    if union_area <= 0:
        return 0.0

    return float(inter_area / union_area)


def _guess_modality(band_count: int, dtype: np.dtype, filename: str = "") -> ModalityGuess:
    fn = filename.lower()
    if any(k in fn for k in ["sar", "s1", "vv", "vh", "radar", "sentinel1"]):
        return "sar"
    if any(k in fn for k in ["optical", "s2", "rgb", "sentinel2", "landsat"]):
        return "optical"

    if band_count == 1 and np.issubdtype(dtype, np.floating):
        return "sar"
    if band_count >= 3:
        return "optical"
    if band_count == 1:
        return "sar"
    return "unknown"


def _png_base64(rgb: np.ndarray) -> str:
    if rgb.ndim == 2:
        img = Image.fromarray(rgb, mode="L").convert("RGB")
    else:
        img = Image.fromarray(rgb, mode="RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def read_geotiff(
    data: bytes,
    filename: str = "image.tif",
    max_side: int | None = 1024,
) -> tuple[np.ndarray, ImageMetadata]:
    """Read a GeoTIFF from raw bytes using rasterio, extracting full metadata and pixel array.

    Returns:
        (array, metadata) where array is shape (bands, H, W)
    """
    import rasterio
    from rasterio.io import MemoryFile

    with MemoryFile(data) as mem:
        with mem.open() as ds:
            count = ds.count
            height, width = ds.height, ds.width
            crs = str(ds.crs) if ds.crs else None
            bounds = None
            if ds.bounds is not None:
                b = ds.bounds
                bounds = [float(b.left), float(b.bottom), float(b.right), float(b.top)]

            transform = None
            if ds.transform is not None:
                transform = [float(val) for val in ds.transform[:6]]

            resolution = None
            if ds.res is not None:
                resolution = [float(ds.res[0]), float(ds.res[1])]

            driver = ds.driver

            # Resampling if max_side is set and image exceeds it
            if max_side is not None and (height > max_side or width > max_side):
                scale = max(height / max_side, width / max_side, 1.0)
                out_h = max(1, int(height / scale))
                out_w = max(1, int(width / scale))
                arr = ds.read(
                    out_shape=(count, out_h, out_w),
                    resampling=rasterio.enums.Resampling.bilinear,
                )
            else:
                arr = ds.read()

            modality = _guess_modality(
                count,
                ds.dtypes[0] if count else np.dtype("float32"),
                filename=filename,
            )

            meta = ImageMetadata(
                width=width,
                height=height,
                band_count=count,
                crs=crs,
                bounds=bounds,
                transform=transform,
                resolution=resolution,
                driver=driver,
                modality_guess=modality,
                format_kind="geotiff",
                filename=filename,
            )
            return arr, meta


def preview_from_bytes(data: bytes, filename: str) -> tuple[str, ImageMetadata]:
    """Generate a base64-encoded PNG preview and ImageMetadata from file bytes."""
    if len(data) > MAX_UPLOAD_BYTES:
        raise ValueError("File too large (max 80 MB).")
    if not is_allowed_filename(filename):
        raise ValueError(
            "Unsupported file type. Use GeoTIFF (.tif/.tiff), or PNG/JPEG for benchmark images."
        )

    ext = extension_of(filename)
    if ext in RASTER_EXTS:
        return _preview_pillow(data, filename)
    return _preview_rasterio(data, filename)


def _preview_pillow(data: bytes, filename: str) -> tuple[str, ImageMetadata]:
    img = Image.open(io.BytesIO(data))
    img = img.convert("RGB")
    arr = np.asarray(img)
    h, w = arr.shape[0], arr.shape[1]
    meta = ImageMetadata(
        width=w,
        height=h,
        band_count=3,
        crs=None,
        bounds=None,
        modality_guess="optical",
        format_kind="raster",
        filename=filename,
    )
    return _png_base64(arr), meta


def _preview_rasterio(data: bytes, filename: str) -> tuple[str, ImageMetadata]:
    arr, meta = read_geotiff(data, filename=filename, max_side=1024)
    count = meta.band_count
    modality = meta.modality_guess

    if count >= 3:
        # Prefer RGB-ish first three bands (e.g. B04, B03, B02 in S2)
        bands = []
        for i in range(min(3, count)):
            bands.append(percentile_stretch(arr[i].astype(np.float64)))
        rgb = np.stack(bands, axis=-1)
        modality = "optical"
    else:
        band = arr[0]
        gray = sar_log_transform(band) if modality == "sar" else percentile_stretch(band.astype(np.float64))
        rgb = np.stack([gray, gray, gray], axis=-1)

    meta.modality_guess = modality
    return _png_base64(rgb), meta
