# Dokumen Perencanaan Proyek: Aplikasi Analisis & Karaoke Pitch Audio (Berbasis Web)

Dokumen ini berisi perencanaan strategis, arsitektur teknis, roadmap pengembangan, serta usulan fitur tambahan untuk proyek aplikasi web analisis vokal dan karaoke.

---

## 1. Ringkasan Eksekutif
Proyek ini bertujuan untuk membangun platform web interaktif yang berfungsi sebagai alat karaoke sekaligus penganalisis performa vokal secara *real-time*. Fokus utama aplikasi ini adalah mendeteksi ketidaksesuaian nada (*pitch mismatch* atau *fals*), memberikan visualisasi frekuensi berbasis blok nada (terinspirasi dari software audio profesional seperti *Melodyne*), serta memberikan penilaian menyeluruh (*scoring & grading*) berbasis metrik vokal yang komprehensif.

---

## 2. Cakupan Fitur Utama (Core Features)

### A. Modul Karaoke & Pemutaran Audio
* **Drop/Upload File Lagu:** Pengguna dapat mengunggah file instrumen atau lagu (*backing track*) dalam format audio standar (MP3, WAV).
* **Antarmuka Karaoke:** Pemutar musik yang dilengkapi dengan lirik berjalan (jika ada file penunjang) atau panduan visual saat perekaman dimulai.
* **Perekaman Vokal Simultan:** Menangkap input mikrofon pengguna secara *real-time* sembari memutar *backing track*.

### B. Analisis Pitch & Deteksi *Fals*
* **Real-time Pitch Tracking:** Mendeteksi frekuensi fundamental ($f_0$) suara pengguna saat bernyanyi.
* **Deteksi Off-Pitch (*Fals*):** Membandingkan frekuensi vokal pengguna dengan nada target (nada dasar lagu) untuk mengidentifikasi bagian yang terlalu tinggi (*sharp*) atau terlalu rendah (*flat*).
* **Penghitung *Fals*:** Sistem melacak akumulasi berapa kali pengguna menyimpang dari toleransi nada yang ditentukan.

### C. Visualisasi Frekuensi Ala *Melodyne* (Grid Pitch-Time)
* **Garis & Blok Frekuensi:** Mengubah hasil rekaman suara menjadi bentuk visual blok-blok nada pada grid horizontal (waktu) dan vertikal (skala nada/not balok).
* **Indikator Akurasi Warna:** * **Hijau:** Nada tepat sesuai target.
    * **Merah/Kuning (Terlalu Tinggi):** Vokal berada di atas nada target.
    * **Biru/Ungu (Terlalu Rendah):** Vokal berada di bawah nada target.
* **Analisis Detail Kelebihan/Kekurangan:** Menandai bagian mana yang sudah stabil dan bagian mana yang membutuhkan perbaikan (misalnya, vibrato tidak stabil atau perpindahan nada yang meleset).

### D. Sistem Penilaian & Karakterisasi Vokal (Scoring & Grading)
* **Metrik Penilaian Terfragmentasi:**
    * *Score Vokal:* Akurasi nada keseluruhan secara matematis.
    * *Jenis Vokal (Vocal Range Detection):* Menentukan tipe suara pengguna berdasarkan frekuensi terendah dan tertinggi yang dicapai (misal: Sopran, Alto, Tenor, Bass).
    * *Frekuensi Fals:* Jumlah total deviasi nada signifikan sepanjang lagu.
    * *Stabilitas Kontrol:* Menilai kemampuan menahan nada panjang.
* **Overall Score & Letter Grade:** Menggabungkan semua parameter menjadi nilai akhir dengan sistem *grading* dari **A** (Terbaik) hingga **F** (Butuh banyak latihan).

---

## 3. Rekomendasi Fitur Tambahan (Value-Added Features)
Untuk melengkapi fungsionalitas dan meningkatkan daya tarik aplikasi, berikut adalah fitur tambahan yang diusulkan:

1.  **Panduan Jalur Nada Target (Target Pitch Guideline):**
    * Menampilkan garis melodi target secara *real-time* (seperti pada game *SingStar* atau *Smule*) di layar saat karaoke agar pengguna tahu not apa yang seharusnya dinyanyikan selanjutnya.
2.  **Fitur Tuning Vokal Manual (Basic Pitch Correction):**
    * Sesuai dengan konsep awal "bisa tuning", setelah rekaman selesai dan blok nada muncul, pengguna dapat menggeser blok nada yang *fals* ke posisi not yang benar menggunakan *mouse* (drag-and-drop) untuk mendengarkan versi vokal mereka yang sudah "diperbaiki".
3.  **Dasbor Riwayat & Grafik Progres (User Analytics Dashboard):**
    * Menyimpan riwayat skor bernyanyi dari waktu ke waktu untuk melihat tren peningkatan akurasi nada pengguna dalam bentuk grafik line chart.
4.  **Ekspor Hasil Audio Konten (Export Rendered Audio):**
    * Memungkinkan pengguna mengunduh hasil rekaman vokal mereka, baik vokal mentah maupun hasil gabungan (*mixdown*) antara vokal dan *backing track*.
5.  **Mode Latihan Vokal Singkat (Vocal Warm-up & Drills):**
    * Modul latihan mandiri tanpa lagu penuh, melainkan hanya menyanyikan tangga nada (solfeggio) untuk melatih akurasi *pitch* sebelum mulai karaoke.

---

## 4. Arsitektur Teknis & Tech Stack

