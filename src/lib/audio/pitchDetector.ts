import Pitchfinder from "pitchfinder";

const NOISE_GATE_RMS_THRESHOLD = 0.01;
const MEDIAN_FILTER_SIZE = 5;
const MIN_VALID_FREQUENCY = 60;
const MAX_VALID_FREQUENCY = 1500;

export interface PitchReading {
  frequency: number;
  rms: number;
}

export function createPitchDetector(sampleRate: number) {
  const yinDetector = Pitchfinder.YIN({ sampleRate });
  const recentFrequencies: number[] = [];

  return function detectPitchFromBuffer(
    buffer: Float32Array,
  ): PitchReading | null {
    const rms = computeRms(buffer);

    if (rms < NOISE_GATE_RMS_THRESHOLD) {
      recentFrequencies.length = 0;
      return null;
    }

    const rawFrequency = yinDetector(buffer);
    if (
      rawFrequency === null ||
      rawFrequency < MIN_VALID_FREQUENCY ||
      rawFrequency > MAX_VALID_FREQUENCY
    ) {
      return null;
    }

    recentFrequencies.push(rawFrequency);
    if (recentFrequencies.length > MEDIAN_FILTER_SIZE) {
      recentFrequencies.shift();
    }

    return { frequency: median(recentFrequencies), rms };
  };
}

function computeRms(buffer: Float32Array): number {
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  return Math.sqrt(sumSquares / buffer.length);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
