from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.interpret_api import router as interpret_router
from app.api.logs_api import router as logs_router
from app.api.upload_api import router as upload_router
from app.api.wells_api import router as wells_router
from app.db.database import Base, engine
from app.models import well, well_log_data  # noqa: F401

from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware

class LimitUploadSize(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        max_size = 50 * 1024 * 1024  # 50MB
        if int(request.headers.get("content-length", 0)) > max_size:
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "File too large"}, status_code=413)
        return await call_next(request)

app = FastAPI(title="Well Log System API", version="0.2.0")
app.add_middleware(LimitUploadSize)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Allow local frontend app to call backend APIs.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Create database tables at startup."""
    Base.metadata.create_all(bind=engine)


app.include_router(upload_router)
app.include_router(wells_router)
app.include_router(logs_router)
app.include_router(interpret_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
