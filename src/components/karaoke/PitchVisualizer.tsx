"use client";

import { useEffect, useRef } from "react";
import { frequencyToNote } from "@/lib/audio/noteUtils";
import type { PitchTracePoint } from "@/lib/audio/karaokeSession";

const MIN_MIDI = 48; // C3
const MAX_MIDI = 84; // C6
const IN_TUNE_CENTS_THRESHOLD = 15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 320;
const LEFT_AXIS_WIDTH = 40;
const BOTTOM_AXIS_HEIGHT = 20;

interface PitchVisualizerProps {
  pitchTrace: PitchTracePoint[];
  duration: number;
}

export default function PitchVisualizer({
  pitchTrace,
  duration,
}: PitchVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const plotWidth = CANVAS_WIDTH - LEFT_AXIS_WIDTH;
    const plotHeight = CANVAS_HEIGHT - BOTTOM_AXIS_HEIGHT;
    const safeDuration = duration > 0 ? duration : 1;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = "10px sans-serif";
    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi += 12) {
      const y = midiToY(midi, plotHeight);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.moveTo(LEFT_AXIS_WIDTH, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`C${Math.floor(midi / 12) - 1}`, 4, y + 3);
    }

    for (const point of pitchTrace) {
      if (point.frequency === null) continue;
      const note = frequencyToNote(point.frequency);
      if (note.midiNumber < MIN_MIDI || note.midiNumber > MAX_MIDI) continue;

      const x = LEFT_AXIS_WIDTH + (point.time / safeDuration) * plotWidth;
      const y = midiToY(note.midiNumber, plotHeight);
      ctx.fillStyle = colorForCents(note.cents);
      ctx.fillRect(x, y - 2, 3, 4);
    }

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("0:00", LEFT_AXIS_WIDTH, CANVAS_HEIGHT - 6);
    ctx.fillText(
      formatTime(safeDuration),
      CANVAS_WIDTH - 32,
      CANVAS_HEIGHT - 6,
    );
  }, [pitchTrace, duration]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full rounded-lg border border-white/10"
    />
  );
}

function midiToY(midi: number, plotHeight: number): number {
  const ratio = (MAX_MIDI - midi) / (MAX_MIDI - MIN_MIDI);
  return ratio * plotHeight;
}

function colorForCents(cents: number): string {
  if (cents > IN_TUNE_CENTS_THRESHOLD) return "#f59e0b";
  if (cents < -IN_TUNE_CENTS_THRESHOLD) return "#8b5cf6";
  return "#34d399";
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
