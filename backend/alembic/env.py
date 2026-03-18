import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy.pool import NullPool

# Import Base for target_metadata
from app.database import Base

# Import all models so Alembic autogenerate can discover them
from app.emails.models import Email  # noqa: F401
from app.classification.models import Classification  # noqa: F401

# Alembic Config object — provides access to alembic.ini values
config = context.config

# Set up Python logging from alembic.ini if present
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# The metadata object autogenerate introspects
target_metadata = Base.metadata


def get_url() -> str:
    """Get database URL from pydantic-settings (reads DATABASE_URL from .env)."""
    from app.config import get_settings
    return get_settings().async_database_url


def do_run_migrations(connection) -> None:
    """Synchronous migration runner — called inside the async context."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create an async engine and run migrations in an async context."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=NullPool,  # NullPool: no connection pooling during migrations
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode — generates SQL without a DB connection."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode — connects to DB and applies migrations."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
