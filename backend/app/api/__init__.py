from .interpret_api import router as interpret_router
from .logs_api import router as logs_router
from .upload_api import router as upload_router
from .wells_api import router as wells_router

__all__ = [
    "upload_router",
    "wells_router",
    "logs_router",
    "interpret_router",
]
