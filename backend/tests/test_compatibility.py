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
