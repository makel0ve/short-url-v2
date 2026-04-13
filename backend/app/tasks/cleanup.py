from datetime import datetime, timezone

from sqlalchemy import delete

from app.database import async_session
from app.models.link import Link


async def delete_expired_link() -> bool:
    async with async_session() as session:
        stmt = delete(Link).where(
            Link.expires_at.is_not(None), Link.expires_at <= datetime.now(timezone.utc)
        )
        result = await session.execute(stmt)
        await session.commit()

        if result.rowcount:
            print(f"Удалено {result.rowcount} истекших ссылок")


async def delete_limited_clicks() -> bool:
    async with async_session() as session:
        stmt = delete(Link).where(
            Link.max_clicks.is_not(None), Link.clicks >= Link.max_clicks
        )
        result = await session.execute(stmt)
        await session.commit()

        if result.rowcount:
            print(f"Удалено {result.rowcount} исчерпанных ссылок")
