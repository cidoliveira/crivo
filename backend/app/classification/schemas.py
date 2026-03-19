from pydantic import BaseModel


class ClassifyRequest(BaseModel):
    text: str


class ClassifyResponse(BaseModel):
    email_id: str
    classification_id: str
    label: str           # "Produtivo" or "Improdutivo"
    confidence: float    # 0.0 - 1.0
    explanation: str     # PT-BR template string
    inference_ms: int
