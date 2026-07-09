"use client";

import type { MicErrorType } from "@/lib/audio/micErrors";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const TITLE_KEY: Record<MicErrorType, TranslationKey> = {
  denied: "micError.denied.title",
  notFound: "micError.notFound.title",
  notReadable: "micError.notReadable.title",
  unsupported: "micError.unsupported.title",
  unknown: "micError.unknown.title",
};

const DESC_KEY: Record<MicErrorType, TranslationKey> = {
  denied: "micError.denied.desc",
  notFound: "micError.notFound.desc",
  notReadable: "micError.notReadable.desc",
  unsupported: "micError.unsupported.desc",
  unknown: "micError.unknown.desc",
};

interface MicPermissionHelpProps {
  errorType: MicErrorType;
  onRetry: () => void;
}

export default function MicPermissionHelp({ errorType, onRetry }: MicPermissionHelpProps) {
  const { t } = useLocale();

  return (
    <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm">
      <div className="flex items-start gap-3">
        <MicOffIcon />
        <div className="flex-1">
          <p className="font-medium text-red-300">{t(TITLE_KEY[errorType])}</p>
          <p className="mt-1 text-white/60">{t(DESC_KEY[errorType])}</p>

          {errorType === "denied" && (
            <>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-white/50">
                <li>{t("micError.step1")}</li>
                <li>{t("micError.step2")}</li>
                <li>{t("micError.step3")}</li>
              </ol>
              <p className="mt-2 text-xs text-white/40">{t("micError.safariNote")}</p>
            </>
          )}

          <button
            onClick={onRetry}
            className="mt-3 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
          >
            {t("micError.retry")}
          </button>
        </div>
      </div>
    </div>
  );
}

function MicOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
    >
      <path d="M12 18.5a4 4 0 0 0 4-4v-1" />
      <path d="M8 10.5v-5a4 4 0 0 1 7.6-1.8" />
      <path d="M12 18.5a4 4 0 0 1-4-4v-1" />
      <line x1="12" y1="22" x2="12" y2="18.5" />
      <line x1="8" y1="22" x2="16" y2="22" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
