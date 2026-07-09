"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  extractVoicedFrames,
  groupIntoNoteSegments,
  IN_TUNE_CENTS_THRESHOLD,
  type VoicedFrame,
} from "@/lib/audio/noteSegments";
import type { PitchTracePoint } from "@/lib/audio/karaokeSession";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 320;
const LEFT_AXIS_WIDTH = 40;
const BOTTOM_AXIS_HEIGHT = 20;
const RANGE_PADDING_SEMITONES = 2;
const MIN_RANGE_SEMITONES = 12;
const FALLBACK_MIN_MIDI = 48; // C3
const FALLBACK_MAX_MIDI = 72; // C5
const NOTE_LINE_WIDTH = 6;
const MIN_DRAG_SECONDS = 0.3;

export interface TimeRange {
  start: number;
  end: number;
}

interface PitchVisualizerProps {
  pitchTrace: PitchTracePoint[];
  duration: number;
  interactive?: boolean;
  zoomRange?: TimeRange | null;
  onZoomChange?: (range: TimeRange | null) => void;
}

export default function PitchVisualizer({
  pitchTrace,
  duration,
  interactive = false,
  zoomRange = null,
  onZoomChange,
}: PitchVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);

  const safeDuration = duration > 0 ? duration : 1;
  const range: TimeRange = useMemo(
    () => zoomRange ?? { start: 0, end: safeDuration },
    [zoomRange, safeDuration],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const plotWidth = CANVAS_WIDTH - LEFT_AXIS_WIDTH;
    const plotHeight = CANVAS_HEIGHT - BOTTOM_AXIS_HEIGHT;
    const mapX = (time: number) =>
      LEFT_AXIS_WIDTH +
      ((time - range.start) / (range.end - range.start || 1)) * plotWidth;

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

    ctx.save();
    ctx.beginPath();
    ctx.rect(LEFT_AXIS_WIDTH, 0, plotWidth, plotHeight);
    ctx.clip();

    const segments = groupIntoNoteSegments(frames);
    for (const segment of segments) {
      drawNoteBlob(ctx, segment, mapX, midiToY);
    }

    if (dragStart !== null && dragCurrent !== null) {
      const x1 = mapX(dragStart);
      const x2 = mapX(dragCurrent);
      ctx.fillStyle = "rgba(56,189,248,0.15)";
      ctx.fillRect(Math.min(x1, x2), 0, Math.abs(x2 - x1), plotHeight);
    }

    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(formatTime(range.start), LEFT_AXIS_WIDTH, CANVAS_HEIGHT - 6);
    ctx.fillText(formatTime(range.end), CANVAS_WIDTH - 32, CANVAS_HEIGHT - 6);
  }, [pitchTrace, range, dragStart, dragCurrent]);

  const pixelToTime = (event: MouseEvent<HTMLCanvasElement>): number => {
    const canvas = canvasRef.current;
    if (!canvas) return range.start;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const xPx = (event.clientX - rect.left) * scaleX;
    const plotWidth = CANVAS_WIDTH - LEFT_AXIS_WIDTH;
    const ratio = clamp((xPx - LEFT_AXIS_WIDTH) / plotWidth, 0, 1);
    return range.start + ratio * (range.end - range.start);
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const time = pixelToTime(event);
    setDragStart(time);
    setDragCurrent(time);
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || dragStart === null) return;
    setDragCurrent(pixelToTime(event));
  };

  const finishDrag = () => {
    if (dragStart === null || dragCurrent === null) return;
    const start = Math.min(dragStart, dragCurrent);
    const end = Math.max(dragStart, dragCurrent);
    if (end - start >= MIN_DRAG_SECONDS) {
      onZoomChange?.({ start, end });
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={finishDrag}
      onMouseLeave={finishDrag}
      className={`w-full rounded-lg border border-white/10 ${interactive ? "cursor-crosshair" : ""}`}
    />
  );
}

function drawNoteBlob(
  ctx: CanvasRenderingContext2D,
  segment: VoicedFrame[],
  mapX: (time: number) => number,
  midiToY: (midi: number) => number,
) {
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
