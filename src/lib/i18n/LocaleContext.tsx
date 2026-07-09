"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

const STORAGE_KEY = "catch-the-pitch-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    // Baca preferensi dari localStorage/browser setelah mount saja -- nilai ini
    // tidak tersedia saat SSR, dan mengisinya lewat lazy useState initializer
    // akan menyebabkan mismatch hydration karena render server selalu "id".
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const detected =
      stored === "id" || stored === "en"
        ? stored
        : navigator.language.toLowerCase().startsWith("en")
          ? "en"
          : "id";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkronisasi sekali dari localStorage/navigator saat mount, bukan pola state turunan
    setLocaleState(detected);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let text = translations[locale][key];
      if (params) {
        for (const [param, value] of Object.entries(params)) {
          text = text.replaceAll(`{{${param}}}`, String(value));
        }
      }
      return text;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
