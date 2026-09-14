"""Interactive & CLI Verification Script for Dev 1 & Dev 2 Pipeline.

Run this script to verify:
1. Dev 1 Compatibility Checker (metadata, CRS, IoU, modality detection)
2. Dev 1 Satellite Preprocessing (percentile stretch, SAR log scale, cloud estimation)
3. Dev 2 VQA (Visual Question Answering via GeoChat)
4. Dev 2 Visual Grounding (Object localization, bounding box parsing, overlay rendering)

Usage:
  python verify_dev1_dev2.py
  python verify_dev1_dev2.py --image path/to/image.tif --query "What land cover types are present?"
  python verify_dev1_dev2.py --ground "Locate the buildings"
  python verify_dev1_dev2.py --real-geochat --model-path mbzuai-oryx/GeoChat
"""
from __future__ import annotations

import argparse
import io
import os
import sys
from pathlib import Path

# Ensure backend root is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import numpy as np
from PIL import Image

from app.compatibility.checker import check_compatibility
from app.tools.ground import ground
from app.tools.loader import FallbackGeoChat, get_geochat_model, set_geochat_model
from app.tools.preprocess import estimate_cloud_fraction, preprocess_image
from app.tools.vqa import vqa


def create_synthetic_geotiff(filename: str = "synthetic_sentinel2.tif") -> str:
    """Create a sample 3-band GeoTIFF with geospatial metadata for testing if no image is given."""
    import rasterio
    from rasterio.transform import from_origin

    out_path = BACKEND_DIR / filename
    if out_path.exists():
        return str(out_path)

    height, width = 256, 256
    data = np.zeros((3, height, width), dtype=np.float32)
    # Synthetic terrain: green vegetation, blue river, bright urban cluster
    data[0] = 300.0  # Red
    data[1] = 1200.0 # Green (vegetation)
    data[2] = 400.0  # Blue
    # River band (high blue, low red/green)
    data[2, 100:150, :] = 1800.0
    data[0, 100:150, :] = 150.0
    data[1, 100:150, :] = 250.0
    # Urban cluster (high reflectance across all bands)
    data[:, 20:80, 40:100] = 2200.0

    transform = from_origin(77.2090, 28.6139, 0.0001, 0.0001)
    profile = {
        "driver": "GTiff",
        "height": height,
        "width": width,
        "count": 3,
        "dtype": "float32",
        "crs": "EPSG:4326",
        "transform": transform,
    }
    with rasterio.open(out_path, "w", **profile) as dst:
        dst.write(data)

    print(f"[+] Created synthetic GeoTIFF at: {out_path.name}")
    return str(out_path)


def find_default_demo_image() -> str:
    """Look for demo images from GeoChat/demo_images or create a synthetic GeoTIFF."""
    geochat_demos = BACKEND_DIR.parent.parent / "GeoChat" / "demo_images"
    if geochat_demos.exists():
        for name in ["church_183.png", "04133.png", "04444.png"]:
            candidate = geochat_demos / name
            if candidate.exists():
                return str(candidate)
    return create_synthetic_geotiff()


