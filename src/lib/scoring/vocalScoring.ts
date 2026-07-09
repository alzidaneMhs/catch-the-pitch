import { midiToNoteName } from "@/lib/audio/noteUtils";
import {
  centsStdDev,
  extractVoicedFrames,
  groupIntoNoteSegments,
  IN_TUNE_CENTS_THRESHOLD,
  type VoicedFrame,
} from "@/lib/audio/noteSegments";
import type { PitchTracePoint } from "@/lib/audio/karaokeSession";

const MIN_SUSTAINED_FRAMES = 5;

export type VocalGrade = "A" | "B" | "C" | "D" | "F";

export type VocalType =
  | "bass"
  | "baritone"
  | "tenor"
  | "alto"
  | "mezzoSoprano"
  | "soprano";

export interface VocalRangeResult {
  lowestNote: string;
  highestNote: string;
  classification: VocalType;
}

export interface VocalScoreResult {
  accuracyScore: number;
  stabilityScore: number;
  overallScore: number;
  grade: VocalGrade;
  offPitchCount: number;
  vocalRange: VocalRangeResult | null;
}

// Rentang not standar per jenis suara (referensi umum, dalam MIDI number).
const VOCAL_TYPE_RANGES: { type: VocalType; minMidi: number; maxMidi: number }[] = [
  { type: "bass", minMidi: 40, maxMidi: 64 },
  { type: "baritone", minMidi: 45, maxMidi: 69 },
  { type: "tenor", minMidi: 48, maxMidi: 72 },
  { type: "alto", minMidi: 53, maxMidi: 77 },
  { type: "mezzoSoprano", minMidi: 57, maxMidi: 81 },
  { type: "soprano", minMidi: 60, maxMidi: 84 },
];

const EMPTY_RESULT: VocalScoreResult = {
  accuracyScore: 0,
  stabilityScore: 0,
  overallScore: 0,
  grade: "F",
  offPitchCount: 0,
  vocalRange: null,
};

export function computeVocalScore(pitchTrace: PitchTracePoint[]): VocalScoreResult {
  const voiced = extractVoicedFrames(pitchTrace);
  if (voiced.length === 0) return EMPTY_RESULT;

  const accuracyScore = computeAccuracyScore(voiced);
  const stabilityScore = computeStabilityScore(voiced);
  const overallScore = clamp(accuracyScore * 0.6 + stabilityScore * 0.4, 0, 100);

  return {
    accuracyScore: Math.round(accuracyScore),
    stabilityScore: Math.round(stabilityScore),
    overallScore: Math.round(overallScore),
    grade: scoreToGrade(overallScore),
    offPitchCount: countOffPitchSegments(voiced),
    vocalRange: computeVocalRange(voiced),
  };
}

// Akurasi dinilai dari seberapa dekat tiap frame ke not terdekat (deviasi cents),
// bukan perbandingan ke melodi referensi lagu asli -- lagu instrumen tidak
// menyertakan data melodi vokal referensi.
function computeAccuracyScore(frames: VoicedFrame[]): number {
  const meanAbsCents =
    frames.reduce((sum, f) => sum + Math.abs(f.cents), 0) / frames.length;
  return clamp(100 - meanAbsCents * 1.5, 0, 100);
}

function countOffPitchSegments(frames: VoicedFrame[]): number {
  let count = 0;
  let wasOffPitch = false;
  for (const frame of frames) {
    const isOffPitch = Math.abs(frame.cents) > IN_TUNE_CENTS_THRESHOLD;
    if (isOffPitch && !wasOffPitch) count++;
    wasOffPitch = isOffPitch;
  }
  return count;
}

function computeStabilityScore(frames: VoicedFrame[]): number {
  const sustainedSegments = groupIntoNoteSegments(frames).filter(
    (segment) => segment.length >= MIN_SUSTAINED_FRAMES,
  );
  if (sustainedSegments.length === 0) return 100;

  const avgStdDev =
    sustainedSegments.reduce((sum, segment) => sum + centsStdDev(segment), 0) /
    sustainedSegments.length;
  return clamp(100 - avgStdDev * 2, 0, 100);
}

function computeVocalRange(frames: VoicedFrame[]): VocalRangeResult {
  let lowestMidi = Infinity;
  let highestMidi = -Infinity;
  for (const frame of frames) {
    if (frame.midiNumber < lowestMidi) lowestMidi = frame.midiNumber;
    if (frame.midiNumber > highestMidi) highestMidi = frame.midiNumber;
  }

  return {
    lowestNote: midiToNoteName(lowestMidi),
    highestNote: midiToNoteName(highestMidi),
    classification: classifyVocalType(lowestMidi, highestMidi),
  };
}

function classifyVocalType(lowestMidi: number, highestMidi: number): VocalType {
  let bestMatch = VOCAL_TYPE_RANGES[0].type;
  let bestOverlap = -Infinity;
  for (const range of VOCAL_TYPE_RANGES) {
    const overlap =
      Math.min(highestMidi, range.maxMidi) - Math.max(lowestMidi, range.minMidi);
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestMatch = range.type;
    }
  }
  return bestMatch;
}

function scoreToGrade(score: number): VocalGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
