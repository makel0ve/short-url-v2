import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocale } from "../hooks/useLocale";

const cardClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm";
const headerRowClass = "flex items-center justify-between mb-2";
const labelClass = "text-xs text-slate-400 dark:text-slate-500";
const rowClass = "flex items-center gap-2";
const linkClass = "min-w-0 flex-1 truncate text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:underline";
const copyButtonClass = "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200";
const copiedButtonClass = "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
const iconButtonClass = "flex shrink-0 items-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 p-2 text-slate-700 dark:text-slate-200";
const qrWrapperClass = "mt-3";
const qrBgClass = "flex justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-5";
const qrInnerClass = "rounded-lg bg-white p-3 shadow-md";
const downloadButtonClass = "mx-auto mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200";
const metaClass = "mt-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500";
const longUrlClass = "hidden min-w-0 flex-1 truncate text-slate-300 dark:text-slate-600 sm:inline";
const headerMetaClass = "flex items-center gap-2";
const clicksNormalClass = "text-xs text-slate-400 dark:text-slate-500";
const expiryNormalClass = "text-xs text-slate-400 dark:text-slate-500";
const expiredClass = "text-xs text-red-500 dark:text-red-400 font-semibold";
const exhaustedClass = "text-xs text-red-500 dark:text-red-400 font-semibold";


function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="14" y1="14" x2="14" y2="17" />
      <line x1="14" y1="20" x2="17" y2="20" />
      <line x1="17" y1="17" x2="20" y2="17" />
      <line x1="20" y1="14" x2="20" y2="20" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function LinkResult({ result, onCopy, statsMap }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef(null);
  const shortUrl = result.short_url; 
  const { t, locale } = useLocale();
  const clicks = statsMap?.[result.id] ?? result.clicks;

  const handleCopy = async () => {
    onCopy(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: t("result.shareTitle"), url: shortUrl });
    } catch {}
  };

  const handleDownloadQr = () => {
    const svgEl = qrRef.current?.querySelector("svg:not(.absolute)");
    if (!svgEl) return;

    const clone = svgEl.cloneNode(true);
    const ns = "http://www.w3.org/2000/svg";

    const defs = document.createElementNS(ns, "defs");
    const gradient = document.createElementNS(ns, "linearGradient");
    gradient.setAttribute("id", "qr-export-gradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "100%");

    const stop1 = document.createElementNS(ns, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#4f46e5");
    const stop2 = document.createElementNS(ns, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#7c3aed");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    clone.insertBefore(defs, clone.firstChild);

    clone.querySelectorAll("path, rect").forEach((el) => {
      if (el.getAttribute("fill") !== "none" && el.getAttribute("fill") !== "transparent") {
        el.setAttribute("fill", "url(#qr-export-gradient)");
      }
    });

    const bg = document.createElementNS(ns, "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "#ffffff");
    clone.insertBefore(bg, defs.nextSibling);

    const svgData = new XMLSerializer().serializeToString(clone);
    const canvas = document.createElement("canvas");
    const size = 540;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement("a");
      link.download = `qr-${result.short_code}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const domain = getDomain(result.long_url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  const isExpired = result.expires_at && new Date(result.expires_at) < new Date();
  const isExhausted = result.max_clicks != null && clicks >= result.max_clicks;

  return (
    <div className={cardClass}>
      <div className={headerRowClass}>
        <p className={labelClass}>{t("result.title")}</p>
        <div className={headerMetaClass}>
          <span className={isExpired ? expiredClass : expiryNormalClass}>
            {result.expires_at
              ? `${t("result.expires")}: ${new Date(result.expires_at).toLocaleString(locale === "ru" ? "ru-RU" : "en-US")}`
              : t("result.noExpiry")}
          </span>
          <span>·</span>
          <span className={isExhausted ? exhaustedClass : clicksNormalClass}>
            {result.max_clicks != null
              ? `${clicks}/${result.max_clicks}`
              : `${clicks} ${t("result.clicks")}`}
          </span>
        </div>
      </div>

      <div className={rowClass}>
        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {shortUrl}
        </a>

        <button onClick={handleCopy} className={copied ? copiedButtonClass : copyButtonClass}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className="hidden sm:inline">{copied ? t("result.copied") : t("result.copy")}</span>
        </button>

        <button onClick={handleShare} className={iconButtonClass} aria-label={t("result.shareLabel")}>
          <ShareIcon />
        </button>

        <button onClick={() => setShowQr(v => !v)} className={iconButtonClass} aria-label={t("result.qrLabel")}>
          <QrIcon />
        </button>
      </div>

      {showQr && (
        <div className={qrWrapperClass}>
          <div className={qrBgClass}>
            <div ref={qrRef} className={qrInnerClass}>
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <QRCodeSVG
                value={shortUrl}
                size={180}
                bgColor="transparent"
                fgColor="url(#qr-gradient)"
                level="M"
              />
            </div>
          </div>
          <button onClick={handleDownloadQr} className={downloadButtonClass}>
            <DownloadIcon />
              {t("result.downloadPng")}
          </button>
        </div>
      )}

      <div className={metaClass}>
        {faviconUrl && (
          <img src={faviconUrl} alt="" width={16} height={16} onError={(e) => (e.currentTarget.style.display = "none")} />
        )}
        <span className="truncate">{domain}</span>
        <span className={longUrlClass}>{result.long_url}</span>
      </div>
    </div>
  );
}

export default LinkResult;