"use client";

import { useCallback } from "react";
import { useKaraokeSession } from "@/hooks/useKaraokeSession";
import PitchVisualizer from "./PitchVisualizer";

const IN_TUNE_CENTS_THRESHOLD = 15;

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

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void loadBackingTrack(file);
    },
    [loadBackingTrack],
  );

  const isRecording = status === "recording";
  const canStart = status === "ready" || status === "finished";
  const isInTune = liveNote ? Math.abs(liveNote.cents) <= IN_TUNE_CENTS_THRESHOLD : false;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold mb-4">Karaoke Session</h2>

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
              onClick={() => void start()}
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

          {(isRecording || status === "finished") && (
            <div className="space-y-2">
              <span className="text-sm text-white/50">
                Pitch Grid {isRecording ? "(live)" : ""}
              </span>
              <PitchVisualizer
                pitchTrace={
                  status === "finished" && result
                    ? result.pitchTrace
                    : livePitchTrace
                }
                duration={duration}
              />
            </div>
          )}

          {result && status === "finished" && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-sm text-white/50">
                Hasil rekaman vokal ({result.pitchTrace.length} sampel pitch
                tercatat)
              </p>
              <audio controls src={result.vocalUrl} className="w-full" />
            </div>
          )}
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
