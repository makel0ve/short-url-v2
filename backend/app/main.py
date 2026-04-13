from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.links import limiter, router, router_redirect
from app.blacklist import refresh_blacklist
from app.config import get_settings
from app.tasks.cleanup import delete_expired_link, delete_limited_clicks

scheduler = AsyncIOScheduler()
settings = get_settings()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains"
        )

        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    await refresh_blacklist()
    scheduler.add_job(refresh_blacklist, trigger=IntervalTrigger(hours=1))
    scheduler.add_job(
        delete_expired_link,
        trigger=IntervalTrigger(hours=1),
    )
    scheduler.add_job(
        delete_limited_clicks,
        trigger=IntervalTrigger(hours=1),
    )
    scheduler.start()
    print("Запущен планировщик")

    yield

    scheduler.shutdown()


app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(router_redirect)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"error": "Слишком много запросов, попробуйте позже"},
    )
