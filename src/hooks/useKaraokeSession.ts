"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  KaraokeSession,
  type KaraokeSessionResult,
  type KaraokeSessionStatus,
  type PitchTracePoint,
} from "@/lib/audio/karaokeSession";
import { frequencyToNote, type NoteInfo } from "@/lib/audio/noteUtils";
import { classifyMicError, type MicErrorType } from "@/lib/audio/micErrors";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function useKaraokeSession() {
  const { t } = useLocale();
  const [status, setStatus] = useState<KaraokeSessionStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [liveNote, setLiveNote] = useState<NoteInfo | null>(null);
  const [livePitchTrace, setLivePitchTrace] = useState<PitchTracePoint[]>([]);
  const [result, setResult] = useState<KaraokeSessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micErrorType, setMicErrorType] = useState<MicErrorType | null>(null);

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
      setMicErrorType(null);
      setResult(null);
      try {
        const session = ensureSession();
        await session.loadBackingTrack(file);
        setFileName(file.name);
        setDuration(session.duration);
      } catch (err) {
        setError(
          err instanceof Error
            ? t("error.loadTrack", { message: err.message })
            : t("error.loadTrackGeneric"),
        );
      }
    },
    [ensureSession, t],
  );

  const start = useCallback(
    async (latencyOffsetMs: number = 0) => {
      setError(null);
      setMicErrorType(null);
      setElapsed(0);
      setLivePitchTrace([]);
      try {
        await sessionRef.current?.start(latencyOffsetMs);
      } catch (err) {
        setMicErrorType(classifyMicError(err));
        setError(
          err instanceof Error
            ? t("error.startRecording", { message: err.message })
            : t("error.startRecordingGeneric"),
        );
      }
    },
    [t],
  );

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
    micErrorType,
    loadBackingTrack,
    start,
    stop,
  };
}
