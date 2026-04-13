import { useLocale } from "../hooks/useLocale";

const buttonClass = "px-3 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200";

function LangToggle() {
  const { locale, setLocale } = useLocale();
  const next = locale === "ru" ? "en" : "ru";

  return (
    <button onClick={() => setLocale(next)} className={buttonClass}>
      {locale.toUpperCase()}
    </button>
  );
}

export default LangToggle;