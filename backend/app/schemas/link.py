import re
from datetime import datetime, timezone

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, field_validator


class LinkCreate(BaseModel):
    long_url: AnyHttpUrl
    expires_at: datetime | None = None
    max_clicks: int | None = None
    custom_code: str | None = None

    @field_validator("expires_at")
    @classmethod
    def check_expire_in_future(cls, v):
        if v is None:
            return v

        if v <= datetime.now(timezone.utc):
            raise ValueError("Дата должны быть в будущем")

        return v

    @field_validator("max_clicks")
    @classmethod
    def check_clicks_limit(cls, v):
        if v is None:
            return v

        if v <= 0:
            raise ValueError("Лимит кликов должен быть положительным")

        return v

    @field_validator("custom_code")
    @classmethod
    def check_correct_custom_code(cls, v):
        if v is None:
            return v

        if not re.match("^[a-zA-Z0-9_-]{4,32}$", v):
            raise ValueError("Короткий код не соответствует правилам")

        return v


class LinkRead(BaseModel):
    id: int
    short_code: str
    long_url: AnyHttpUrl
    created_at: datetime
    clicks: int
    expires_at: datetime | None = None
    max_clicks: int | None = None

    model_config = ConfigDict(from_attributes=True)


class ShortLinkRead(LinkRead):
    short_url: str


class LinkStats(BaseModel):
    short_code: str
    clicks: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
