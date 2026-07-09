export interface MicrophoneSource {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  stream: MediaStream;
  stop: () => void;
}

const FFT_SIZE = 2048;

export async function createMicrophoneSource(): Promise<MicrophoneSource> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  source.connect(analyser);

  const stop = () => {
    stream.getTracks().forEach((track) => track.stop());
    void audioContext.close();
  };

  return { audioContext, analyser, stream, stop };
}
