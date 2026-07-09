"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  KaraokeSession,
  type KaraokeSessionResult,
  type KaraokeSessionStatus,
  type PitchTracePoint,
} from "@/lib/audio/karaokeSession";
import { frequencyToNote, type NoteInfo } from "@/lib/audio/noteUtils";

export function useKaraokeSession() {
  const [status, setStatus] = useState<KaraokeSessionStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [liveNote, setLiveNote] = useState<NoteInfo | null>(null);
  const [livePitchTrace, setLivePitchTrace] = useState<PitchTracePoint[]>([]);
  const [result, setResult] = useState<KaraokeSessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<KaraokeSession | null>(null);

  const ensureSession = useCallback(() => {
    if (!sessionRef.current) {
      sessionRef.current = new KaraokeSession({
        onStatusChange: setStatus,
        onTick: (time, point) => {
          setElapsed(time);
          setLiveNote(
            point.frequency !== null ? frequencyToNote(point.frequency) : null,
          );
          setLivePitchTrace((prev) => [...prev, point]);
        },
        onFinished: setResult,
      });
    }
    return sessionRef.current;
  }, []);

  useEffect(() => {
    return () => sessionRef.current?.dispose();
  }, []);

  const loadBackingTrack = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);
      try {
        const session = ensureSession();
        await session.loadBackingTrack(file);
        setFileName(file.name);
        setDuration(session.duration);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Gagal memuat backing track: ${err.message}`
            : "Gagal memuat backing track.",
        );
      }
    },
    [ensureSession],
  );

  const start = useCallback(async () => {
    setError(null);
    setElapsed(0);
    setLivePitchTrace([]);
    try {
      await sessionRef.current?.start();
    } catch (err) {
      setError(
        err instanceof Error
          ? `Gagal memulai rekaman: ${err.message}`
          : "Gagal memulai rekaman.",
      );
    }
  }, []);

  const stop = useCallback(async () => {
    await sessionRef.current?.stop();
  }, []);

  return {
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
  };
}
