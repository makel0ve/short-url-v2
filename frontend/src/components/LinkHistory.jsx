import { useLocale } from "../hooks/useLocale";

const sectionClass = "w-full space-y-3";
const headerClass = "flex items-center justify-between";
const titleClass = "text-sm font-semibold text-slate-600 dark:text-slate-400";
const clearButtonClass = "text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400";
const listClass = "space-y-2";
const itemClass = "animate-fade-in flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5";
const faviconClass = "shrink-0 rounded-sm";
const itemContentClass = "min-w-0 flex-1";
const itemLinkClass = "inline-block max-w-full truncate text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline";
const itemMetaClass = "flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500";
const iconButtonClass = "shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300";
const removeButtonClass = "shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400";
const exhaustedClass = "text-red-500 dark:text-red-400 font-semibold"
const activeItemClass = "ring-2 ring-indigo-500 dark:ring-indigo-400";
const activeExpiryClass = "text-amber-500 dark:text-amber-400";
const expiredClass = "text-red-500 dark:text-red-400 font-semibold";


function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function LinkHistory({ items, onCopy, onRemove, onClear, onSelect, selectedId, statsMap }) {
  const { t, locale } = useLocale();

  if (items.length === 0) return null;

  return (
    <section className={sectionClass}>
      <div className={headerClass}>
        <h2 className={titleClass}>{t("history.title")}</h2>
        <button onClick={onClear} className={clearButtonClass}>
          {t("history.clear")}
        </button>
      </div>

      <ul className={listClass}>
        {items.map((item) => {
          const shortUrl = item.short_url;
          const domain = getDomain(item.long_url);
          const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
          const date = new Date(item.created_at).toLocaleDateString(
            locale === "ru" ? "ru-RU" : "en-US",
            { day: "numeric", month: "short" }
          );
          const expiresAt = item.expires_at
            ? new Date(item.expires_at).toLocaleDateString(
                locale === "ru" ? "ru-RU" : "en-US",
                { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
              )
            : null;
          const clicks = statsMap[item.id] ?? item.clicks;
          const isExpired = item.expires_at && new Date(item.expires_at) < new Date();

          return (
            <li
              key={item.id}
              className={`${itemClass} cursor-pointer ${item.id === selectedId ? activeItemClass : ""}`}
              onClick={() => onSelect(item)}
            >
              <img src={favicon} alt="" width={16} height={16} className={faviconClass} onError={(e) => (e.currentTarget.style.display = "none")} />

              <div className={itemContentClass}>
                <a  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemLinkClass}
                  onClick={(e) => e.stopPropagation()}
                >
                  {shortUrl}
                </a>
                <div className={itemMetaClass}>
                  <span className="truncate">{domain}</span>
                  <span>·</span>
                  <span>{date}</span>
                  {clicks > 0 && item.max_clicks == null && (
                    <>
                      <span>·</span>
                      <span>{clicks} {t("history.clicks")}</span>
                    </>
                  )}
                  {item.max_clicks != null && (
                    <>
                      <span>·</span>
                      <span className={clicks >= item.max_clicks ? exhaustedClass : ""}>
                        {clicks}/{item.max_clicks}
                      </span>
                    </>
                  )}
                  {expiresAt && (
                    <>
                      <span>·</span>
                      <span className={isExpired ? expiredClass : activeExpiryClass}>
                        {t("history.expires")} {expiresAt}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onCopy(shortUrl); }}
                className={iconButtonClass}
                aria-label={t("history.copyLabel")}
              >
                <CopyIcon />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                className={removeButtonClass}
                aria-label={t("history.removeLabel")}
              >
                <TrashIcon />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default LinkHistory;