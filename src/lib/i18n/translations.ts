export type Locale = "id" | "en";

const id = {
  "app.title": "Catch The Pitch",
  "app.subtitle":
    "Fase 2: sesi karaoke — putar backing track sambil merekam vokal dan melacak pitch secara real-time.",

  "stage.title": "Sesi Karaoke",
  "stage.help.summary": "Cara membaca hasil analisis",
  "stage.help.grid":
    "**Pitch Grid** menampilkan nada yang kamu nyanyikan dari waktu ke waktu — sumbu vertikal adalah nada, sumbu horizontal adalah waktu. Hijau berarti nada tepat, kuning berarti terlalu tinggi, ungu berarti terlalu rendah.",
  "stage.help.zoom":
    "Setelah selesai, kamu bisa **seret (drag) pada grid untuk memperbesar (zoom)** bagian tertentu, atau klik salah satu item di daftar **\"Bagian yang perlu diperbaiki\"** untuk langsung melihat detailnya.",
  "stage.help.metrics":
    "**Akurasi Nada** mengukur seberapa presisi nadamu, **Stabilitas Kontrol** mengukur seberapa steady kamu menahan nada panjang, dan **Frekuensi Fals** menghitung berapa kali nadamu melenceng cukup jauh.",
  "stage.start": "Mulai Karaoke",
  "stage.stop": "Stop",
  "stage.pitchLive": "Pitch Live",
  "stage.pitchGrid": "Pitch Grid",
  "stage.live": "(live)",
  "stage.resetZoom": "Reset Zoom",
  "stage.dragHint": "Seret (drag) pada grid untuk memperbesar bagian tertentu.",
  "stage.vocalResult": "Hasil rekaman vokal ({{count}} sampel pitch tercatat)",

  "error.loadTrack": "Gagal memuat backing track: {{message}}",
  "error.loadTrackGeneric": "Gagal memuat backing track.",
  "error.startRecording": "Gagal memulai rekaman: {{message}}",
  "error.startRecordingGeneric": "Gagal memulai rekaman.",

  "legend.inTune": "Tepat",
  "legend.sharp": "Terlalu tinggi",
  "legend.flat": "Terlalu rendah",

  "issues.none": "Tidak ada bagian yang meleset signifikan — mantap!",
  "issues.title": "Bagian yang perlu diperbaiki ({{count}}) — klik untuk lihat detail",
  "issues.type.unstable": "Kurang stabil (bergetar)",

  "score.overall": "Skor Keseluruhan",
  "score.overall.caption": "Gabungan akurasi nada (60%) dan stabilitas kontrol (40%).",
  "score.accuracy.label": "Akurasi Nada",
  "score.accuracy.desc":
    "Seberapa dekat nada yang kamu nyanyikan dengan nada yang benar. Semakin tinggi, semakin presisi.",
  "score.stability.label": "Stabilitas Kontrol",
  "score.stability.desc":
    "Seberapa stabil kamu menahan nada panjang tanpa goyang atau naik-turun tak sengaja.",
  "score.offPitch.label": "Frekuensi Fals",
  "score.offPitch.desc":
    "Jumlah bagian nada yang melenceng cukup jauh (lebih dari ±15 sen) dari nada yang seharusnya.",
  "score.vocalRange.label": "Vocal Range",
  "score.vocalRange.desc":
    "rentang nada terendah sampai tertinggi yang berhasil kamu capai.",

  "vocalType.bass": "Bass",
  "vocalType.baritone": "Bariton",
  "vocalType.tenor": "Tenor",
  "vocalType.alto": "Alto",
  "vocalType.mezzoSoprano": "Mezzo-Sopran",
  "vocalType.soprano": "Sopran",
} as const;

const en: Record<keyof typeof id, string> = {
  "app.title": "Catch The Pitch",
  "app.subtitle":
    "Phase 2: karaoke session — play a backing track while recording your voice and tracking pitch in real time.",

  "stage.title": "Karaoke Session",
  "stage.help.summary": "How to read your results",
  "stage.help.grid":
    "The **Pitch Grid** shows the notes you sang over time — the vertical axis is pitch, the horizontal axis is time. Green means the note was accurate, yellow means too high, purple means too low.",
  "stage.help.zoom":
    "Once you're done, you can **drag on the grid to zoom** into a specific part, or click an item in the **\"Parts to improve\"** list to jump straight to the details.",
  "stage.help.metrics":
    "**Pitch Accuracy** measures how precise your notes were, **Control Stability** measures how steady you held long notes, and **Off-key Count** tallies how many times your pitch drifted noticeably.",
  "stage.start": "Start Karaoke",
  "stage.stop": "Stop",
  "stage.pitchLive": "Live Pitch",
  "stage.pitchGrid": "Pitch Grid",
  "stage.live": "(live)",
  "stage.resetZoom": "Reset Zoom",
  "stage.dragHint": "Drag on the grid to zoom into a specific part.",
  "stage.vocalResult": "Recorded vocal result ({{count}} pitch samples captured)",

  "error.loadTrack": "Failed to load backing track: {{message}}",
  "error.loadTrackGeneric": "Failed to load backing track.",
  "error.startRecording": "Failed to start recording: {{message}}",
  "error.startRecordingGeneric": "Failed to start recording.",

  "legend.inTune": "In tune",
  "legend.sharp": "Too high",
  "legend.flat": "Too low",

  "issues.none": "No significantly off-pitch parts — nice work!",
  "issues.title": "Parts to improve ({{count}}) — click for details",
  "issues.type.unstable": "Unstable (wavering)",

  "score.overall": "Overall Score",
  "score.overall.caption": "Combines pitch accuracy (60%) and control stability (40%).",
  "score.accuracy.label": "Pitch Accuracy",
  "score.accuracy.desc":
    "How close the notes you sang were to the correct pitch. Higher means more precise.",
  "score.stability.label": "Control Stability",
  "score.stability.desc":
    "How steadily you held long notes without unintended wavering or drifting.",
  "score.offPitch.label": "Off-key Count",
  "score.offPitch.desc":
    "How many parts drifted far enough (more than ±15 cents) from the correct pitch.",
  "score.vocalRange.label": "Vocal Range",
  "score.vocalRange.desc": "the lowest to highest note you managed to reach.",

  "vocalType.bass": "Bass",
  "vocalType.baritone": "Baritone",
  "vocalType.tenor": "Tenor",
  "vocalType.alto": "Alto",
  "vocalType.mezzoSoprano": "Mezzo-Soprano",
  "vocalType.soprano": "Soprano",
};

export const translations: Record<Locale, Record<TranslationKey, string>> = { id, en };

export type TranslationKey = keyof typeof id;