Dipilih berdasarkan fleksibilitas pengembangan aplikasi web berbasis audio modern dengan skalabilitas tinggi:

* **Frontend & User Interface:**
    * *Framework:* **React.js** atau **Next.js** (Sangat efisien untuk pengelolaan *state* aplikasi yang kompleks dan interaktif).
    * *Styling & UI Components:* **Tailwind CSS** untuk tampilan modern dan responsif.
    * *Melodyne Visualizer & Grid UI:* Menggunakan HTML5 **Canvas API** untuk merender ribuan blok frekuensi secara mulus tanpa membebani performa DOM.
* **Audio Processing (Sisi Klien):**
    * **Web Audio API:** API bawaan browser untuk menangkap input mikrofon, memproses node audio, dan melakukan manajemen pemutaran *audio buffer*.
    * *Algoritma Deteksi Pitch:* Menggunakan pustaka JavaScript seperti **Pitchfinder** (mengimplementasikan algoritma YIN atau AMDF) untuk menganalisis frekuensi audio secara *real-time* langsung di browser pengguna tanpa latensi jaringan server.
* **Backend & Database:**
    * **Supabase:** Menggunakan *PostgreSQL* untuk menyimpan data pengguna, riwayat skor, dan metrik performa vokal. Menggunakan *Supabase Storage* untuk menyimpan file lagu instrumen dan rekaman audio pengguna secara aman.
    * *Autentikasi:* Manajemen login menggunakan sistem bawaan Supabase Auth.
* **Deployment:**
    * Platform **Vercel** untuk proses *deployment* frontend yang cepat, optimal, dan mendukung integrasi CI/CD.

---

## 5. Tahapan Pengembangan (Roadmap Proyek)

```
[Fase 1: Riset & Core Audio] ──> [Fase 2: UI & Karaoke] ──> [Fase 3: Visualizer Grid] ──> [Fase 4: Scoring Engine] ──> [Fase 5: Integrasi & Deploy]
```

### Fase 1: Riset & Implementasi Core Audio (Minggu 1-2)
* Konfigurasi dasar proyek menggunakan Next.js/React.
* Implementasi Web Audio API untuk menangkap mikrofon dan memutar file audio.
* Eksperimen dengan algoritma deteksi pitch (*Pitchfinder*) guna memastikan akurasi pembacaan frekuensi suara.

### Fase 2: Antarmuka Pemutar & Karaoke (Minggu 3)
* Pembuatan modul upload file audio (*backing track*) dan menyimpannya ke *storage*.
* Pembuatan visual pemutar lagu, pencatat durasi waktu, serta modul perekam vokal.
* Integrasi sistem *state* untuk memastikan audio instrumen dan perekaman berjalan sinkron.

### Fase 3: Pengembangan Visualizer Frekuensi "Melodyne" Style (Minggu 4-5)
* Membangun komponen Canvas untuk memetakan frekuensi ($f_0$) ke dalam bentuk notasi musik (A, B, C, D, E, F, G) sepanjang waktu perekaman.
* Implementasi algoritma pemetaan: mengubah angka Hz menjadi nilai representasi blok koordinat di layar.
* Menerapkan pewarnaan dinamis untuk visualisasi status nada (Tepat, Terlalu Tinggi, Terlalu Rendah).

### Fase 4: Sistem Penilaian & Karakteristik Vokal (Minggu 6)
* Membuat logika komparasi matematika antara not vokal rekaman dan not referensi lagu asli.
* Menghitung frekuensi *fals* dan kalkulasi stabilitas vokal.
* Pembuatan algoritma klasifikasi *Vocal Range* untuk menentukan jenis suara pengguna.
* Pembuatan visualisasi hasil akhir (*Score Dashboard* dengan Grade A-F).

### Fase 5: Integrasi Database, Fitur Tambahan, & Deployment (Minggu 7-8)
* Integrasi Supabase untuk manajemen *user*, penyimpanan data skor, dan riwayat performa.
* Implementasi fitur tambahan pilihan (seperti ekspor hasil audio atau grafis perkembangan vokal).
* Pengujian performa lintas browser (Chrome, Firefox, Safari) untuk memastikan minimalisasi latensi audio.
* Deployment aplikasi ke Vercel.

---

## 6. Tantangan Teknis Utama & Solusinya

1.  **Latensi Audio Mikrofon:**
    * *Tantangan:* Suara rekaman tidak pas dengan ketukan musik karena adanya latensi perangkat keras atau browser.
    * *Solusi:* Menggunakan properti `outputLatency` dari Web Audio API untuk melakukan kompensasi pergeseran waktu (*latency calibration*) otomatis pada hasil rekaman.
2.  **Akurasi Deteksi Pitch Pada Lingkungan Bising:**
    * *Tantangan:* Suara bising di sekitar pengguna terdeteksi sebagai nada bernyanyi.
    * *Solusi:* Menerapkan *noise gate threshold* (filter volume minimal) sebelum audio dimasukkan ke dalam fungsi deteksi pitch, serta menerapkan algoritma penghalusan nilai (*median filtering*).
3.  **Performa Render Canvas:**
    * *Tantangan:* Aplikasi terasa lambat ketika merender ribuan titik frekuensi lagu berdurasi panjang.
    * *Solusi:* Menggunakan teknik *offscreen canvas rendering* atau membatasi pembaruan visualisasi hanya pada area grid yang sedang terlihat di layar (*viewport windowing*).
