"use client";

import { useEffect, useRef } from "react";
import {
  extractVoicedFrames,
  groupIntoNoteSegments,
  type VoicedFrame,
} from "@/lib/audio/noteSegments";
import type { PitchTracePoint } from "@/lib/audio/karaokeSession";

const IN_TUNE_CENTS_THRESHOLD = 15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 320;
const LEFT_AXIS_WIDTH = 40;
const BOTTOM_AXIS_HEIGHT = 20;
const RANGE_PADDING_SEMITONES = 2;
const MIN_RANGE_SEMITONES = 12;
const FALLBACK_MIN_MIDI = 48; // C3
const FALLBACK_MAX_MIDI = 72; // C5
const NOTE_LINE_WIDTH = 6;

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

    const frames = extractVoicedFrames(pitchTrace);
    const { minMidi, maxMidi } = computeMidiRange(frames);
    const midiToY = (midi: number) =>
      ((maxMidi - midi) / (maxMidi - minMidi)) * plotHeight;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = "10px sans-serif";
    for (let midi = Math.ceil(minMidi); midi <= Math.floor(maxMidi); midi++) {
      const y = midiToY(midi);
      const isC = midi % 12 === 0;
      ctx.strokeStyle = isC ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.moveTo(LEFT_AXIS_WIDTH, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
      if (isC) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillText(`C${Math.floor(midi / 12) - 1}`, 4, y + 3);
      }
    }

    const segments = groupIntoNoteSegments(frames);
    for (const segment of segments) {
      drawNoteBlob(ctx, segment, safeDuration, plotWidth, midiToY);
    }

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("0:00", LEFT_AXIS_WIDTH, CANVAS_HEIGHT - 6);
    ctx.fillText(formatTime(safeDuration), CANVAS_WIDTH - 32, CANVAS_HEIGHT - 6);
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

function drawNoteBlob(
  ctx: CanvasRenderingContext2D,
  segment: VoicedFrame[],
  safeDuration: number,
  plotWidth: number,
  midiToY: (midi: number) => number,
) {
  const mapX = (time: number) => LEFT_AXIS_WIDTH + (time / safeDuration) * plotWidth;
  const avgCents =
    segment.reduce((sum, f) => sum + f.cents, 0) / segment.length;
  const color = colorForCents(avgCents);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = NOTE_LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (segment.length === 1) {
    const frame = segment[0];
    ctx.beginPath();
    ctx.arc(
      mapX(frame.time),
      midiToY(frame.midiNumber + frame.cents / 100),
      NOTE_LINE_WIDTH / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    return;
  }

  ctx.beginPath();
  segment.forEach((frame, i) => {
    const x = mapX(frame.time);
    const y = midiToY(frame.midiNumber + frame.cents / 100);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function computeMidiRange(frames: VoicedFrame[]): { minMidi: number; maxMidi: number } {
  if (frames.length === 0) {
    return { minMidi: FALLBACK_MIN_MIDI, maxMidi: FALLBACK_MAX_MIDI };
  }

  let lowest = Infinity;
  let highest = -Infinity;
  for (const frame of frames) {
    if (frame.midiNumber < lowest) lowest = frame.midiNumber;
    if (frame.midiNumber > highest) highest = frame.midiNumber;
  }

  let minMidi = lowest - RANGE_PADDING_SEMITONES;
  let maxMidi = highest + RANGE_PADDING_SEMITONES;

  const span = maxMidi - minMidi;
  if (span < MIN_RANGE_SEMITONES) {
    const extra = (MIN_RANGE_SEMITONES - span) / 2;
    minMidi -= extra;
    maxMidi += extra;
  }

  return { minMidi, maxMidi };
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
