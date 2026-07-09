"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useKaraokeSession } from "@/hooks/useKaraokeSession";
import PitchVisualizer, { type TimeRange } from "./PitchVisualizer";
import PitchLegend from "./PitchLegend";
import PitchIssueList from "./PitchIssueList";
import ScoreDashboard from "./ScoreDashboard";
import { IN_TUNE_CENTS_THRESHOLD } from "@/lib/audio/noteSegments";
import { computeVocalScore } from "@/lib/scoring/vocalScoring";
import { detectPitchIssues, type PitchIssue } from "@/lib/scoring/pitchIssues";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function KaraokeStage() {
  const { t } = useLocale();
  const {
    status,
    fileName,
    duration,
    elapsed,
    liveNote,
    livePitchTrace,
    result,
    error,
    loadBackingTrack,
    start,
    stop,
  } = useKaraokeSession();

  const [zoomRange, setZoomRange] = useState<TimeRange | null>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void loadBackingTrack(file);
    },
    [loadBackingTrack],
  );

  const isRecording = status === "recording";
  const isFinished = status === "finished";
  const canStart = status === "ready" || status === "finished";
  const isInTune = liveNote ? Math.abs(liveNote.cents) <= IN_TUNE_CENTS_THRESHOLD : false;

  const score = useMemo(
    () => (result ? computeVocalScore(result.pitchTrace) : null),
    [result],
  );
  const issues = useMemo(
    () => (result ? detectPitchIssues(result.pitchTrace) : []),
    [result],
  );

  const handleSelectIssue = useCallback((issue: PitchIssue) => {
    setZoomRange({
      start: Math.max(0, issue.startTime - 1),
      end: issue.endTime + 1,
    });
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">{t("stage.title")}</h2>

      <div className="mb-4 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-sm">
        <p className="mb-2 font-medium text-white/80">{t("stage.tutorial.title")}</p>
        <ol className="list-decimal space-y-1 pl-4 text-white/60">
          <li>
            <BoldText text={t("stage.tutorial.step1")} />
          </li>
          <li>
            <BoldText text={t("stage.tutorial.step2")} />
          </li>
          <li>
            <BoldText text={t("stage.tutorial.step3")} />
          </li>
          <li>
            <BoldText text={t("stage.tutorial.step4")} />
          </li>
          <li>
            <BoldText text={t("stage.tutorial.step5")} />
          </li>
        </ol>
      </div>

      <details className="mb-4 rounded-lg bg-white/5 p-3 text-sm">
        <summary className="cursor-pointer font-medium text-white/80">
          {t("stage.help.summary")}
        </summary>
        <div className="mt-2 space-y-1.5 text-white/60">
          <p>
            <BoldText text={t("stage.help.grid")} />
          </p>
          <p>
            <BoldText text={t("stage.help.zoom")} />
          </p>
          <p>
            <BoldText text={t("stage.help.metrics")} />
          </p>
        </div>
      </details>

      <label className="mb-1.5 block text-sm font-medium text-white/80">
        {t("stage.upload.label")}
      </label>
      <p className="mb-2 text-xs text-white/50">
        <BoldText text={t("stage.upload.caption")} />
      </p>
      <input
        type="file"
        accept="audio/mpeg,audio/wav,audio/mp3,.mp3,.wav"
        onChange={handleFileChange}
        disabled={isRecording}
        className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/20 disabled:opacity-40"
      />

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {fileName && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-white/60 truncate">{fileName}</p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => {
                setZoomRange(null);
                void start();
              }}
              disabled={!canStart}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600"
            >
              {t("stage.start")}
            </button>
            <button
              onClick={() => void stop()}
              disabled={!isRecording}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600"
            >
              {t("stage.stop")}
            </button>
          </div>

          <div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all"
                style={{
                  width: `${duration ? Math.min((elapsed / duration) * 100, 100) : 0}%`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-white/50 tabular-nums">
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {isRecording && (
            <div>
              <span className="text-sm text-white/50">{t("stage.pitchLive")}</span>
              <div
                className={`text-2xl font-bold sm:text-3xl ${
                  liveNote ? (isInTune ? "text-emerald-400" : "text-amber-400") : ""
                }`}
              >
                {liveNote
                  ? `${liveNote.note}${liveNote.octave} (${
                      liveNote.cents > 0 ? "+" : ""
                    }${liveNote.cents} cents)`
                  : "—"}
              </div>
            </div>
          )}

          {(isRecording || isFinished) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">
                  {t("stage.pitchGrid")} {isRecording ? t("stage.live") : ""}
                </span>
                {isFinished && zoomRange && (
                  <button
                    onClick={() => setZoomRange(null)}
                    className="text-xs text-sky-400 hover:text-sky-300"
                  >
                    {t("stage.resetZoom")}
                  </button>
                )}
              </div>
              <PitchVisualizer
                pitchTrace={isFinished && result ? result.pitchTrace : livePitchTrace}
                duration={duration}
                interactive={isFinished}
                zoomRange={isFinished ? zoomRange : null}
                onZoomChange={setZoomRange}
              />
              <PitchLegend />
              {isFinished && (
                <p className="text-xs text-white/40">{t("stage.dragHint")}</p>
              )}
            </div>
          )}

          {isFinished && (
            <PitchIssueList issues={issues} onSelectIssue={handleSelectIssue} />
          )}

          {result && isFinished && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-sm text-white/50">
                {t("stage.vocalResult", { count: result.pitchTrace.length })}
              </p>
              <audio controls src={result.vocalUrl} className="w-full" />
            </div>
          )}

          {score && isFinished && <ScoreDashboard score={score} />}
        </div>
      )}
    </div>
  );
}

function BoldText({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-white/80">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
