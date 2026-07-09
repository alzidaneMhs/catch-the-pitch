import MicPitchDemo from "@/components/audio/MicPitchDemo";
import TrackPlayer from "@/components/audio/TrackPlayer";

export default function Home() {
  return (
    <div className="flex-1 bg-zinc-950 text-white">
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <header>
          <h1 className="text-2xl font-bold">Catch The Pitch</h1>
          <p className="mt-2 text-white/60">
            Fase 1: eksperimen dasar Web Audio API — tangkap mikrofon, deteksi
            pitch real-time (Pitchfinder/YIN), dan putar backing track.
          </p>
        </header>

        <MicPitchDemo />
        <TrackPlayer />
      </main>
    </div>
  );
}
