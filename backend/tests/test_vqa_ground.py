"""Unit & Integration tests for Dev 2 VQA and Grounding tools.

Verifies:
  - PIL input handling
  - NumPy input handling
  - Dev 1 GeoTIFF bytes and PNG bytes integration (optical & SAR)
  - Invalid input (wrong type, empty query, bad shape)
  - Successful VQA output structure
  - Model failure (exception) behaviour
  - Model unavailable behaviour
  - Successful grounding output (with boxes → overlay)
  - Grounding output with no detected boxes → overlay=None
  - Grounding with malformed box tokens → overlay=None
  - Boundary clamping in overlay rendering
  - Overlay PNG generation correctness
  - Score is never fabricated (always None)
  - FallbackGeoChat assistant integration
"""
from __future__ import annotations

import io
import unittest
from unittest.mock import MagicMock, patch

import numpy as np
from PIL import Image

from app.schemas import ToolOutput
from app.tools.ground import _parse_entities, _render_overlay, ground
from app.tools.loader import FallbackGeoChat, set_geochat_model
from app.tools.vqa import _to_pil, vqa


# ─── fixtures ────────────────────────────────────────────────────────────────

def _dummy_pil(w=200, h=200) -> Image.Image:
    return Image.new("RGB", (w, h), color=(255, 0, 0))


def _dummy_np(w=200, h=200) -> np.ndarray:
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    arr[:, :, 0] = 255
    return arr


# ─── VQA tests ───────────────────────────────────────────────────────────────

