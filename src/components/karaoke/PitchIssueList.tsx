import type { PitchIssue, PitchIssueType } from "@/lib/scoring/pitchIssues";

const TYPE_INFO: Record<PitchIssueType, { label: string; color: string }> = {
  sharp: { label: "Terlalu tinggi", color: "text-amber-400" },
  flat: { label: "Terlalu rendah", color: "text-violet-400" },
  unstable: { label: "Kurang stabil (bergetar)", color: "text-sky-400" },
};

interface PitchIssueListProps {
  issues: PitchIssue[];
  onSelectIssue?: (issue: PitchIssue) => void;
}

export default function PitchIssueList({ issues, onSelectIssue }: PitchIssueListProps) {
  if (issues.length === 0) {
    return (
      <p className="text-sm text-emerald-400">
        Tidak ada bagian yang meleset signifikan — mantap!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-white/50">
        Bagian yang perlu diperbaiki ({issues.length}) — klik untuk lihat detail
      </p>
      <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
        {issues.map((issue, i) => (
          <li key={i}>
            <button
              onClick={() => onSelectIssue?.(issue)}
              className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-left hover:bg-white/10"
            >
              <span className="tabular-nums text-white/60">
                {formatTime(issue.startTime)}
              </span>
              <span className={TYPE_INFO[issue.type].color}>
                {TYPE_INFO[issue.type].label}
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
