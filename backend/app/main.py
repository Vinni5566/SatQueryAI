from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.chat.router import router as chat_router
from app.compatibility.checker import check_compatibility
from app.config import get_settings
from app.db import init_db
from app.io.geotiff import preview_from_bytes
from app.schemas import CompatibilityResult, JobType, PreviewResponse
from fastapi import File, Form, HTTPException, UploadFile


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield


settings = get_settings()
app = FastAPI(title="SatQuery API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/preview", response_model=PreviewResponse)
async def preview(file: UploadFile = File(...)) -> PreviewResponse:
    filename = file.filename or "upload.bin"
    data = await file.read()
    try:
        b64, meta = preview_from_bytes(data, filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}") from exc
    return PreviewResponse(preview_png_base64=b64, metadata=meta)


@app.post("/compatibility", response_model=CompatibilityResult)
async def compatibility(
    job: JobType = Form(...),
    file: UploadFile | None = File(None),
    files: list[UploadFile] | None = File(None),
    query: str = Form(""),
) -> CompatibilityResult:
    upload_files: list[tuple[str, bytes]] = []
    if file is not None:
        data = await file.read()
        upload_files.append((file.filename or "upload.bin", data))
    if files:
        for f in files:
            data = await f.read()
            upload_files.append((f.filename or "upload.bin", data))
    return check_compatibility(job, upload_files, query=query)
