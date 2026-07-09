"use client";

import { useCallback, useMemo, useState } from "react";
import { useKaraokeSession } from "@/hooks/useKaraokeSession";
import PitchVisualizer, { type TimeRange } from "./PitchVisualizer";
import PitchLegend from "./PitchLegend";
import PitchIssueList from "./PitchIssueList";
import ScoreDashboard from "./ScoreDashboard";
import { IN_TUNE_CENTS_THRESHOLD } from "@/lib/audio/noteSegments";
import { computeVocalScore } from "@/lib/scoring/vocalScoring";
import { detectPitchIssues, type PitchIssue } from "@/lib/scoring/pitchIssues";

export default function KaraokeStage() {
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold mb-4">Karaoke Session</h2>

      <details className="mb-4 rounded-lg bg-white/5 p-3 text-sm">
        <summary className="cursor-pointer font-medium text-white/80">
          Cara membaca hasil analisis
        </summary>
        <div className="mt-2 space-y-1.5 text-white/60">
          <p>
            <strong className="text-white/80">Pitch Grid</strong> menampilkan
            nada yang kamu nyanyikan dari waktu ke waktu — sumbu vertikal
            adalah nada, sumbu horizontal adalah waktu. Hijau berarti nada
            tepat, kuning berarti terlalu tinggi, ungu berarti terlalu rendah.
          </p>
          <p>
            Setelah selesai, kamu bisa{" "}
            <strong className="text-white/80">
              seret (drag) pada grid untuk memperbesar (zoom)
            </strong>{" "}
            bagian tertentu, atau klik salah satu item di daftar{" "}
            <strong className="text-white/80">
              &quot;Bagian yang perlu diperbaiki&quot;
            </strong>{" "}
            untuk langsung melihat detailnya.
          </p>
          <p>
            <strong className="text-white/80">Akurasi Nada</strong> mengukur
            seberapa presisi nadamu, <strong className="text-white/80">
              Stabilitas Kontrol
            </strong>{" "}
            mengukur seberapa steady kamu menahan nada panjang, dan{" "}
            <strong className="text-white/80">Frekuensi Fals</strong> menghitung
            berapa kali nadamu melenceng cukup jauh.
          </p>
        </div>
      </details>

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

          <div className="flex gap-2">
            <button
              onClick={() => {
                setZoomRange(null);
                void start();
              }}
              disabled={!canStart}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600"
            >
              Mulai Karaoke
            </button>
            <button
              onClick={() => void stop()}
              disabled={!isRecording}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600"
            >
              Stop
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
              <span className="text-sm text-white/50">Pitch Live</span>
              <div
                className={`text-3xl font-bold ${
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
                  Pitch Grid {isRecording ? "(live)" : ""}
                </span>
                {isFinished && zoomRange && (
                  <button
                    onClick={() => setZoomRange(null)}
                    className="text-xs text-sky-400 hover:text-sky-300"
                  >
                    Reset Zoom
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
                <p className="text-xs text-white/40">
                  Seret (drag) pada grid untuk memperbesar bagian tertentu.
                </p>
              )}
            </div>
          )}

          {isFinished && (
            <PitchIssueList issues={issues} onSelectIssue={handleSelectIssue} />
          )}

          {result && isFinished && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-sm text-white/50">
                Hasil rekaman vokal ({result.pitchTrace.length} sampel pitch
                tercatat)
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
