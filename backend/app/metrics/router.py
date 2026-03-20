from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.metrics.schemas import EmailListResponse, EmailRow, MetricsResponse
from app.metrics.service import aggregate_metrics, list_emails

router = APIRouter(prefix="/api", tags=["metrics"])


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(db: AsyncSession = Depends(get_db)) -> MetricsResponse:
    data = await aggregate_metrics(db)
    return MetricsResponse(**data)


@router.get("/emails", response_model=EmailListResponse)
async def get_emails(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> EmailListResponse:
    rows, total = await list_emails(db, page, page_size)
    items = [
        EmailRow(
            id=str(row.id),
            subject=row.subject or "",
            body_preview=row.body_text[:200],
            body_text=row.body_text,
            label=row.label,
            confidence=row.confidence,
            suggestion=row.suggestion,
            created_at=row.created_at.isoformat(),
        )
        for row in rows
    ]
    return EmailListResponse(items=items, total=total, page=page, page_size=page_size)
