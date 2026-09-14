from __future__ import annotations

from fastapi.testclient import TestClient

from app.compatibility.checker import check_compatibility
from app.main import app

client = TestClient(app)


def test_ask_scene_requires_one_file() -> None:
    result = check_compatibility("ask_scene", [])
    assert result.valid is False
    assert result.error is not None


def test_ask_scene_accepts_png(sample_png_bytes: bytes) -> None:
    result = check_compatibility("ask_scene", [("bench.png", sample_png_bytes)])
    assert result.valid is True
    assert result.metadata is not None
    assert result.extras.get("note")


def test_ask_scene_accepts_geotiff(sample_geotiff_bytes: bytes) -> None:
    result = check_compatibility("ask_scene", [("scene.tif", sample_geotiff_bytes)])
    assert result.valid is True
    assert result.metadata is not None
    assert result.metadata.format_kind == "geotiff"


def test_ask_scene_accepts_sar_geotiff(sample_sar_geotiff_bytes: bytes) -> None:
    result = check_compatibility("ask_scene", [("sar_scene.tif", sample_sar_geotiff_bytes)])
    assert result.valid is True
    assert result.metadata is not None
    assert result.metadata.modality_guess == "sar"


def test_before_after_matching_optical_geotiff(sample_geotiff_bytes: bytes) -> None:
    result = check_compatibility(
        "before_after",
        [("t1.tif", sample_geotiff_bytes), ("t2.tif", sample_geotiff_bytes)],
    )
    assert result.valid is True
    assert isinstance(result.metadata, list)
    assert len(result.metadata) == 2
    assert result.extras.get("iou") == 1.0


def test_before_after_fails_on_insufficient_iou(
    sample_geotiff_bytes: bytes,
    sample_offset_geotiff_bytes: bytes,
) -> None:
    result = check_compatibility(
        "before_after",
        [("t1.tif", sample_geotiff_bytes), ("t2_offset.tif", sample_offset_geotiff_bytes)],
    )
    assert result.valid is False
    assert "IoU" in (result.error or "")


def test_before_after_fails_on_modality_mismatch(
    sample_geotiff_bytes: bytes,
    sample_sar_geotiff_bytes: bytes,
) -> None:
    result = check_compatibility(
        "before_after",
        [("optical.tif", sample_geotiff_bytes), ("sar.tif", sample_sar_geotiff_bytes)],
    )
    assert result.valid is False
    assert "modality" in (result.error or "").lower()


def test_before_after_accepts_benchmark_pngs(sample_png_bytes: bytes) -> None:
    result = check_compatibility(
        "before_after",
        [("t1.png", sample_png_bytes), ("t2.png", sample_png_bytes)],
    )
    assert result.valid is True
    assert "Benchmark" in result.extras.get("note", "")


def test_fusion_accepts_optical_and_sar(
    sample_geotiff_bytes: bytes,
    sample_sar_geotiff_bytes: bytes,
) -> None:
    result = check_compatibility(
        "fusion",
        [("optical.tif", sample_geotiff_bytes), ("sar.tif", sample_sar_geotiff_bytes)],
    )
    assert result.valid is True
    assert isinstance(result.metadata, list)
    assert result.extras.get("iou") == 1.0


def test_fusion_fails_on_two_opticals(sample_geotiff_bytes: bytes) -> None:
    result = check_compatibility(
        "fusion",
        [("opt1.tif", sample_geotiff_bytes), ("opt2.tif", sample_geotiff_bytes)],
    )
    assert result.valid is False
    assert "fusion requires 1 optical" in (result.error or "").lower()


def test_compatibility_endpoint_png(sample_png_bytes: bytes) -> None:
    res = client.post(
        "/compatibility",
        data={"job": "ask_scene"},
        files={"file": ("bench.png", sample_png_bytes, "image/png")},
    )
    assert res.status_code == 200
    assert res.json()["valid"] is True


def test_compatibility_endpoint_missing_file() -> None:
    res = client.post(
        "/compatibility",
        data={"job": "ask_scene"},
    )
    assert res.status_code == 200
    assert res.json()["valid"] is False


def test_compatibility_endpoint_multi_files(
    sample_geotiff_bytes: bytes,
    sample_sar_geotiff_bytes: bytes,
) -> None:
    res = client.post(
        "/compatibility",
        data={"job": "fusion"},
        files=[
            ("files", ("opt.tif", sample_geotiff_bytes, "image/tiff")),
            ("files", ("sar.tif", sample_sar_geotiff_bytes, "image/tiff")),
        ],
    )
    assert res.status_code == 200
    assert res.json()["valid"] is True
