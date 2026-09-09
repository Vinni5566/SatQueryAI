from __future__ import annotations

import base64

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_preview_png(sample_png_bytes: bytes) -> None:
    res = client.post(
        "/preview",
        files={"file": ("bench.png", sample_png_bytes, "image/png")},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["metadata"]["format_kind"] == "raster"
    assert body["metadata"]["width"] == 32
    raw = base64.b64decode(body["preview_png_base64"])
    assert raw[:8] == b"\x89PNG\r\n\x1a\n"


def test_preview_geotiff(sample_geotiff_bytes: bytes) -> None:
    res = client.post(
        "/preview",
        files={"file": ("scene.tif", sample_geotiff_bytes, "image/tiff")},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["metadata"]["format_kind"] == "geotiff"
    assert body["metadata"]["crs"] is not None
    assert body["metadata"]["modality_guess"] == "optical"
    raw = base64.b64decode(body["preview_png_base64"])
    assert raw[:8] == b"\x89PNG\r\n\x1a\n"


def test_preview_rejects_bad_extension() -> None:
    res = client.post(
        "/preview",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert res.status_code == 400
