"use client";

import type { PitchIssue, PitchIssueType } from "@/lib/scoring/pitchIssues";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const TYPE_COLOR: Record<PitchIssueType, string> = {
  sharp: "text-amber-400",
  flat: "text-violet-400",
  unstable: "text-sky-400",
};

const TYPE_LABEL_KEY: Record<PitchIssueType, TranslationKey> = {
  sharp: "legend.sharp",
  flat: "legend.flat",
  unstable: "issues.type.unstable",
};

interface PitchIssueListProps {
  issues: PitchIssue[];
  onSelectIssue?: (issue: PitchIssue) => void;
}

export default function PitchIssueList({ issues, onSelectIssue }: PitchIssueListProps) {
  const { t } = useLocale();

  if (issues.length === 0) {
    return <p className="text-sm text-emerald-400">{t("issues.none")}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-white/50">
        {t("issues.title", { count: issues.length })}
      </p>
      <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
        {issues.map((issue, i) => (
          <li key={i}>
            <button
              onClick={() => onSelectIssue?.(issue)}
              className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg bg-white/5 px-3 py-1.5 text-left hover:bg-white/10"
            >
              <span className="tabular-nums text-white/60">
                {formatTime(issue.startTime)}
              </span>
              <span className={TYPE_COLOR[issue.type]}>
                {t(TYPE_LABEL_KEY[issue.type])}
              </span>
              <span className="text-white/40">
                {issue.noteName} (
                {issue.avgCentsDeviation > 0 ? "+" : ""}
                {issue.avgCentsDeviation}c)
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
