#Catch The Pitch
A web-based karaoke application and real-time vocal performance analyzer — detects out-of-tune notes, visualizes pitch Melodyne-style, and provides vocal scoring/grading.

1. Next.js (App Router) + TypeScript + Tailwind CSS project setup.
2. Web Audio API: capturing microphone input (`getUserMedia`) and playing audio files (`decodeAudioData` + `AudioBufferSourceNode`).
3. Real-time pitch detection using Pitchfinder (https://github.com/peterkhayes/pitchfinder) (YIN algorithm), featuring a noise gate (RMS threshold) and a median filter for smoothing.

### Audio code structure
- `src/lib/audio/microphone.ts` — sets up `AudioContext` + `AnalyserNode` from the microphone input.
- `src/lib/audio/pitchDetector.ts` — wrapper for Pitchfinder YIN + noise gate + median filter.
- `src/lib/audio/noteUtils.ts` — converts frequency (Hz) to musical note names + cents deviation.
- `src/lib/audio/playback.ts` — handles audio file playback (backing track) with play/pause/stop functionality.
- `src/components/audio/MicPitchDemo.tsx` — UI demo for real-time pitch detection from the microphone.
- `src/components/audio/TrackPlayer.tsx` — UI demo for uploading & playing backing tracks.

## Running the project

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) Click Start Mic and allow microphone access in your browser to see the real-time pitch detection (Hz, notes, and cents deviation).
