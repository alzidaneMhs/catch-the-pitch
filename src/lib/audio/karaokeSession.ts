import { createMicrophoneSource, type MicrophoneSource } from "./microphone";
import { createPitchDetector } from "./pitchDetector";
import { loadAudioFile, TrackPlayer } from "./playback";

export interface PitchTracePoint {
  time: number;
  frequency: number | null;
}

export interface KaraokeSessionResult {
  vocalBlob: Blob;
  vocalUrl: string;
  pitchTrace: PitchTracePoint[];
  durationSeconds: number;
}

export type KaraokeSessionStatus =
  | "idle"
  | "loading"
  | "ready"
  | "recording"
  | "finished";

interface KaraokeSessionCallbacks {
  onStatusChange?: (status: KaraokeSessionStatus) => void;
  onTick?: (elapsedSeconds: number, currentReading: PitchTracePoint) => void;
  onFinished?: (result: KaraokeSessionResult) => void;
  onError?: (message: string) => void;
}

const RECORDER_MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function pickSupportedMimeType(): string | undefined {
  return RECORDER_MIME_CANDIDATES.find((type) =>
    typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type),
  );
}

export class KaraokeSession {
  private playbackContext = new AudioContext();
  private trackPlayer: TrackPlayer | null = null;
  private micSource: MicrophoneSource | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private pitchTrace: PitchTracePoint[] = [];
  private startedAt = 0;
  private rafId: number | null = null;
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null;
  private stopping = false;
  private callbacks: KaraokeSessionCallbacks;

  constructor(callbacks: KaraokeSessionCallbacks = {}) {
    this.callbacks = callbacks;
  }

  get duration(): number {
    return this.trackPlayer?.duration ?? 0;
  }

  async loadBackingTrack(file: File): Promise<void> {
    this.callbacks.onStatusChange?.("loading");
    const buffer = await loadAudioFile(file, this.playbackContext);
    this.trackPlayer = new TrackPlayer(this.playbackContext, buffer);
    this.callbacks.onStatusChange?.("ready");
  }

  async start(latencyOffsetMs: number = 0): Promise<void> {
    if (!this.trackPlayer) throw new Error("Backing track belum dimuat");

    this.micSource = await createMicrophoneSource();
    const detector = createPitchDetector(this.micSource.audioContext.sampleRate);
    const buffer = new Float32Array(this.micSource.analyser.fftSize);
    const offsetSeconds = latencyOffsetMs / 1000;

    const mimeType = pickSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(
      this.micSource.stream,
      mimeType ? { mimeType } : undefined,
    );
    this.recordedChunks = [];
    this.pitchTrace = [];
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.recordedChunks.push(event.data);
    };

    this.stopping = false;
    this.mediaRecorder.start();
    this.trackPlayer.play();
    this.startedAt = performance.now();
    this.callbacks.onStatusChange?.("recording");

    const tick = () => {
      if (!this.micSource) return;
      this.micSource.analyser.getFloatTimeDomainData(buffer);
      const reading = detector(buffer);
      const elapsedSeconds = (performance.now() - this.startedAt) / 1000;
      // point.time dikalibrasi dengan offset latensi (untuk akurasi Pitch Grid
      // & daftar masalah), sedangkan elapsedSeconds tetap wall-clock asli
      // supaya progress bar & auto-stop timer tidak ikut bergeser.
      const point: PitchTracePoint = {
        time: Math.max(0, elapsedSeconds + offsetSeconds),
        frequency: reading?.frequency ?? null,
      };
      this.pitchTrace.push(point);
      this.callbacks.onTick?.(elapsedSeconds, point);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);

    this.autoStopTimer = setTimeout(() => {
      void this.stop();
    }, this.duration * 1000 + 200);
  }

  async stop(): Promise<KaraokeSessionResult | null> {
    if (this.stopping || !this.mediaRecorder) return null;
    this.stopping = true;

    if (this.autoStopTimer !== null) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.trackPlayer?.stop();

    const result = await new Promise<KaraokeSessionResult>((resolve) => {
      const recorder = this.mediaRecorder!;
      recorder.onstop = () => {
        const vocalBlob = new Blob(this.recordedChunks, {
          type: recorder.mimeType || "audio/webm",
        });
        resolve({
          vocalBlob,
          vocalUrl: URL.createObjectURL(vocalBlob),
          pitchTrace: this.pitchTrace,
          durationSeconds: (performance.now() - this.startedAt) / 1000,
        });
      };
      recorder.stop();
    });

    this.micSource?.stop();
    this.micSource = null;
    this.mediaRecorder = null;

    this.callbacks.onStatusChange?.("finished");
    this.callbacks.onFinished?.(result);
    return result;
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.autoStopTimer !== null) clearTimeout(this.autoStopTimer);
    this.trackPlayer?.stop();
    this.micSource?.stop();
    void this.playbackContext.close();
  }
}
