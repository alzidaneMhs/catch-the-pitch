import { midiToNoteName } from "@/lib/audio/noteUtils";
import {
  centsStdDev,
  extractVoicedFrames,
  groupIntoNoteSegments,
  IN_TUNE_CENTS_THRESHOLD,
} from "@/lib/audio/noteSegments";
import type { PitchTracePoint } from "@/lib/audio/karaokeSession";

const MIN_ISSUE_FRAMES = 5;
const UNSTABLE_STD_DEV_THRESHOLD = 25; // cents
const MERGE_GAP_SECONDS = 0.3;

export type PitchIssueType = "sharp" | "flat" | "unstable";

export interface PitchIssue {
  type: PitchIssueType;
  startTime: number;
  endTime: number;
  noteName: string;
  avgCentsDeviation: number;
}

export function detectPitchIssues(pitchTrace: PitchTracePoint[]): PitchIssue[] {
  const frames = extractVoicedFrames(pitchTrace);
  const segments = groupIntoNoteSegments(frames);
  const rawIssues: PitchIssue[] = [];

  for (const segment of segments) {
    if (segment.length < MIN_ISSUE_FRAMES) continue;

    const avgCents =
      segment.reduce((sum, f) => sum + f.cents, 0) / segment.length;

    let type: PitchIssueType | null = null;
    if (avgCents > IN_TUNE_CENTS_THRESHOLD) type = "sharp";
    else if (avgCents < -IN_TUNE_CENTS_THRESHOLD) type = "flat";
    else if (centsStdDev(segment) > UNSTABLE_STD_DEV_THRESHOLD) type = "unstable";

    if (type) {
      rawIssues.push({
        type,
        startTime: segment[0].time,
        endTime: segment[segment.length - 1].time,
        noteName: midiToNoteName(segment[0].midiNumber),
        avgCentsDeviation: Math.round(avgCents),
      });
    }
  }

  rawIssues.sort((a, b) => a.startTime - b.startTime);
  return mergeCloseIssues(rawIssues);
}

// Not yang goyang cepat lintas batas semitone bisa terpecah jadi banyak segmen
// sharp/flat bergantian dalam waktu berdekatan -- itu sebenarnya satu masalah
// ("nada tidak stabil"), bukan beberapa masalah terpisah. Gabungkan supaya
// daftar hasil lebih bermakna bagi pengguna.
function mergeCloseIssues(issues: PitchIssue[]): PitchIssue[] {
  if (issues.length === 0) return issues;

  const merged: PitchIssue[] = [];
  let group = [issues[0]];

  for (let i = 1; i < issues.length; i++) {
    const issue = issues[i];
    const prev = group[group.length - 1];
    if (issue.startTime - prev.endTime <= MERGE_GAP_SECONDS) {
      group.push(issue);
    } else {
      merged.push(combineIssueGroup(group));
      group = [issue];
    }
  }
  merged.push(combineIssueGroup(group));

  return merged;
}

function combineIssueGroup(group: PitchIssue[]): PitchIssue {
  if (group.length === 1) return group[0];

  const hasSharp = group.some((issue) => issue.type === "sharp");
  const hasFlat = group.some((issue) => issue.type === "flat");
  const type: PitchIssueType = hasSharp && hasFlat ? "unstable" : group[0].type;

  return {
    type,
    startTime: group[0].startTime,
    endTime: group[group.length - 1].endTime,
    noteName: group[0].noteName,
    avgCentsDeviation: Math.round(
      group.reduce((sum, issue) => sum + issue.avgCentsDeviation, 0) / group.length,
    ),
  };
}
