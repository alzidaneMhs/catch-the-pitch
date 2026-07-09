"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import type { Locale } from "@/lib/i18n/translations";

const OPTIONS: Locale[] = ["id", "en"];

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs font-medium">
      {OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          className={`rounded-md px-2.5 py-1 uppercase transition-colors ${
            locale === option
              ? "bg-sky-600 text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
