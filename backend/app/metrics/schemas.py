from pydantic import BaseModel


class DailyPoint(BaseModel):
    day: str
    count: int


class MetricsResponse(BaseModel):
    total: int
    by_label: dict[str, int]
    avg_confidence: float
    daily_series: list[DailyPoint]


class EmailRow(BaseModel):
    id: str
    subject: str
    body_preview: str
    body_text: str
    label: str
    confidence: float
    suggestion: str | None
    created_at: str


class EmailListResponse(BaseModel):
    items: list[EmailRow]
    total: int
    page: int
    page_size: int
