from io import BytesIO

import pypdf


def extract_text_from_txt(data: bytes) -> str:
    """Decode bytes to string, falling back to latin-1 for Windows PT-BR encodings."""
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("latin-1")


def extract_text_from_pdf(data: bytes) -> str:
    """Extract plain text from PDF bytes using pypdf.

    Raises ValueError if the PDF cannot be read (corrupt, encrypted, etc.).
    Empty text (scanned image PDFs) is NOT an error here — the router handles it.
    """
    try:
        reader = pypdf.PdfReader(BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(page for page in pages if page)
    except Exception as exc:
        raise ValueError(f"Nao foi possivel ler o PDF: {exc}") from exc
