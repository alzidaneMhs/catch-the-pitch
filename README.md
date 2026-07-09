# Catch The Pitch

Aplikasi web karaoke sekaligus penganalisis performa vokal real-time — mendeteksi ketidaksesuaian nada (*fals*), memvisualisasikan pitch ala Melodyne, dan memberi skor/grade vokal.

Lihat rencana lengkap di `planning_projek_audio_web.md`.

## Status: Fase 1 — Setup & Core Audio

Fase ini membuktikan tiga fondasi teknis:
1. Proyek Next.js (App Router) + TypeScript + Tailwind CSS.
2. Web Audio API: menangkap mikrofon (`getUserMedia`) dan memutar file audio (`decodeAudioData` + `AudioBufferSourceNode`).
3. Deteksi pitch real-time memakai [Pitchfinder](https://github.com/peterkhayes/pitchfinder) (algoritma YIN), dengan noise gate (RMS threshold) dan median filter untuk smoothing.

### Struktur kode audio
- `src/lib/audio/microphone.ts` — setup `AudioContext` + `AnalyserNode` dari input mikrofon.
- `src/lib/audio/pitchDetector.ts` — wrapper Pitchfinder YIN + noise gate + median filter.
- `src/lib/audio/noteUtils.ts` — konversi frekuensi (Hz) ke nama not musik + deviasi cents.
- `src/lib/audio/playback.ts` — pemutaran file audio (backing track) dengan play/pause/stop.
- `src/components/audio/MicPitchDemo.tsx` — UI demo deteksi pitch real-time dari mikrofon.
- `src/components/audio/TrackPlayer.tsx` — UI demo upload & pemutaran backing track.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Klik **Start Mic** dan izinkan akses mikrofon di browser untuk melihat deteksi pitch real-time (Hz, not, dan deviasi cents).

## Roadmap selanjutnya

- **Fase 2**: Antarmuka karaoke penuh, sinkronisasi rekaman vokal dengan backing track.
- **Fase 3**: Visualizer grid pitch-time ala Melodyne (Canvas API).
- **Fase 4**: Scoring engine, deteksi vocal range, grading A–F.
- **Fase 5**: Integrasi Supabase (auth, storage, riwayat skor) & deploy ke Vercel.
