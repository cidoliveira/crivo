from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.classification.schemas import ClassifyRequest, ClassifyResponse
from app.classification.service import classify_email_text, build_explanation, MODEL_ID
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

    clf = Classification(
        email_id=email.id,
        label=label,
        confidence=confidence,
        model_used=MODEL_ID,
        inference_ms=inference_ms,
    )
    db.add(clf)
    await db.flush()

    explanation = build_explanation(label, confidence)

    return ClassifyResponse(
        email_id=str(email.id),
        classification_id=str(clf.id),
        label=label,
        confidence=confidence,
        explanation=explanation,
        inference_ms=inference_ms,
    )
