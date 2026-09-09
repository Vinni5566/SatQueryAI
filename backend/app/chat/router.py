from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.clerk import AuthUser, get_current_user
from app.chat import service
from app.config import Settings, get_settings
from app.db import get_db
from app.llm.gemini import ChatLLM, get_llm
from app.schemas_chat import (
    MessageCreate,
    MessageOut,
    SendMessageResponse,
    SessionCreate,
    SessionListItem,
    SessionOut,
    SessionUpdate,
    UploadAssetResponse,
)
from app.storage.gcs import ObjectStorage, get_storage

router = APIRouter(tags=["chat"])


def _storage() -> ObjectStorage:
    try:
        return get_storage()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=503,
            detail=f"Object storage unavailable: {exc}",
        ) from exc


def _llm() -> ChatLLM:
    return get_llm()


@router.post("/sessions", response_model=SessionOut)
async def create_session(
    body: SessionCreate,
    user: Annotated[AuthUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SessionOut:
    session = await service.create_session(
        db, user.clerk_user_id, title=body.title, job_type=body.job_type
    )
    return SessionOut(
        id=session.id,
        title=session.title,
        job_type=session.job_type,
        created_at=session.created_at,
        updated_at=session.updated_at,
        assets=[],
    )


@router.get("/sessions", response_model=list[SessionListItem])
async def list_sessions(
    user: Annotated[AuthUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[SessionListItem]:
    sessions = await service.list_sessions(db, user.clerk_user_id)
    return [service.session_to_list_item(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=SessionOut)
async def get_session(
    session_id: UUID,
    user: Annotated[AuthUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[ObjectStorage, Depends(_storage)],
) -> SessionOut:
    session = await service.get_owned_session(
        db, session_id, user.clerk_user_id, with_assets=True
    )
    return service.session_to_out(session, storage)


@router.patch("/sessions/{session_id}", response_model=SessionListItem)
async def rename_session(
    session_id: UUID,
    body: SessionUpdate,
    user: Annotated[AuthUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SessionListItem:
    session = await service.update_session_title(
        db, session_id, user.clerk_user_id, body.title
    )
    return service.session_to_list_item(session)


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: UUID,
    user: Annotated[AuthUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[ObjectStorage, Depends(_storage)],
) -> None:
    await service.delete_session(db, storage, session_id, user.clerk_user_id)


@router.get("/sessions/{session_id}/messages", response_model=list[MessageOut])
async def get_messages(
    session_id: UUID,
    user: Annotated[AuthUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[ObjectStorage, Depends(_storage)],
) -> list[MessageOut]:
    return await service.list_messages(db, storage, session_id, user.clerk_user_id)


@router.post("/sessions/{session_id}/assets", response_model=UploadAssetResponse)
async def upload_asset(
    session_id: UUID,
    user: Annotated[AuthUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[ObjectStorage, Depends(_storage)],
    llm: Annotated[ChatLLM, Depends(_llm)],
    settings: Annotated[Settings, Depends(get_settings)],
    file: UploadFile = File(...),
    message: str | None = Form(None),
) -> UploadAssetResponse:
    data = await file.read()
    filename = file.filename or "upload.bin"
    return await service.upload_asset(
        db,
        storage,
        session_id,
        user.clerk_user_id,
        filename,
        data,
        message=message,
        llm=llm,
        settings=settings,
    )


@router.post("/sessions/{session_id}/messages", response_model=SendMessageResponse)
async def post_message(
    session_id: UUID,
    body: MessageCreate,
    user: Annotated[AuthUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[ObjectStorage, Depends(_storage)],
    llm: Annotated[ChatLLM, Depends(_llm)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> SendMessageResponse:
    return await service.send_message(
        db,
        storage,
        llm,
        settings,
        session_id,
        user.clerk_user_id,
        body.content,
    )
