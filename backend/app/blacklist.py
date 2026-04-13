import json
from pathlib import Path

import httpx

CACHE_PATH = Path(__file__).parent.parent / "blacklist_cache.json"

blocked_urls = set()


async def get_blacklist():
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                "https://urlhaus.abuse.ch/downloads/text_online/"
            )

            urls = set()
            for line in response.text.splitlines():
                line = line.strip()

                if not line or line.startswith("#"):
                    continue

                urls.add(line.lower())

            save_cache(urls)

            return urls

    except Exception:
        return load_cache()


def save_cache(urls):
    CACHE_PATH.write_text(json.dumps(list(urls)))


def load_cache():
    try:
        return set(json.loads(CACHE_PATH.read_text()))

    except Exception:
        return set()


def is_blocked(url):
    return url.lower().strip() in blocked_urls


async def refresh_blacklist():
    global blocked_urls
    blocked_urls = await get_blacklist()
