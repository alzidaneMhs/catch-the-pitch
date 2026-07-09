import type { VocalGrade, VocalScoreResult } from "@/lib/scoring/vocalScoring";

const GRADE_COLORS: Record<VocalGrade, string> = {
  A: "text-emerald-400",
  B: "text-sky-400",
  C: "text-amber-400",
  D: "text-orange-400",
  F: "text-red-400",
};

interface ScoreDashboardProps {
  score: VocalScoreResult;
}

export default function ScoreDashboard({ score }: ScoreDashboardProps) {
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
          <p className="text-sm text-white/50">Overall Score</p>
          <p className="text-xs text-white/40">
            Gabungan akurasi nada (60%) dan stabilitas kontrol (40%).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScoreBar
          label="Akurasi Nada"
          value={score.accuracyScore}
          description="Seberapa dekat nada yang kamu nyanyikan dengan nada yang benar. Semakin tinggi, semakin presisi."
        />
        <ScoreBar
          label="Stabilitas Kontrol"
          value={score.stabilityScore}
          description="Seberapa stabil kamu menahan nada panjang tanpa goyang atau naik-turun tak sengaja."
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-white/50">Frekuensi Fals</span>
          <div className="text-lg font-semibold">{score.offPitchCount}x</div>
          <p className="text-xs text-white/40">
            Jumlah bagian nada yang melenceng cukup jauh (lebih dari ±15 sen)
            dari nada yang seharusnya.
          </p>
        </div>
        <div>
          <span className="text-white/50">Vocal Range</span>
          <div className="text-lg font-semibold">
            {score.vocalRange
              ? `${score.vocalRange.lowestNote} – ${score.vocalRange.highestNote}`
              : "—"}
          </div>
          {score.vocalRange && (
            <span className="text-xs text-white/40">
              {score.vocalRange.classification} — rentang nada terendah sampai
              tertinggi yang berhasil kamu capai.
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
