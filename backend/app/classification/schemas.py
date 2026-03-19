from pydantic import BaseModel, field_validator


class ClassifyRequest(BaseModel):
    text: str


class ClassifyResponse(BaseModel):
    email_id: str
    classification_id: str
    label: str           # "Produtivo" or "Improdutivo"
    confidence: float    # 0.0 - 1.0
    explanation: str     # PT-BR template string
    suggestion: str      # PT-BR suggested response template
    inference_ms: int


class BatchClassifyRequest(BaseModel):
    texts: list[str]     # 1-20 items, pre-extracted plain text
    batch_id: str        # UUID string from frontend

    @field_validator("texts")
    @classmethod
    def validate_texts_count(cls, v: list[str]) -> list[str]:
        if len(v) == 0 or len(v) > 20:
            raise ValueError("O lote deve conter entre 1 e 20 emails.")
        return v

    @field_validator("batch_id")
    @classmethod
    def validate_batch_id(cls, v: str) -> str:
        import uuid
        try:
            uuid.UUID(v)
        except ValueError:
            raise ValueError("batch_id deve ser um UUID valido.")
        return v


class BatchItemResult(BaseModel):
    index: int           # 0-based position in batch
    total: int           # total items in batch
    email_id: str        # UUID string of persisted Email row
    classification_id: str  # UUID string of persisted Classification row
    label: str           # "Produtivo" or "Improdutivo"
    confidence: float    # 0.0 - 1.0
    suggestion: str      # PT-BR response template
    inference_ms: int    # HF API latency
    error: str | None = None  # set if this item failed


class BatchProgressEvent(BaseModel):
    type: str            # "progress" | "complete" | "error"
    item: BatchItemResult | None = None
    summary: dict | None = None  # only on type="complete"
