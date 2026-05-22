import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.api.routes.auth import router as auth_router
from app.api.routes.dictees import router as dictees_router
from app.api.routes.detection import router as detection_router
import app.models  # noqa: F401 — ensure models are registered

_extra = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"] + _extra


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="DictéeCorrige API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dictees_router)
app.include_router(detection_router)


@app.get("/")
def root():
    return {"status": "ok"}
