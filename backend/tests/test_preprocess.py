from __future__ import annotations

import io
import numpy as np
from PIL import Image
import pytest

from app.io.geotiff import (
    calculate_bounds_iou,
    lee_filter,
    percentile_stretch,
    sar_log_transform,
)
from app.tools.preprocess import (
    dehaze_dcp,
    denoise_optical,
    estimate_cloud_fraction,
    preprocess_image,
    reproject_and_align_pair,
)
from app.tools.vqa import _to_pil


def test_percentile_stretch_normal() -> None:
    band = np.array([[10.0, 20.0, 30.0], [40.0, 50.0, 100.0]])
    res = percentile_stretch(band, lo=2.0, hi=98.0)
    assert res.dtype == np.uint8
    assert res.shape == (2, 3)
    assert res.max() == 255
    assert res.min() == 0


def test_percentile_stretch_uniform_and_nan() -> None:
    # Uniform band
    uniform = np.full((10, 10), 42.0)
    res_uniform = percentile_stretch(uniform)
    assert res_uniform.shape == (10, 10)
    assert (res_uniform == 0).all()

    # Band with NaNs and infs
    nan_band = np.array([[np.nan, 100.0], [np.inf, 200.0]])
    res_nan = percentile_stretch(nan_band)
    assert res_nan.dtype == np.uint8
    assert res_nan[0, 1] == 0
    assert res_nan[1, 1] == 255


def test_sar_log_transform() -> None:
    sar_band = np.array([[0.01, 1.0], [10.0, 100.0]], dtype=np.float32)
    res = sar_log_transform(sar_band)
    assert res.dtype == np.uint8
    assert res.shape == (2, 2)
    assert res[1, 1] > res[0, 0]


def test_lee_filter() -> None:
    noisy = np.random.normal(loc=50.0, scale=10.0, size=(30, 30)).astype(np.float32)
    filtered = lee_filter(noisy, window_size=5)
    assert filtered.shape == (30, 30)
    # Variance of filtered image should be reduced compared to raw noise
    assert np.var(filtered) < np.var(noisy)


def test_calculate_bounds_iou() -> None:
    # Identical bounding boxes -> IoU 1.0
    b1 = [0.0, 0.0, 10.0, 10.0]
    b2 = [0.0, 0.0, 10.0, 10.0]
    assert calculate_bounds_iou(b1, b2) == 1.0

    # Half overlap: (5*10) / (100 + 100 - 50) = 50 / 150 = 0.333...
    b3 = [5.0, 0.0, 15.0, 10.0]
    iou = calculate_bounds_iou(b1, b3)
    assert 0.33 < iou < 0.34

    # Disjoint boxes -> IoU 0.0
    b4 = [20.0, 20.0, 30.0, 30.0]
    assert calculate_bounds_iou(b1, b4) == 0.0


def test_estimate_cloud_fraction() -> None:
    # Clear dark ocean image (no clouds)
    clear_img = np.zeros((50, 50, 3), dtype=np.uint8)
    clear_img[:, :, 2] = 80  # Blueish water
    assert estimate_cloud_fraction(clear_img) == 0.0

    # Bright white cloudy image
    cloud_img = np.full((50, 50, 3), 240, dtype=np.uint8)
    assert estimate_cloud_fraction(cloud_img) == 1.0


def test_optical_denoise_and_dehaze() -> None:
    img = np.random.randint(50, 200, size=(20, 20, 3), dtype=np.uint8)
    denoised = denoise_optical(img, method="median", ksize=3)
    assert denoised.shape == (20, 20, 3)
    assert denoised.dtype == np.uint8

    dehazed = dehaze_dcp(img)
    assert dehazed.shape == (20, 20, 3)
    assert dehazed.dtype == np.uint8


def test_preprocess_image_optical_geotiff(sample_geotiff_bytes: bytes) -> None:
    pil_img = preprocess_image(sample_geotiff_bytes, filename="optical.tif")
    assert isinstance(pil_img, Image.Image)
    assert pil_img.mode == "RGB"
    assert pil_img.size == (64, 48)  # (width, height)

    # Dev 2 GeoChat compatibility verification:
    # Dev 2's vqa._to_pil() must successfully ingest the preprocessed image!
    dev2_pil = _to_pil(pil_img)
    assert dev2_pil is not None
    assert dev2_pil.mode == "RGB"


def test_preprocess_image_sar_geotiff(sample_sar_geotiff_bytes: bytes) -> None:
    pil_img = preprocess_image(sample_sar_geotiff_bytes, filename="sar_scene.tif", modality="sar")
    assert isinstance(pil_img, Image.Image)
    assert pil_img.mode == "RGB"
    assert pil_img.size == (64, 48)

    # Dev 2 GeoChat compatibility
    dev2_pil = _to_pil(pil_img)
    assert dev2_pil is not None


def test_preprocess_image_benchmark_png(sample_png_bytes: bytes) -> None:
    pil_img = preprocess_image(sample_png_bytes, filename="benchmark.png", target_size=(128, 128))
    assert isinstance(pil_img, Image.Image)
    assert pil_img.size == (128, 128)


def test_reproject_and_align_pair(
    sample_geotiff_bytes: bytes,
    sample_sar_geotiff_bytes: bytes,
) -> None:
    pil1, pil2, info = reproject_and_align_pair(
        sample_geotiff_bytes,
        sample_sar_geotiff_bytes,
        filename1="opt.tif",
        filename2="sar.tif",
    )
    assert isinstance(pil1, Image.Image)
    assert isinstance(pil2, Image.Image)
    assert pil1.size == pil2.size
    assert info.get("method") in {"rasterio_warp_reproject", "pixel_resample"}
    assert info.get("iou") == 1.0
