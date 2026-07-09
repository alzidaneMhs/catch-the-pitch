"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadAudioFile, TrackPlayer as TrackPlayerEngine } from "@/lib/audio/playback";

export default function TrackPlayer() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<TrackPlayerEngine | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopProgressLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopProgressLoop();
      playerRef.current?.stop();
      void audioContextRef.current?.close();
    };
  }, [stopProgressLoop]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);
      playerRef.current?.stop();
      stopProgressLoop();

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const buffer = await loadAudioFile(file, audioContextRef.current);
        playerRef.current = new TrackPlayerEngine(
          audioContextRef.current,
          buffer,
        );
        setFileName(file.name);
        setDuration(buffer.duration);
        setCurrentTime(0);
        setIsPlaying(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Gagal memuat file audio: ${err.message}`
            : "Gagal memuat file audio.",
        );
      }
    },
    [stopProgressLoop],
  );

  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      if (!playerRef.current) return;
      setCurrentTime(playerRef.current.getCurrentTime());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => stopProgressLoop();
  }, [isPlaying, stopProgressLoop]);

  const handlePlay = useCallback(() => {
    playerRef.current?.play();
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    playerRef.current?.pause();
    stopProgressLoop();
    setIsPlaying(false);
  }, [stopProgressLoop]);

  const handleStop = useCallback(() => {
    playerRef.current?.stop();
    stopProgressLoop();
    setIsPlaying(false);
    setCurrentTime(0);
  }, [stopProgressLoop]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold mb-4">Backing Track Player</h2>

      <input
        type="file"
        accept="audio/mpeg,audio/wav,audio/mp3,.mp3,.wav"
        onChange={handleFileChange}
        className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/20"
      />

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {fileName && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-white/60 truncate">{fileName}</p>

          <div className="flex gap-2">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600"
            >
              Play
            </button>
            <button
              onClick={handlePause}
              disabled={!isPlaying}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600"
            >
              Pause
            </button>
            <button
              onClick={handleStop}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              Stop
            </button>
          </div>

          <div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-sky-500"
                style={{
                  width: `${duration ? Math.min((currentTime / duration) * 100, 100) : 0}%`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-white/50 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
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
