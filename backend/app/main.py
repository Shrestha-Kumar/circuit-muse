from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .model_service import model_service
from .routers.generate import router as generate_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts — not on every request.
    # This is the FastAPI equivalent of loading the model "above" the
    # Flask routes at module level, just made explicit and testable.
    model_service.load()
    yield
    # (nothing to clean up on shutdown for this project)


app = FastAPI(title="Circuit Muse API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router)
