import uuid
from collections.abc import AsyncIterable

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.sse import EventSourceResponse, ServerSentEvent
from sqlalchemy.ext.asyncio import AsyncSession

from app.classification.schemas import (
    ClassifyRequest,
    ClassifyResponse,
    BatchClassifyRequest,
    BatchItemResult,
    BatchProgressEvent,
)
from app.classification.service import classify_email_text, build_explanation, build_suggestion, MODEL_ID
from app.database import get_db
from app.emails.models import Email
from app.classification.models import Classification

router = APIRouter(prefix="/api", tags=["classification"])


@router.post("/classify", response_model=ClassifyResponse)
async def classify_email(
    body: ClassifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> ClassifyResponse:
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="O texto do email nao pode ser vazio.")

    hf_client = request.app.state.hf_client

    try:
        label, confidence, inference_ms = await classify_email_text(text, hf_client)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    email = Email(subject="", body_text=text)
    db.add(email)
    await db.flush()

    explanation = build_explanation(label, confidence)
    suggestion = build_suggestion(label, text)

    clf = Classification(
        email_id=email.id,
        label=label,
        confidence=confidence,
        model_used=MODEL_ID,
        inference_ms=inference_ms,
        suggestion=suggestion,
    )
    db.add(clf)
    await db.flush()

    return ClassifyResponse(
        email_id=str(email.id),
        classification_id=str(clf.id),
        label=label,
        confidence=confidence,
        explanation=explanation,
        suggestion=suggestion,
        inference_ms=inference_ms,
    )


@router.post("/classify/batch", response_class=EventSourceResponse)
async def classify_batch(
    body: BatchClassifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> AsyncIterable[ServerSentEvent]:
    hf_client = request.app.state.hf_client
    batch_uuid = uuid.UUID(body.batch_id)
    total = len(body.texts)

    results: list[BatchItemResult | None] = []

    for i, text in enumerate(body.texts):
        stripped = text.strip()
        if not stripped:
            error_item = BatchItemResult(
                index=i,
                total=total,
                email_id="",
                classification_id="",
                label="",
                confidence=0.0,
                suggestion="",
                inference_ms=0,
                error="Texto vazio ignorado.",
            )
            results.append(None)
            yield ServerSentEvent(
                data=BatchProgressEvent(type="progress", item=error_item).model_dump_json(),
                event="progress",
            )
            continue

        try:
            label, confidence, inference_ms = await classify_email_text(stripped, hf_client)
        except ValueError as exc:
            error_item = BatchItemResult(
                index=i,
                total=total,
                email_id="",
                classification_id="",
                label="",
                confidence=0.0,
                suggestion="",
                inference_ms=0,
                error=str(exc),
            )
            results.append(None)
            yield ServerSentEvent(
                data=BatchProgressEvent(type="progress", item=error_item).model_dump_json(),
                event="progress",
            )
            continue

        email = Email(subject="", body_text=stripped, batch_id=batch_uuid)
        db.add(email)
        await db.flush()

        suggestion = build_suggestion(label, stripped)

        clf = Classification(
            email_id=email.id,
            label=label,
            confidence=confidence,
            model_used=MODEL_ID,
            inference_ms=inference_ms,
            suggestion=suggestion,
        )
        db.add(clf)
        await db.flush()

        await db.commit()

        item = BatchItemResult(
            index=i,
            total=total,
            email_id=str(email.id),
            classification_id=str(clf.id),
            label=label,
            confidence=confidence,
            suggestion=suggestion,
            inference_ms=inference_ms,
        )
        results.append(item)

        yield ServerSentEvent(
            data=BatchProgressEvent(type="progress", item=item).model_dump_json(),
            event="progress",
        )

    # Compute summary
    successful = [r for r in results if r is not None]
    label_counts: dict[str, int] = {}
    for r in successful:
        label_counts[r.label] = label_counts.get(r.label, 0) + 1
    avg_conf = sum(r.confidence for r in successful) / len(successful) if successful else 0.0

    summary = {
        "total": total,
        "successful": len(successful),
        "failed": total - len(successful),
        "by_label": label_counts,
        "avg_confidence": round(avg_conf, 4),
    }

    yield ServerSentEvent(
        data=BatchProgressEvent(type="complete", summary=summary).model_dump_json(),
        event="complete",
    )
