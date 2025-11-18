export default function AboutPage() {
  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-6 md:p-8 shadow-soft space-y-5 text-white">
          <h1 className="text-2xl md:text-3xl font-bold text-shadow-lg">About – Guest Registration & Check-in</h1>
          <p className="text-white/90">
            Aplikasi Guest Registration & Check-in adalah sistem registrasi tamu terpadu untuk kebutuhan event.
            Aplikasi ini memudahkan proses pencarian, check-in, penayangan display, dan administrasi data tamu secara
            real-time di berbagai perangkat.
          </p>
          <div className="space-y-2 text-sm">
            <div><span className="font-semibold text-white">Dibuat oleh:</span> <span className="text-white/90">Yohanes Octavian Rizky</span></div>
            <div><span className="font-semibold text-white">Teknologi:</span> <span className="text-white/90">Frontend (Next.js App Router, React 18, TypeScript, Tailwind CSS) • Backend (NestJS 10, Prisma 5) • Database (PostgreSQL) • Realtime (Server-Sent Events) • Monorepo</span></div>
            <div><span className="font-semibold text-white">Arsitektur:</span> <span className="text-white/90">Frontend same-origin ke path <code>/api</code> dengan proxy (rewrites) ke backend. Uploads disajikan via <code>/api/uploads</code>.</span></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg md:text-xl font-semibold text-shadow">Fitur Utama</h2>
            <ul className="list-disc pl-6 text-white/90 marker:text-white/70">
              <li>Check-in Publik: cari tamu (ID/Nama), check-in cepat, riwayat real-time.</li>
              <li>Display /show: layar besar menampilkan branding event dan popup konfirmasi check-in.</li>
              <li>Admin: login JWT, Dashboard (statistik), Guests (list, tambah, edit, hapus, foto), Import/Export CSV.</li>
              <li>Branding Event: logo, background image/video, overlay; live preview via SSE.</li>
              <li>Export lengkap: unduh seluruh kolom tamu (CSV) lewat tombol "Export Event" di halaman Guests.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg md:text-xl font-semibold text-shadow">Catatan Teknis</h2>
            <ul className="list-disc pl-6 text-white/90 marker:text-white/70">
              <li>Frontend selalu menggunakan same-origin <code>/api</code> agar dapat diakses lintas perangkat (LAN).</li>
              <li>Konfigurasi proxy backend melalui variabel lingkungan <code>BACKEND_ORIGIN</code> (opsional).</li>
              <li>Realtime menggunakan SSE pada endpoint <code>/api/public/stream</code>.</li>
            </ul>
          </div>
          <div className="text-sm text-white/70">
            Hak cipta © {new Date().getFullYear()} Yohanes Octavian Rizky.
          </div>
        </div>
      </div>
    </div>
  );
}
