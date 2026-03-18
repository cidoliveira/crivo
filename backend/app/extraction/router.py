from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.extraction.service import extract_text_from_pdf, extract_text_from_txt

router = APIRouter(prefix="/api", tags=["extraction"])

ACCEPTED_EXTENSIONS = {".txt", ".pdf"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class ExtractResponse(BaseModel):
    text: str
    char_count: int
    filename: str


@router.post("/extract", response_model=ExtractResponse)
async def extract_text(file: Annotated[UploadFile, File()]) -> ExtractResponse:
    """Extract plain text from an uploaded .txt or .pdf file.

    Returns extracted text with character count and original filename.
    Raises 422 for unsupported formats, empty/scanned PDFs, and PDF read errors.
    Raises 413 for files exceeding 10 MB.
    """
    filename = file.filename or "arquivo"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in ACCEPTED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Formato '{ext}' nao suportado. Use .txt ou .pdf",
        )

    data = await file.read()

    if len(data) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Arquivo excede o limite de 10 MB",
        )

    if ext == ".txt":
        text = extract_text_from_txt(data)
    else:  # .pdf
        try:
            text = extract_text_from_pdf(data)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Nenhum texto encontrado. O PDF pode ser uma imagem digitalizada.",
        )

    stripped = text.strip()
    return ExtractResponse(text=stripped, char_count=len(stripped), filename=filename)
