# pip install pytest pytest-asyncio httpx aiosqlite
#
# Additional test dependencies not in requirements.txt:
#   pytest
#   pytest-asyncio
#   httpx
#   aiosqlite

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.core.security import hash_password, create_access_token

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# ---------------------------------------------------------------------------
# Engine & session factory scoped to each test function so every test gets
# a fresh, isolated schema.
# ---------------------------------------------------------------------------

@pytest.fixture()
async def db_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture()
async def db_session(db_engine):
    factory = async_sessionmaker(db_engine, expire_on_commit=False)
    async with factory() as session:
        yield session


# ---------------------------------------------------------------------------
# Override get_db to use the in-memory SQLite session
# ---------------------------------------------------------------------------

@pytest.fixture()
async def client(db_session: AsyncSession):
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def create_test_user(
    db: AsyncSession,
    email: str = "test@example.com",
    password: str = "secret123",
    name: str = "Test User",
) -> User:
    """Insert a user with a bcrypt-hashed password and return the ORM instance."""
    user = User(
        email=email,
        hashed_password=hash_password(password),
        name=name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Authenticated client fixture
# ---------------------------------------------------------------------------

@pytest.fixture()
async def auth_client(db_session: AsyncSession):
    """AsyncClient pre-configured with a valid Bearer token for a test user."""
    user = await create_test_user(db_session)
    token = create_access_token(user.id)

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://test",
        headers={"Authorization": f"Bearer {token}"},
    ) as ac:
        # Attach user and session so individual tests can create related data
        ac.test_user = user        # type: ignore[attr-defined]
        ac.db = db_session         # type: ignore[attr-defined]
        yield ac
    app.dependency_overrides.clear()