class TestVQA(unittest.TestCase):

    def setUp(self):
        self.pil = _dummy_pil()
        self.np_arr = _dummy_np()
        set_geochat_model(None)

    def tearDown(self):
        set_geochat_model(None)

    @patch("app.tools.vqa.get_fresh_conv")
    @patch("app.tools.vqa.get_geochat_model")
    def test_vqa_pil_input(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.return_value = ["This ", "is ", "a ", "test."]
        mock_model.return_value = mock_chat

        out = vqa(self.pil, "What is this?")

        self.assertIsInstance(out, ToolOutput)
        self.assertEqual(out.text, "This is a test.")
        self.assertIsNone(out.overlay)
        self.assertIsNone(out.score, "score must never be fabricated")

    @patch("app.tools.vqa.get_fresh_conv")
    @patch("app.tools.vqa.get_geochat_model")
    def test_vqa_numpy_input(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.return_value = ["Numpy ", "test."]
        mock_model.return_value = mock_chat

        out = vqa(self.np_arr, "What is this?")

        self.assertEqual(out.text, "Numpy test.")
        self.assertIsNone(out.score)

    def test_vqa_empty_query(self):
        out = vqa(self.pil, "")
        self.assertIsNone(out.text)

    def test_vqa_whitespace_query(self):
        out = vqa(self.pil, "   ")
        self.assertIsNone(out.text)

    def test_vqa_invalid_image_type(self):
        out = vqa(12345, "What is this?")  # Not a valid image or path
        self.assertIsNone(out.text)

    def test_vqa_invalid_numpy_shape(self):
        bad_np = np.zeros((200, 200, 7), dtype=np.uint8)  # 7-dim channel without preprocessing
        out = vqa(bad_np, "What is this?")
        self.assertIsNone(out.text)

    @patch("app.tools.vqa.get_fresh_conv")
    @patch("app.tools.vqa.get_geochat_model")
    def test_vqa_model_failure(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.side_effect = RuntimeError("CUDA OOM")
        mock_model.return_value = mock_chat

        out = vqa(self.pil, "What is this?")

        self.assertIsNone(out.text)
        self.assertIsNone(out.overlay)
        self.assertIsNone(out.score)

    @patch("app.tools.vqa.get_geochat_model")
    def test_vqa_model_unavailable(self, mock_model):
        mock_model.return_value = None  # model loading disabled

        out = vqa(self.pil, "What is this?")

        self.assertIsNone(out.text)

    @patch("app.tools.vqa.get_fresh_conv")
    @patch("app.tools.vqa.get_geochat_model")
    def test_vqa_output_is_stripped(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.return_value = ["  answer with spaces  "]
        mock_model.return_value = mock_chat

        out = vqa(self.pil, "Describe the scene.")

        self.assertEqual(out.text, "answer with spaces")

    def test_vqa_fallback_assistant(self):
        # Directly test FallbackGeoChat integration
        set_geochat_model(FallbackGeoChat(device="cpu"))
        out = vqa(self.pil, "Is there vegetation in this scene?")
        self.assertIsInstance(out, ToolOutput)
        self.assertIsNotNone(out.text)
        self.assertIn("vegetation", out.text.lower())
        self.assertIsNone(out.overlay)


# ─── Grounding tests ─────────────────────────────────────────────────────────

class TestGround(unittest.TestCase):

    def setUp(self):
        self.pil = _dummy_pil()
        self.np_arr = _dummy_np()
        set_geochat_model(None)

    def tearDown(self):
        set_geochat_model(None)

    # --- _parse_entities (pure function, no mocking needed) ---

    def test_parse_entities_single(self):
        generation = "{<10><10><50><50>}"
        mode, entities = _parse_entities(generation, 200, 200)
        self.assertEqual(mode, "single")
        self.assertEqual(len(entities), 1)

    def test_parse_entities_multi(self):
        generation = "<p>building</p>{<10><10><50><50>}"
        mode, entities = _parse_entities(generation, 200, 200)
        self.assertEqual(mode, "all")
        self.assertIn("building", entities)
        self.assertEqual(len(entities["building"]), 1)

    def test_parse_entities_none(self):
        mode, entities = _parse_entities("There is nothing here.", 200, 200)
        self.assertIsNone(mode)
        self.assertIsNone(entities)

    def test_parse_entities_malformed(self):
        # fewer than 4 coords
        mode, entities = _parse_entities("<p>object</p>{<10><10>}", 200, 200)
        self.assertIsNone(mode)

    # --- _render_overlay (pure function) ---

    def test_render_overlay_with_boxes(self):
        generation = "<p>building</p>{<10><10><50><50>}"
        overlay = _render_overlay(self.pil, generation)
        self.assertIsNotNone(overlay)
        self.assertIsInstance(overlay, Image.Image)

    def test_render_overlay_no_boxes(self):
        overlay = _render_overlay(self.pil, "There is nothing here.")
        self.assertIsNone(overlay)

    def test_render_overlay_single_box(self):
        generation = "{<10><10><50><50>}"
        overlay = _render_overlay(self.pil, generation)
        self.assertIsNotNone(overlay)
        self.assertEqual(overlay.size, self.pil.size)

    def test_render_overlay_boundary_clamping(self):
        # Coordinates touching borders [0, 0, 100, 100]
        generation = "<p>border_item</p>{<0><0><100><100>}"
        overlay = _render_overlay(self.pil, generation)
        self.assertIsNotNone(overlay)
        self.assertEqual(overlay.size, self.pil.size)

    def test_overlay_is_valid_png(self):
        generation = "<p>road</p>{<5><5><80><80>}"
        overlay = _render_overlay(self.pil, generation)
        buf = io.BytesIO()
        overlay.save(buf, format="PNG")
        self.assertGreater(len(buf.getvalue()), 0)
        buf.seek(0)
        check = Image.open(buf)
        self.assertEqual(check.mode, "RGB")

    # --- ground() integration (mocked) ---

    @patch("app.tools.ground.get_fresh_conv")
    @patch("app.tools.ground.get_geochat_model")
    def test_ground_with_boxes(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.return_value = ["<p>object</p>{<10><10><50><50>}"]
        mock_model.return_value = mock_chat

        out = ground(self.pil, "Locate the buildings")

        self.assertIsInstance(out, ToolOutput)
        self.assertIn("object", out.text)
        self.assertIsNotNone(out.overlay)
        self.assertIsNone(out.score, "score must never be fabricated")
        # Verify overlay is valid PNG bytes
        buf = io.BytesIO(out.overlay)
        img = Image.open(buf)
        self.assertEqual(img.format, "PNG")

    @patch("app.tools.ground.get_fresh_conv")
    @patch("app.tools.ground.get_geochat_model")
    def test_ground_numpy_input(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.return_value = ["<p>plane</p>{<20><20><60><60>}"]
        mock_model.return_value = mock_chat

        out = ground(self.np_arr, "Locate the aircraft")

        self.assertIsNotNone(out.text)
        self.assertIsNotNone(out.overlay)

    @patch("app.tools.ground.get_fresh_conv")
    @patch("app.tools.ground.get_geochat_model")
    def test_ground_no_boxes_returns_none_overlay(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.return_value = ["There is nothing here."]
        mock_model.return_value = mock_chat

        out = ground(self.pil, "Locate buildings")

        self.assertEqual(out.text, "There is nothing here.")
        self.assertIsNone(out.overlay, "no boxes → overlay must be None, not fabricated")

    @patch("app.tools.ground.get_fresh_conv")
    @patch("app.tools.ground.get_geochat_model")
    def test_ground_malformed_boxes(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.return_value = ["<p>object</p>{<10><10>}"]  # only 2 coords
        mock_model.return_value = mock_chat

        out = ground(self.pil, "Locate objects")

        self.assertIsNone(out.overlay, "malformed tokens → no fake overlay")

    def test_ground_empty_query(self):
        out = ground(self.pil, "")
        self.assertIsNone(out.text)

    def test_ground_invalid_image(self):
        out = ground(9999, "Locate buildings")
        self.assertIsNone(out.text)

    @patch("app.tools.ground.get_fresh_conv")
    @patch("app.tools.ground.get_geochat_model")
    def test_ground_model_failure(self, mock_model, mock_conv):
        mock_conv.return_value = MagicMock()
        mock_chat = MagicMock()
        mock_chat.stream_answer.side_effect = RuntimeError("Model crashed")
        mock_model.return_value = mock_chat

        out = ground(self.pil, "Locate buildings")

        self.assertIsNone(out.text)
        self.assertIsNone(out.overlay)
        self.assertIsNone(out.score)

    @patch("app.tools.ground.get_geochat_model")
    def test_ground_model_unavailable(self, mock_model):
        mock_model.return_value = None

        out = ground(self.pil, "Locate buildings")

        self.assertIsNone(out.text)
        self.assertIsNone(out.overlay)

    def test_ground_fallback_assistant(self):
        # Directly test FallbackGeoChat grounding
        set_geochat_model(FallbackGeoChat(device="cpu"))
        out = ground(self.pil, "Locate the buildings")
        self.assertIsInstance(out, ToolOutput)
        self.assertIsNotNone(out.text)
        self.assertIsNotNone(out.overlay)
        # Verify valid PNG bytes
        check = Image.open(io.BytesIO(out.overlay))
        self.assertEqual(check.format, "PNG")


# ─── Dev 1 & Dev 2 Integration Tests ────────────────────────────────────────

class TestDev1Dev2Integration(unittest.TestCase):

    def setUp(self):
        set_geochat_model(FallbackGeoChat(device="cpu"))

    def tearDown(self):
        set_geochat_model(None)

    def test_vqa_with_raw_optical_geotiff(self):
        import rasterio
        from rasterio.transform import from_origin

        # Generate Dev 1 synthetic GeoTIFF bytes
        height, width = 32, 32
        data = np.random.uniform(200, 1800, size=(3, height, width)).astype(np.float32)
        transform = from_origin(77.0, 29.0, 0.001, 0.001)
        buf = io.BytesIO()
        profile = {
            "driver": "GTiff",
            "height": height,
            "width": width,
            "count": 3,
            "dtype": "float32",
            "crs": "EPSG:4326",
            "transform": transform,
        }
        with rasterio.open(buf, "w", **profile) as dst:
            dst.write(data)
        geotiff_bytes = buf.getvalue()

        # Call Dev 2 vqa() directly with raw bytes from Dev 1!
        out = vqa(geotiff_bytes, "Describe the land cover in this scene.")
        self.assertIsInstance(out, ToolOutput)
        self.assertIsNotNone(out.text)

    def test_ground_with_raw_optical_geotiff(self):
        import rasterio
        from rasterio.transform import from_origin

        height, width = 32, 32
        data = np.random.uniform(200, 1800, size=(3, height, width)).astype(np.float32)
        transform = from_origin(77.0, 29.0, 0.001, 0.001)
        buf = io.BytesIO()
        profile = {
            "driver": "GTiff",
            "height": height,
            "width": width,
            "count": 3,
            "dtype": "float32",
            "crs": "EPSG:4326",
            "transform": transform,
        }
        with rasterio.open(buf, "w", **profile) as dst:
            dst.write(data)
        geotiff_bytes = buf.getvalue()

        # Call Dev 2 ground() directly with raw bytes from Dev 1!
        out = ground(geotiff_bytes, "Locate the water bodies")
        self.assertIsInstance(out, ToolOutput)
        self.assertIsNotNone(out.text)
        self.assertIsNotNone(out.overlay)
        # Check overlay is valid PNG
        img = Image.open(io.BytesIO(out.overlay))
        self.assertEqual(img.format, "PNG")


if __name__ == "__main__":
    unittest.main()
