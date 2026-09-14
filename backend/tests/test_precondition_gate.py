from __future__ import annotations

import pytest

from app.orchestrator.precondition_gate import check_preconditions
from app.schemas import ImageMetadata, Precondition


def test_precondition_gate_empty() -> None:
    meta = ImageMetadata(
        width=100,
        height=100,
        band_count=3,
        format_kind="geotiff",
    )
    res = check_preconditions([], meta)
    assert res.passed is True
    assert res.failed_check is None


def test_precondition_gate_iou_pass() -> None:
    m1 = ImageMetadata(
        width=100,
        height=100,
        band_count=3,
        crs="EPSG:4326",
        bounds=[0.0, 0.0, 1.0, 1.0],
        format_kind="geotiff",
    )
    m2 = ImageMetadata(
        width=100,
        height=100,
        band_count=3,
        crs="EPSG:4326",
        bounds=[0.0, 0.0, 1.0, 1.0],
        format_kind="geotiff",
    )
    pre = Precondition(check="iou_overlap", required=True, params={"min_iou": 0.8})
    res = check_preconditions([pre], [m1, m2])
    assert res.passed is True
    assert res.details.get("iou") == 1.0


def test_precondition_gate_iou_fail() -> None:
    m1 = ImageMetadata(
        width=100,
        height=100,
        band_count=3,
        crs="EPSG:4326",
        bounds=[0.0, 0.0, 1.0, 1.0],
        format_kind="geotiff",
    )
    # 50% shift -> IoU ~0.33 < 0.8
    m2 = ImageMetadata(
        width=100,
        height=100,
        band_count=3,
        crs="EPSG:4326",
        bounds=[0.5, 0.0, 1.5, 1.0],
        format_kind="geotiff",
    )
    pre = Precondition(check="iou_overlap", required=True, params={"min_iou": 0.8})
    res = check_preconditions([pre], [m1, m2])
    assert res.passed is False
    assert "IoU" in (res.failed_check or "")


def test_precondition_gate_modality_match() -> None:
    m_opt = ImageMetadata(
        width=100,
        height=100,
        band_count=3,
        modality_guess="optical",
        format_kind="geotiff",
    )
    m_sar = ImageMetadata(
        width=100,
        height=100,
        band_count=1,
        modality_guess="sar",
        format_kind="geotiff",
    )

    # Expected 'both' (fusion)
    pre_both = Precondition(check="modality_match", required=True, params={"expected": "both"})
    assert check_preconditions([pre_both], [m_opt, m_sar]).passed is True
    assert check_preconditions([pre_both], [m_opt, m_opt]).passed is False

    # Expected 'same' (change detection)
    pre_same = Precondition(check="modality_match", required=True, params={"expected": "same"})
    assert check_preconditions([pre_same], [m_opt, m_opt]).passed is True
    assert check_preconditions([pre_same], [m_opt, m_sar]).passed is False


def test_precondition_gate_crs_present() -> None:
    m_with_crs = ImageMetadata(
        width=100,
        height=100,
        band_count=3,
        crs="EPSG:32633",
        format_kind="geotiff",
    )
    m_no_crs = ImageMetadata(
        width=100,
        height=100,
        band_count=3,
        crs=None,
        format_kind="raster",
    )
    pre = Precondition(check="crs_present", required=True)
    assert check_preconditions([pre], m_with_crs).passed is True
    res = check_preconditions([pre], m_no_crs)
    assert res.passed is False
    assert "CRS" in (res.failed_check or "")


def test_precondition_gate_min_dimensions() -> None:
    m_small = ImageMetadata(
        width=8,
        height=8,
        band_count=3,
        format_kind="geotiff",
    )
    pre = Precondition(check="min_dimensions", required=True, params={"min_width": 16, "min_height": 16})
    res = check_preconditions([pre], m_small)
    assert res.passed is False
    assert "resolution" in (res.failed_check or "").lower()


def test_precondition_gate_cloud_fraction_limit() -> None:
    m = ImageMetadata(width=100, height=100, band_count=3, format_kind="geotiff")
    pre = Precondition(check="cloud_fraction_limit", required=True, params={"max_cloud": 0.3})

    # Clear image (cloud fraction 0.1)
    res_clear = check_preconditions([pre], m, extras={"cloud_fraction": 0.1})
    assert res_clear.passed is True

    # Heavily cloudy image (cloud fraction 0.8)
    res_cloud = check_preconditions([pre], m, extras={"cloud_fraction": 0.8})
    assert res_cloud.passed is False
    assert "cloud" in (res_cloud.failed_check or "").lower()


def test_precondition_gate_soft_failure() -> None:
    m = ImageMetadata(width=8, height=8, band_count=3, format_kind="geotiff")
    # required=False -> should not cause gate to fail
    pre_optional = Precondition(check="min_dimensions", required=False, params={"min_width": 16, "min_height": 16})
    res = check_preconditions([pre_optional], m)
    assert res.passed is True
