import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.api.routes.auth import router as auth_router
from app.api.routes.dictees import router as dictees_router
from app.api.routes.detection import router as detection_router
from app.api.routes.classes import router as classes_router
from app.api.routes.eleves import router as eleves_router
from app.api.routes.planifications import router as planifications_router
from app.api.routes.corrections import router as corrections_router
import app.models  # noqa: F401 — ensure models are registered

_extra = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"] + _extra


UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(os.path.join(UPLOADS_DIR, "corrections"), exist_ok=True)


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
app.include_router(classes_router)
app.include_router(eleves_router)
app.include_router(planifications_router)
app.include_router(corrections_router)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/")
def root():
    return {"status": "ok"}
