"use client";

import KaraokeStage from "@/components/karaoke/KaraokeStage";
import LanguageToggle from "@/components/LanguageToggle";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function Home() {
  const { t } = useLocale();

  return (
    <div className="flex-1 bg-zinc-950 text-white">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{t("app.title")}</h1>
            <p className="mt-2 text-sm text-white/60 sm:text-base">
              {t("app.subtitle")}
            </p>
          </div>
          <LanguageToggle />
        </header>

        <KaraokeStage />
      </main>
    </div>
  );
}
