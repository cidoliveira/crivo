from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.classification.models import Classification
from app.database import get_db
from app.emails.models import Email
from app.seed.fixtures import SEED_FIXTURES
from app.seed.schemas import SeedResponse

router = APIRouter(prefix="/api", tags=["seed"])


@router.post("/seed", response_model=SeedResponse)
async def load_demo_data(db: AsyncSession = Depends(get_db)) -> SeedResponse:
    # Truncate: FK child first, then FK parent
    await db.execute(delete(Classification))
    await db.execute(delete(Email))
    await db.flush()

    # Insert emails
    emails = [Email(**f["email"]) for f in SEED_FIXTURES]
    db.add_all(emails)
    await db.flush()  # CRITICAL: populates email.id (server-generated UUID)

    # Insert classifications referencing the flushed email IDs
    clfs = [
        Classification(email_id=emails[i].id, **f["classification"])
        for i, f in enumerate(SEED_FIXTURES)
    ]
    db.add_all(clfs)

    # Do NOT call db.commit() — get_db() commits on yield exit

    return SeedResponse(seeded=len(emails), message="Dados demo carregados com sucesso.")