def run_verification(
    image_path: str,
    vqa_query: str = "What land-cover and terrain features are visible in this scene?",
    ground_query: str = "Locate the buildings",
    use_real_geochat: bool = False,
    model_path: str | None = None,
):
    print("=" * 70)
    print("      SatQuery AI — Dev 1 & Dev 2 Pipeline Verification")
    print("=" * 70)

    p = Path(image_path)
    if not p.exists():
        if "synthetic" in str(image_path).lower():
            p = Path(create_synthetic_geotiff())
        else:
            print(f"[!] Error: Image file not found: {image_path}")
            return

    with open(p, "rb") as f:
        image_bytes = f.read()

    print(f"\n[1] Input Image: {p.name} ({len(image_bytes)/1024:.1f} KB)")

    # ─── Step 1: Dev 1 Compatibility Checker ─────────────────────────────────
    print("\n--- STEP 1: Dev 1 Compatibility Check ---")
    compat = check_compatibility("ask_scene", [(p.name, image_bytes)], query=vqa_query)
    print(f"  Valid: {compat.valid}")
    if not compat.valid:
        print(f"  Error: {compat.error}")
        return

    meta = compat.metadata
    print(f"  Format:   {meta.format_kind}")
    print(f"  Size:     {meta.width} x {meta.height} px")
    print(f"  Bands:    {meta.band_count}")
    print(f"  Modality: {meta.modality_guess}")
    print(f"  CRS:      {meta.crs or 'None (Benchmark image / Unprojected)'}")
    if meta.bounds:
        print(f"  Bounds:   {meta.bounds}")
    if compat.extras.get("note"):
        print(f"  Note:     {compat.extras['note']}")

    # ─── Step 2: Dev 1 Satellite Preprocessing ──────────────────────────────
    print("\n--- STEP 2: Dev 1 Preprocessing Pipeline ---")
    preprocessed_pil = preprocess_image(image_bytes, filename=p.name)
    cloud_pct = estimate_cloud_fraction(preprocessed_pil)
    print(f"  Preprocessed Size:  {preprocessed_pil.size}")
    print(f"  Color Mode:         {preprocessed_pil.mode}")
    print(f"  Cloud Cover Est:    {cloud_pct * 100:.1f}%")

    out_pre_path = BACKEND_DIR / "output_dev1_preprocessed.png"
    preprocessed_pil.save(out_pre_path)
    print(f"  Saved preprocessed preview to: {out_pre_path.name}")

    # ─── Step 3: GeoChat Model Setup ─────────────────────────────────────────
    print("\n--- STEP 3: Dev 2 GeoChat Model Loading ---")
    if use_real_geochat:
        print(f"  Attempting to load real GeoChat weights from: {model_path or 'mbzuai-oryx/GeoChat'}")
        os.environ["GEOCHAT_ENABLE_REMOTE_DOWNLOAD"] = "1"
        chat = get_geochat_model(model_path=model_path, allow_fallback=False)
        if chat is None:
            print("  [!] Could not load real weights (GPU/weights missing). Falling back to smart assistant.")
            chat = FallbackGeoChat(device="cpu")
            set_geochat_model(chat)
    else:
        print("  Running with Smart Remote-Sensing Assistant (Instant, CPU/demo mode).")
        chat = FallbackGeoChat(device="cpu")
        set_geochat_model(chat)

    # ─── Step 4: Dev 2 VQA Execution ─────────────────────────────────────────
    print("\n--- STEP 4: Dev 2 VQA (Visual Question Answering) ---")
    print(f"  Question: '{vqa_query}'")
    vqa_out = vqa(preprocessed_pil, vqa_query)
    print(f"  Answer:   {vqa_out.text}")

    # ─── Step 5: Dev 2 Visual Grounding Execution ────────────────────────────
    print("\n--- STEP 5: Dev 2 Visual Grounding ---")
    print(f"  Grounding Query: '{ground_query}'")
    ground_out = ground(preprocessed_pil, ground_query)
    print(f"  Raw Text:        {ground_out.text}")

    if ground_out.overlay is not None:
        out_overlay_path = BACKEND_DIR / "output_dev2_grounding_overlay.png"
        with open(out_overlay_path, "wb") as f:
            f.write(ground_out.overlay)
        print(f"  [SUCCESS] Visual overlay saved to: {out_overlay_path.name}")
        print("  -> You can open 'output_dev2_grounding_overlay.png' to see the drawn bounding boxes!")
    else:
        print("  [INFO] No bounding boxes detected for this specific prompt.")

    print("\n" + "=" * 70)
    print("      Verification Completed Successfully (Dev 1 + Dev 2 Integrated)")
    print("=" * 70)


def main():
    parser = argparse.ArgumentParser(description="Verify Dev 1 & Dev 2 integration in SatQuery AI")
    parser.add_argument("--image", type=str, default=None, help="Path to satellite image (GeoTIFF, PNG, JPG)")
    parser.add_argument("--query", type=str, default="What land cover types and structures are present?", help="VQA question")
    parser.add_argument("--ground", type=str, default="Locate the buildings", help="Grounding query")
    parser.add_argument("--real-geochat", action="store_true", help="Attempt loading real GeoChat weights (requires GPU/weights)")
    parser.add_argument("--model-path", type=str, default=None, help="Path or HuggingFace ID for GeoChat weights")
    parser.add_argument("--geochat-url", type=str, default=None, help="URL to Colab/Cloud GeoChat GPU server (e.g. https://xxx.trycloudflare.com)")
    args = parser.parse_args()

    if args.geochat_url:
        os.environ["GEOCHAT_API_URL"] = args.geochat_url

    image_path = args.image or find_default_demo_image()
    run_verification(
        image_path=image_path,
        vqa_query=args.query,
        ground_query=args.ground,
        use_real_geochat=args.real_geochat or bool(args.geochat_url),
        model_path=args.model_path,
    )


if __name__ == "__main__":
    main()
