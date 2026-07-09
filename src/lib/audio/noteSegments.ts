import { frequencyToNote } from "./noteUtils";
import type { PitchTracePoint } from "./karaokeSession";

const DEFAULT_SEGMENT_GAP_SECONDS = 0.25;

export interface VoicedFrame {
  time: number;
  frequency: number;
  midiNumber: number;
  cents: number;
}

export function extractVoicedFrames(pitchTrace: PitchTracePoint[]): VoicedFrame[] {
  const frames: VoicedFrame[] = [];
  for (const point of pitchTrace) {
    if (point.frequency === null) continue;
    const note = frequencyToNote(point.frequency);
    frames.push({
      time: point.time,
      frequency: point.frequency,
      midiNumber: note.midiNumber,
      cents: note.cents,
    });
  }
  return frames;
}

export function groupIntoNoteSegments(
  frames: VoicedFrame[],
  gapSeconds: number = DEFAULT_SEGMENT_GAP_SECONDS,
): VoicedFrame[][] {
  const segments: VoicedFrame[][] = [];
  let current: VoicedFrame[] = [];

  frames.forEach((frame, i) => {
    const prev = frames[i - 1];
    const continuesSameNote =
      prev !== undefined &&
      prev.midiNumber === frame.midiNumber &&
      frame.time - prev.time <= gapSeconds;

    if (continuesSameNote) {
      current.push(frame);
    } else {
      if (current.length > 0) segments.push(current);
      current = [frame];
    }
  });
  if (current.length > 0) segments.push(current);

  return segments;
}
