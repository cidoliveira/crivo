from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.classification.models import Classification
from app.emails.models import Email


async def aggregate_metrics(db: AsyncSession) -> dict:
    """Return aggregate metrics: total count, label breakdown, avg confidence, daily series."""
    # Total count
    total_result = await db.execute(select(func.count()).select_from(Classification))
    total: int = total_result.scalar_one() or 0

    # Label counts
    label_result = await db.execute(
        select(Classification.label, func.count().label("count")).group_by(
            Classification.label
        )
    )
    by_label: dict[str, int] = {row.label: row.count for row in label_result.all()}

    # Average confidence
    avg_result = await db.execute(select(func.avg(Classification.confidence)))
    avg_raw = avg_result.scalar_one()
    avg_confidence: float = float(avg_raw) if avg_raw is not None else 0.0

    # Daily series — use same expression in SELECT and GROUP BY to avoid aliasing pitfall
    day_expr = func.date_trunc("day", Classification.created_at)
    daily_result = await db.execute(
        select(day_expr.label("day"), func.count().label("count"))
        .group_by(day_expr)
        .order_by(day_expr)
    )
    daily_series = [
        {"day": row.day.strftime("%Y-%m-%d"), "count": row.count}
        for row in daily_result.all()
    ]

    return {
        "total": total,
        "by_label": by_label,
        "avg_confidence": avg_confidence,
        "daily_series": daily_series,
    }


async def list_emails(
    db: AsyncSession, page: int, page_size: int
) -> tuple[list, int]:
    """Return a page of classified emails and the total count."""
    offset = (page - 1) * page_size

    # Total count
    total_result = await db.execute(select(func.count()).select_from(Classification))
    total: int = total_result.scalar_one() or 0

    # Page query — JOIN Email to get body_text
    page_result = await db.execute(
        select(
            Classification.id,
            Classification.label,
            Classification.confidence,
            Classification.suggestion,
            Classification.created_at,
            Email.subject,
            Email.body_text,
        )
        .join(Email, Classification.email_id == Email.id)
        .order_by(Classification.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    return (page_result.all(), total)
