const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function createShortLink(longUrl, expiresAt = null, customCode = null, parsedMaxClicks = null) {
  const payload = { long_url: longUrl };
  if (expiresAt) payload.expires_at = expiresAt;
  if (customCode) payload.custom_code = customCode;
  if (parsedMaxClicks) payload.max_clicks = parsedMaxClicks;

  const response = await fetch(`${API_BASE}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

async function getLinkStats(shortCode) {
  const response = await fetch(`${API_BASE}/links/${shortCode}/stats`);
  if (!response.ok) return null;
  return await response.json();
}

export { createShortLink, getLinkStats };