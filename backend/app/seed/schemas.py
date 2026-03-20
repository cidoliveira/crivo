from pydantic import BaseModel


class SeedResponse(BaseModel):
    seeded: int
    message: str
