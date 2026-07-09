"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createMicrophoneSource } from "@/lib/audio/microphone";
import { createPitchDetector } from "@/lib/audio/pitchDetector";
import { frequencyToNote } from "@/lib/audio/noteUtils";

const IN_TUNE_CENTS_THRESHOLD = 15;

export default function MicPitchDemo() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [volume, setVolume] = useState(0);

  const sourceRef = useRef<Awaited<
    ReturnType<typeof createMicrophoneSource>
  > | null>(null);
  const detectorRef = useRef<ReturnType<typeof createPitchDetector> | null>(
    null,
  );
  const rafRef = useRef<number | null>(null);

  const stopListening = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    sourceRef.current?.stop();
    sourceRef.current = null;
    detectorRef.current = null;
    setIsListening(false);
    setFrequency(null);
    setVolume(0);
  }, []);

  useEffect(() => stopListening, [stopListening]);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      const source = await createMicrophoneSource();
      sourceRef.current = source;
      detectorRef.current = createPitchDetector(
        source.audioContext.sampleRate,
      );

      const buffer = new Float32Array(source.analyser.fftSize);

      const tick = () => {
        const { analyser } = source;
        analyser.getFloatTimeDomainData(buffer);
        const reading = detectorRef.current?.(buffer) ?? null;

        if (reading) {
          setFrequency(reading.frequency);
          setVolume(reading.rms);
        } else {
          setFrequency(null);
          setVolume(0);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      setIsListening(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Gagal mengakses mikrofon: ${err.message}`
          : "Gagal mengakses mikrofon.",
      );
    }
  }, []);

  const noteInfo = frequency !== null ? frequencyToNote(frequency) : null;
  const isInTune = noteInfo
    ? Math.abs(noteInfo.cents) <= IN_TUNE_CENTS_THRESHOLD
    : false;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold mb-4">Mic Pitch Demo</h2>

      <button
        onClick={isListening ? stopListening : startListening}
        className={`rounded-lg px-4 py-2 font-medium transition-colors ${
          isListening
            ? "bg-red-600 hover:bg-red-500 text-white"
            : "bg-emerald-600 hover:bg-emerald-500 text-white"
        }`}
      >
        {isListening ? "Stop Mic" : "Start Mic"}
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-6 space-y-3">
        <div>
          <span className="text-sm text-white/50">Frekuensi</span>
          <div className="text-4xl font-bold tabular-nums">
            {frequency ? `${frequency.toFixed(1)} Hz` : "—"}
          </div>
        </div>

        <div>
          <span className="text-sm text-white/50">Not Terdeteksi</span>
          <div
            className={`text-3xl font-bold ${
              noteInfo ? (isInTune ? "text-emerald-400" : "text-amber-400") : ""
            }`}
          >
            {noteInfo
              ? `${noteInfo.note}${noteInfo.octave} (${
                  noteInfo.cents > 0 ? "+" : ""
                }${noteInfo.cents} cents)`
              : "—"}
          </div>
        </div>

        <div>
          <span className="text-sm text-white/50">Volume</span>
          <div className="h-2 w-full max-w-xs rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all"
              style={{ width: `${Math.min(volume * 400, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
