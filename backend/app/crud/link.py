import secrets
import string
from datetime import datetime

from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError

from app.blacklist import is_blocked
from app.models.link import Link

ALPHABET = string.ascii_letters + string.digits


def _generate_short_code(length: int = 6) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


async def _save_link(
    session,
    long_url: str,
    expires_at: datetime = None,
    max_clicks: int = None,
    short_code: str = None,
) -> Link:
    link = Link(
        short_code=short_code,
        long_url=long_url,
        expires_at=expires_at,
        max_clicks=max_clicks,
    )
    session.add(link)
    await session.commit()
    await session.refresh(link)

    return link


async def create_link(
    session,
    long_url: str,
    expires_at: datetime = None,
    max_clicks: int = None,
    custom_code: str = None,
):
    if is_blocked(long_url):
        raise ValueError("Введенная ссылка вредоносная")

    if custom_code:
        try:
            return await _save_link(
                session, long_url, expires_at, max_clicks, custom_code
            )

        except IntegrityError:
            await session.rollback()

            raise ValueError("Этот код уже занят")

    for _ in range(3):
        short_code = _generate_short_code()

        try:
            return await _save_link(
                session, long_url, expires_at, max_clicks, short_code
            )

        except IntegrityError:
            await session.rollback()

    raise RuntimeError("Failed to generate unique short code")


async def get_link_by_code(session, short_code: str):
    stmt = select(Link).where(Link.short_code == short_code)
    result = await session.execute(stmt)

    return result.scalar_one_or_none()


async def increment_clicks(session, link_id: int):
    stmt = update(Link).where(Link.id == link_id).values(clicks=Link.clicks + 1)

    await session.execute(stmt)
    await session.commit()


async def delete_link_by_code(session, short_code: str) -> bool:
    stmt = delete(Link).where(Link.short_code == short_code)
    result = await session.execute(stmt)

    await session.commit()
    return result.rowcount > 0
