import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AlertCircle, Droplets, Thermometer, Wind, ExternalLink, Info } from "lucide-react"
import Link from "next/link"

export default function GuidePage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edukasi & Referensi Penindakan</h1>
        <p className="text-muted-foreground">Panduan standar operasional untuk menangani anomali pada parameter kualitas air kolam lele.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* pH Card */}
        <Card className="border-t-4 border-t-cyan-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-500" />
              Tingkat Keasaman (pH) Air
            </CardTitle>
            <CardDescription className="text-sm font-medium text-cyan-700 dark:text-cyan-400">
              Ideal: 6,5 – 8,0
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4"/> Jika Terlalu Rendah (Asam / &lt; 6,5)</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Pemberian Kapur Dolomit/Pertanian:</strong> Taburkan kapur dolomit yang dilarutkan ke dalam air kolam. Dosis disesuaikan dengan volume kolam, dilakukan bertahap hingga pH naik.</li>
                <li><strong className="text-foreground">Penyebab Umum:</strong> Hujan deras terus-menerus biasanya menurunkan pH secara drastis.</li>
              </ul>
            </div>
            
            <hr className="border-border" />
            
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4"/> Jika Terlalu Tinggi (Basa / &gt; 8,5)</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Pemberian Bahan Organik:</strong> Rendam daun ketapang kering, cacahan batang pisang, atau irisan buah pepaya muda (dibungkus jaring). Kandungan tanin akan perlahan menurunkan pH air.</li>
                <li><strong className="text-foreground">Pergantian Air Parsial:</strong> Buang 20-30% air kolam dan ganti dengan air sumur/sumber yang baru.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t py-3">
            <Link href="https://share.google/Lz8jYnHhHJPSDkYZk" target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Jurnal AQUACULTURE Indonesia (Vol. 3, 2024)
            </Link>
          </CardFooter>
        </Card>

        {/* Suhu Card */}
        <Card className="border-t-4 border-t-rose-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-rose-500" />
              Suhu Air Kolam
            </CardTitle>
            <CardDescription className="text-sm font-medium text-rose-700 dark:text-rose-400">
              Ideal: 25°C – 30°C
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4"/> Jika Terlalu Dingin (&lt; 25°C)</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Pemuasaan Ikan:</strong> Hentikan atau kurangi porsi pakan. Saat dingin, metabolisme lele menurun drastis sehingga pakan tidak akan dicerna baik dan menjadi racun amonia.</li>
                <li><strong className="text-foreground">Penutupan Kolam:</strong> Tutup sebagian permukaan kolam dengan plastik UV atau terpal untuk memerangkap suhu panas bumi atau menahan sisa panas matahari.</li>
              </ul>
            </div>
            
            <hr className="border-border" />
            
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4"/> Jika Terlalu Panas (&gt; 30°C)</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Pemberian Peneduh:</strong> Pasang jaring paranet di atas kolam. Bisa juga memasukkan eceng gondok (maksimal 20% dari luas permukaan agar tidak menyedot oksigen di malam hari).</li>
                <li><strong className="text-foreground">Penambahan Air Segar:</strong> Alirkan air baru ke dalam kolam untuk mendinginkan suhu secara bertahap.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t py-3">
             <Link href="https://share.google/yHTBPsnD5Igt5pqd8" target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Pengaruh Suhu Media Pemeliharaan (Clarias gariepinus)
            </Link>
          </CardFooter>
        </Card>

        {/* Kekeruhan Card */}
        <Card className="border-t-4 border-t-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-indigo-500" />
              Tingkat Kekeruhan (Turbidity)
            </CardTitle>
            <CardDescription className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
              Ideal: Air Plankton (Hijau) | Bahaya: Coklat Pekat / Hitam Bau Busuk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900 mb-2">
              <p className="text-xs flex items-start gap-2">
                <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <span><strong className="text-indigo-700 dark:text-indigo-300">Catatan:</strong> Kekeruhan hijau karena plankton sangat baik. Yang berbahaya adalah kekeruhan warna coklat pekat atau hitam yang berbau busuk.</span>
              </p>
            </div>
            <div className="space-y-4 text-muted-foreground pt-1">
              <p><strong className="text-foreground block mb-1">1. Penyiponan (Siphon)</strong> Lakukan penyedotan kotoran (feses lele dan sisa pakan) yang mengendap di dasar kolam menggunakan selang panjang.</p>
              <hr className="border-border border-dashed" />
              <p><strong className="text-foreground block mb-1">2. Pembuangan Air Bawah (Drainase)</strong> Buka kran pembuangan bawah untuk membuang 30-50% air lumpur di dasar kolam, lalu tambahkan air bersih dari atas.</p>
              <hr className="border-border border-dashed" />
              <p><strong className="text-foreground block mb-1">3. Pemberian Probiotik</strong> Tebarkan cairan probiotik (seperti EM4 Perikanan atau cairan fermentasi rabung) yang dicampur molase untuk mengurai limbah organik yang membuat air menjadi pekat dan beracun.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t py-3 flex flex-col items-start gap-2">
            <Link href="https://journals.unihaz.ac.id/index.php/agroqua/article/view/505" target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 line-clamp-1">
              <ExternalLink className="h-3 w-3 shrink-0" /> Pengaruh Penyiponan Terhadap Pertumbuhan Lele
            </Link>
            <Link href="https://openjurnal.unmuhpnk.ac.id/JR/article/view/2610" target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 line-clamp-1">
              <ExternalLink className="h-3 w-3 shrink-0" /> Pengaruh Probiotik Pada Pakan Terhadap Kelangsungan Hidup Lele
            </Link>
          </CardFooter>
        </Card>

        {/* Ketinggian Air Card */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-sm bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">≈</div>
              Ketinggian Air
            </CardTitle>
            <CardDescription className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Ideal: 40 cm – 70 cm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4"/> Jika Air Terlalu Surut (&lt; 40 cm)</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Cek Kebocoran:</strong> Periksa dinding terpal atau pematang tanah dari kemungkinan rembesan atau gigitan hama.</li>
                <li><strong className="text-foreground">Pengisian Bertahap:</strong> Mengisi kembali air kolam wajib dilakukan secara perlahan. Jika terlalu cepat dan deras, suhu kolam berubah drastis, ikan stres dan mati lemas.</li>
              </ul>
            </div>
            
            <hr className="border-border" />
            
            <div>
              <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4"/> Jika Air Terlalu Penuh (&gt; 70 cm)</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Buka Pipa Pembuangan:</strong> Segera buka pipa pembuangan (overflow) untuk menurunkan level air.</li>
                <li><strong className="text-foreground">Pasang Waring/Jaring:</strong> Mengingat karakter lele yang suka melompat (walking catfish) saat hujan, wajib menutup bagian atas kolam dengan jaring agar ikan tidak kabur.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t py-3">
             <Link href="https://kkp.go.id/storage/Materi/panduan-budi-daya-ikan-nilalele-di-bak-bulat-bioflok6982e9ada5a67/materi-6982e9adaa327.pdf" target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <ExternalLink className="h-3 w-3 shrink-0" /> SOP Budidaya Ikan Lele di Bak Bulat (KKP)
            </Link>
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}
