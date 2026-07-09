"use client";

import type { VocalGrade, VocalScoreResult, VocalType } from "@/lib/scoring/vocalScoring";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const GRADE_COLORS: Record<VocalGrade, string> = {
  A: "text-emerald-400",
  B: "text-sky-400",
  C: "text-amber-400",
  D: "text-orange-400",
  F: "text-red-400",
};

const VOCAL_TYPE_KEY: Record<VocalType, TranslationKey> = {
  bass: "vocalType.bass",
  baritone: "vocalType.baritone",
  tenor: "vocalType.tenor",
  alto: "vocalType.alto",
  mezzoSoprano: "vocalType.mezzoSoprano",
  soprano: "vocalType.soprano",
};

interface ScoreDashboardProps {
  score: VocalScoreResult;
}

export default function ScoreDashboard({ score }: ScoreDashboardProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <div className="flex items-center gap-4">
        <div className={`text-6xl font-black ${GRADE_COLORS[score.grade]}`}>
          {score.grade}
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {score.overallScore}
            <span className="text-base font-normal text-white/40">/100</span>
          </div>
          <p className="text-sm text-white/50">{t("score.overall")}</p>
          <p className="text-xs text-white/40">{t("score.overall.caption")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ScoreBar
          label={t("score.accuracy.label")}
          value={score.accuracyScore}
          description={t("score.accuracy.desc")}
        />
        <ScoreBar
          label={t("score.stability.label")}
          value={score.stabilityScore}
          description={t("score.stability.desc")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <span className="text-white/50">{t("score.offPitch.label")}</span>
          <div className="text-lg font-semibold">{score.offPitchCount}×</div>
          <p className="text-xs text-white/40">{t("score.offPitch.desc")}</p>
        </div>
        <div>
          <span className="text-white/50">{t("score.vocalRange.label")}</span>
          <div className="text-lg font-semibold">
            {score.vocalRange
              ? `${score.vocalRange.lowestNote} – ${score.vocalRange.highestNote}`
              : "—"}
          </div>
          {score.vocalRange && (
            <span className="text-xs text-white/40">
              {t(VOCAL_TYPE_KEY[score.vocalRange.classification])} —{" "}
              {t("score.vocalRange.desc")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-white/50">{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-sky-500" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-1 text-xs text-white/40">{description}</p>
    </div>
  );
}
