import KaraokeStage from "@/components/karaoke/KaraokeStage";

export default function Home() {
  return (
    <div className="flex-1 bg-zinc-950 text-white">
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <header>
          <h1 className="text-2xl font-bold">Catch The Pitch</h1>
          <p className="mt-2 text-white/60">
            Fase 2: sesi karaoke — putar backing track sambil merekam vokal
            dan melacak pitch secara real-time.
          </p>
        </header>

        <KaraokeStage />
      </main>
    </div>
  );
}
