export async function loadAudioFile(
  file: File,
  audioContext: AudioContext,
): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

export class TrackPlayer {
  private audioContext: AudioContext;
  private buffer: AudioBuffer;
  private sourceNode: AudioBufferSourceNode | null = null;
  private startedAtContextTime = 0;
  private pausedAtOffset = 0;
  private playing = false;

  constructor(audioContext: AudioContext, buffer: AudioBuffer) {
    this.audioContext = audioContext;
    this.buffer = buffer;
  }

  get duration(): number {
    return this.buffer.duration;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  getCurrentTime(): number {
    if (!this.playing) return this.pausedAtOffset;
    return (
      this.pausedAtOffset +
      (this.audioContext.currentTime - this.startedAtContextTime)
    );
  }

  play(): void {
    if (this.playing) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.audioContext.destination);
    source.onended = () => {
      if (this.playing) {
        this.playing = false;
        this.pausedAtOffset = 0;
      }
    };
    source.start(0, this.pausedAtOffset % this.buffer.duration);
    this.startedAtContextTime = this.audioContext.currentTime;
    this.sourceNode = source;
    this.playing = true;
  }

  pause(): void {
    if (!this.playing || !this.sourceNode) return;
    this.pausedAtOffset = this.getCurrentTime();
    this.sourceNode.onended = null;
    this.sourceNode.stop();
    this.sourceNode = null;
    this.playing = false;
  }

  stop(): void {
    if (this.sourceNode) {
      this.sourceNode.onended = null;
      this.sourceNode.stop();
      this.sourceNode = null;
    }
    this.playing = false;
    this.pausedAtOffset = 0;
  }
}
