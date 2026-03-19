"""Add suggestion column to classifications table

Revision ID: 0002abcd0002
Revises: 0001abcd0001
Create Date: 2026-03-19

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002abcd0002"
down_revision: Union[str, None] = "0001abcd0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add suggestion column to classifications table
    op.add_column(
        "classifications",
        sa.Column("suggestion", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    # Drop suggestion column from classifications table
    op.drop_column("classifications", "suggestion")
