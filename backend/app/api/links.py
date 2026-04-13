from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from slowapi import Limiter

from app.config import get_settings
from app.crud.link import create_link as crud_create_link
from app.crud.link import delete_link_by_code, get_link_by_code, increment_clicks
from app.database import get_session
from app.schemas.link import LinkCreate, LinkRead, LinkStats, ShortLinkRead

router = APIRouter()
router_redirect = APIRouter()
settings = get_settings()


def get_real_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    return request.client.host if request.client else "127.0.0.1"


limiter = Limiter(key_func=get_real_ip)


@router_redirect.get("/{short_code}")
@limiter.limit("60/minute")
async def redirect_link(
    request: Request, short_code: str, session=Depends(get_session)
):
    link = await get_link_by_code(session, short_code)

    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    if link.expires_at and link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Link has expired")

    if link.max_clicks and link.clicks >= link.max_clicks:
        raise HTTPException(status_code=410, detail="Limit Reached")

    await increment_clicks(session, link.id)

    return RedirectResponse(link.long_url, status_code=307)


@router.get("/links/{short_code}/stats")
@limiter.limit("30/minute")
async def get_stats(request: Request, short_code: str, session=Depends(get_session)):
    link = await get_link_by_code(session, short_code)

    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    return LinkStats.model_validate(link)


@router.post("/links", status_code=201)
@limiter.limit("10/minute")
async def create_link(request: Request, data: LinkCreate, session=Depends(get_session)):
    try:
        link = await crud_create_link(
            session,
            str(data.long_url),
            data.expires_at,
            data.max_clicks,
            data.custom_code,
        )

    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    return ShortLinkRead(
        **LinkRead.model_validate(link).model_dump(),
        short_url=f"{settings.base_url}/{link.short_code}",
    )


@router.delete("/links/{short_code}", status_code=204)
@limiter.limit("10/minute")
async def delete_link(request: Request, short_code: str, session=Depends(get_session)):
    link = await delete_link_by_code(session, short_code)

    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
