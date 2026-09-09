# SatQuery Python API (Dev 1 — GeoTIFF I/O + preview)

## Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `POST /preview` — multipart `file` → preview PNG + metadata
- `POST /compatibility` — multipart `file` + form `job=ask_scene`

Accepted: `.tif` `.tiff` (preferred), `.png` `.jpg` `.jpeg` (benchmark only).
