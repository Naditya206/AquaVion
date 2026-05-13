import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GuidebookPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Buku Panduan Pengguna
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Langkah demi langkah cara menggunakan sistem AquaVion dari sudut pandang peternak lele.
        </p>
      </div>

      <div className="space-y-8">
        
        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-sm">1</span>
              Pemasangan Perangkat Keras (IoT)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Langkah pertama adalah memasang alat pemantau (perangkat IoT ESP32) di tepi kolam Anda.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pastikan kotak panel terlindungi dari hujan langsung, namun sensor (kabel) tercelup sempurna ke dalam air kolam.</li>
              <li>Nyalakan alat dan hubungkan alat tersebut ke jaringan <strong>WiFi</strong> di lokasi Anda agar alat dapat mengirim data ke awan (cloud).</li>
              <li>Catat <strong>Device ID</strong> (ID Perangkat) unik yang tertera pada kotak alat atau dari panduan pembelian Anda.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold text-sm">2</span>
              Pendaftaran Akun & Manajemen Kolam
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Setelah alat menyala, Anda perlu mengaitkan alat tersebut dengan akun AquaVion Anda.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Klik tombol <strong>Daftar</strong> atau <strong>Masuk</strong> di pojok kanan atas layar ini.</li>
              <li>Setelah berhasil masuk, buka menu <strong>Dasbor</strong> dan arahkan ke menu <strong>Manajemen Kolam</strong> (ikon tetesan air) di menu sebelah kiri.</li>
              <li>Klik tombol <strong>+ Tambah Kolam</strong>, beri nama kolam Anda (misal: "Kolam Lele Indukan A"), dan masukkan <strong>Device ID</strong> yang telah Anda catat sebelumnya.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 font-bold text-sm">3</span>
              Pemantauan Dasbor Real-Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Setelah kolam berhasil ditambahkan, sistem akan mulai menerima data sensor.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pilih menu <strong>Dasbor Utama</strong>. Di sana Anda akan melihat grafik gabungan interaktif yang menampilkan 4 parameter krusial: Suhu, pH, Kekeruhan, dan Tinggi Air.</li>
              <li>Anda dapat memantau indikator <strong>Koneksi Jaringan Alat</strong> untuk memastikan alat IoT masih terhubung dengan WiFi secara langsung.</li>
              <li>Jika Anda butuh rekap data, buka menu <strong>History</strong> untuk melihat tabel riwayat sensor dan mengekspornya ke dalam bentuk <strong>CSV / Excel</strong>.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold text-sm">4</span>
              Pengaturan Ambang Batas & Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              AquaVion bukan sekadar alat pantau, melainkan asisten pintar Anda. Agar sistem tahu kapan kondisi air menjadi berbahaya, Anda harus mengatur ambang batasnya.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Masuk ke menu <strong>Settings</strong> (Pengaturan).</li>
              <li>Atur <strong>Ambang Batas (Threshold)</strong> minimum dan maksimum untuk setiap parameter. Contoh: Suhu minimal 25°C, pH maksimal 8.5.</li>
              <li>Aktifkan fitur <strong>Telegram Bot</strong> atau <strong>Web Push Notification</strong> di halaman tersebut agar HP Anda otomatis berdering/bergetar saat parameter air melewati batas aman.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-bold text-sm">5</span>
              Tindakan Penyelamatan (Edukasi & Referensi)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Apa yang harus dilakukan saat sirine notifikasi berbunyi dan kolam dalam bahaya?
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tenang dan jangan panik. Buka Dasbor AquaVion dan masuk ke menu <strong>Panduan Air</strong> (ikon buku).</li>
              <li>Di sana, kami telah merangkum Standar Operasional Prosedur (SOP) budidaya lele berdasarkan jurnal ilmiah dan KKP.</li>
              <li>Baca instruksi penindakan yang sesuai, misalnya: menebar kapur dolomit saat pH anjlok, atau membuka pipa pembuangan saat kolam kepenuhan air hujan.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 font-bold text-sm">6</span>
              Konfigurasi Notifikasi Bot Telegram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Dapatkan peringatan dini langsung ke ponsel Anda melalui Telegram agar Anda bisa bertindak cepat meskipun sedang tidak membuka website.
            </p>
            <ul className="list-decimal pl-6 space-y-2">
              <li>Buka aplikasi Telegram dan cari bot dengan nama <strong>@AquaVionBot</strong> atau klik tautan yang tersedia di menu pengaturan.</li>
              <li>Klik tombol <strong>/start</strong> pada chat bot tersebut. Bot akan membalas dengan memberikan <strong>Chat ID</strong> unik Anda.</li>
              <li>Masuk ke Dasbor AquaVion, buka menu <strong>Pengaturan</strong> {">"} <strong>Notifikasi</strong>.</li>
              <li>Masukkan nomor Chat ID tersebut ke kolom <strong>Telegram Chat ID</strong> dan klik <strong>Simpan Perubahan</strong>.</li>
              <li>Pastikan fitur "Aktifkan Notifikasi Telegram" dalam posisi ON. Kini Anda akan menerima pesan otomatis setiap kali sensor mendeteksi kondisi air yang kritis.</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
