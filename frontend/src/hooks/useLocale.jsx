import { createContext, useContext, useState, useCallback, useEffect } from "react";
import ru from "../locales/ru.json";
import en from "../locales/en.json";

const dictionaries = { ru, en };
const STORAGE_KEY = "locale";

const LocaleContext = createContext(null);

function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved in dictionaries) return saved;

  const browserLang = navigator.language.split("-")[0];
  if (browserLang in dictionaries) return browserLang;

  return "en";
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((l) => setLocaleState(l), []);

  const t = useCallback(
    (key) => dictionaries[locale][key] || key,
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}