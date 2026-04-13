import { useState, useEffect } from 'react'
import LinkForm from './components/LinkForm'
import { createShortLink } from './api/links'
import LinkResult from './components/LinkResult'
import ThemeToggle from './components/ThemeToggle'
import { useHistory } from "./hooks/useHistory";
import LinkHistory from "./components/LinkHistory";
import { useToast } from './hooks/useToast'
import ToastContainer from './components/Toast'
import { useLocale } from "./hooks/useLocale";
import LangToggle from './components/LangToggle'
import { useOnline } from "./hooks/useOnline";
import OfflineBanner from "./components/OfflineBanner";
import { getLinkStats } from './api/links'

const wrapperClass = "relative flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-16 transition-colors";
const toggleWrapperClass = "absolute top-4 right-4";
const mainClass = "w-full max-w-xl space-y-8";
const headerClass = "text-center";
const titleClass = "text-4xl font-bold bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400 bg-clip-text text-transparent";
const subtitleClass = "mt-2 text-slate-500 dark:text-slate-400";
const footerClass = "absolute bottom-4 text-xs text-slate-400 dark:text-slate-600";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const history = useHistory();
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();
  const { t } = useLocale();
  const online = useOnline();
  const [statsMap, setStatsMap] = useState({});
  const trackedItems = result
    ? [result, ...history.items.filter(i => i.id !== result.id)]
    : history.items;

  useEffect(() => {
    if (trackedItems.length === 0) return;

    const fetchStats = () => {
      Promise.all(
        trackedItems.map((item) =>
          getLinkStats(item.short_code)
            .then((res) => ({ id: item.id, clicks: res?.clicks ?? item.clicks }))
            .catch(() => ({ id: item.id, clicks: item.clicks }))
        )
      ).then((results) => {
        setStatsMap((prev) => {
          const next = { ...prev };
          results.forEach((r) => (next[r.id] = r.clicks));
          return next;
        });
      });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [trackedItems.map(i => i.id).join(",")]);

  const handleCopy = async (url) => {
    await navigator.clipboard.writeText(url);
    showToast("toast.copied");
  };

  const handleClear = () => {
  const saved = [...history.items];
    history.clear();
    showToast("toast.historyCleared", "warning", () => {
      saved.forEach((item) => history.add(item));
      showToast("toast.historyRestored", "success");
    });
  };

  const handleRemove = (id) => {
    const item = history.items.find((l) => l.id === id);
    if (!item) return;
    history.remove(id);
    showToast("toast.linkRemoved", "warning", () => {
      history.add(item);
      showToast("toast.linkRestored", "success");
    });
  };

  const handleSubmit = async (url, expiresAt, customCode, parsedMaxClicks) => {
    setLoading(true);
    try {
      const data = await createShortLink(url, expiresAt, customCode, parsedMaxClicks);
      setResult(data);
      history.add(data);
    } catch {
      showToast("error.createFailed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={wrapperClass}>
      <div className="absolute top-4 right-4 flex gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>

      {!online && <OfflineBanner />}

      <main className={mainClass}>
        <header className={headerClass}>
          <h1 className={titleClass}>Trimi</h1>
          <p className={subtitleClass}>{t("app.subtitle")}</p>
        </header>

        <LinkForm onSubmit={handleSubmit} loading={loading} />

        {result && <LinkResult result={result} onCopy={handleCopy} statsMap={statsMap} />}

        <LinkHistory
          items={history.items}
          onCopy={handleCopy}
          onRemove={handleRemove}
          onClear={handleClear}
          onSelect={(item) => setResult(item)}
          selectedId={result?.id}
          statsMap={statsMap}
        />
      </main>

      <footer className={footerClass}>Trimi © {new Date().getFullYear()}</footer>
      <ToastContainer toasts={toasts} onUndo={dismissToast} />
    </div>
  );
}

export default App;