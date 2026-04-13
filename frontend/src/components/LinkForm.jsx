import { useState } from "react";
import { useLocale } from "../hooks/useLocale";

const formClass = "w-full space-y-4";
const inputRowClass = "flex flex-col sm:flex-row gap-3";
const inputWrapperClass = "relative flex-1";
const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900";
const pasteButtonClass = "absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400";
const submitButtonClass = "rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
const expiryRowClass = "flex items-center gap-2";
const expiryLabelClass = "text-sm text-slate-500 dark:text-slate-400";
const selectClass = "rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none";
const advancedToggleClass = "ml-auto text-xs text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400";
const advancedBoxClass = "space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4";
const advancedLabelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";
const advancedInputClass = "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none";
const errorClass = "text-xs text-red-500 dark:text-red-400";

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function computeExpiresAt(value) {
  if (!value) return null;
  const now = Date.now();
  const map = {
    "10m": 10 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };
  return new Date(now + map[value]).toISOString();
}

function ClipboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function LinkForm({ onSubmit, loading }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [expiry, setExpiry] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t } = useLocale();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
    } catch {
      setError(t("form.pasteError"));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedMaxClicks = maxClicks ? parseInt(maxClicks, 10) : null;

    if (!isValidUrl(url.trim())) {
      setError(t("form.invalidUrl"));
      return;
    }

    setError(null);
    onSubmit(url.trim(), computeExpiresAt(expiry), customCode.trim(), parsedMaxClicks);
  };

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <div className={inputRowClass}>
        <div className={inputWrapperClass}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url..."
            className={inputClass}
          />
          <button type="button" onClick={handlePaste} className={pasteButtonClass} aria-label="Вставить">
            <ClipboardIcon />
          </button>
        </div>
        <button type="submit" disabled={loading || !url.trim()} className={submitButtonClass}>
          {loading ? t("form.submitting") : t("form.submit")}
        </button>
      </div>

      <div className={expiryRowClass}>
        <label className={expiryLabelClass}>{t("form.expiry")}</label>
        <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className={selectClass}>
          <option value="">{t("form.expiry.none")}</option>
          <option value="10m">{t("form.expiry.10m")}</option>
          <option value="1h">{t("form.expiry.1h")}</option>
          <option value="1d">{t("form.expiry.1d")}</option>
          <option value="7d">{t("form.expiry.7d")}</option>
          <option value="30d">{t("form.expiry.30d")}</option>
        </select>
        <button type="button" onClick={() => setShowAdvanced(v => !v)} className={advancedToggleClass}>
          {showAdvanced ? t("form.hideAdvanced") : t("form.advanced")}
        </button>
      </div>

      {showAdvanced && (
        <div className={advancedBoxClass}>
          <div>
            <label className={advancedLabelClass}>{t("form.customCode")}</label>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder={t("form.customCodePlaceholder")}
              className={advancedInputClass}
            />
          </div>
          <div>
            <label className={advancedLabelClass}>{t("form.maxClicks")}</label>
            <input
              type="number"
              min="1"
              value={maxClicks}
              onChange={(e) => setMaxClicks(e.target.value)}
              placeholder={t("form.maxClicksPlaceholder")}
              className={advancedInputClass}
            />
          </div>
        </div>
      )}

      {error && <p className={errorClass}>{error}</p>}
    </form>
  );
}

export default LinkForm;