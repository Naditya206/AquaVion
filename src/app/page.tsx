import Link from "next/link"
import { ArrowRight, Activity, Cpu, LineChart } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-12 md:pt-20 pb-6 md:pb-10 px-4">
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8 py-12 md:py-20 relative">
        <div className="absolute top-0 -z-10 h-full w-full bg-transparent"><div className="absolute bottom-auto left-auto right-0 top-0 h-[300px] w-[300px] md:h-[500px] md:w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary/20 opacity-50 blur-[80px]"></div></div>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          Platform Cerdas Peternak Lele
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Monitoring Kolam</span> 
          <br className="hidden sm:inline" /> Berbasis IoT
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground text-sm sm:text-base md:text-lg sm:leading-7 md:leading-8">
          Revolusi peternakan ikan lele Anda dengan platform cerdas AquaVion. 
          Pemantauan kualitas air kolam secara langsung (real-time), analitik histori, dan notifikasi peringatan otomatis untuk hasil panen yang lebih sehat.
        </p>
        <div className="flex gap-3 md:gap-4 flex-col sm:flex-row w-full sm:w-auto">
          <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "gap-2 w-full sm:w-auto")}>
            Akses Dasbor <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/features" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto")}>
            Pelajari Sistem
          </Link>
        </div>
      </section>

      {/* Mini Feature Highlights */}
      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 py-6 md:py-10">
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Sensor Air Real-time</h3>
          <p className="text-sm text-muted-foreground">Pantau indikator krusial seperti pH, Suhu, Kekeruhan, dan Tinggi Air secara terus menerus.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Sistem Pakar & Notifikasi</h3>
          <p className="text-sm text-muted-foreground">Analisis status "Aman" atau "Butuh Tindakan" yang terhubung langsung ke Telegram Anda.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <LineChart className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Riwayat & Analitik</h3>
          <p className="text-sm text-muted-foreground">Lihat tren grafik kualitas air harian hingga bulanan untuk manajemen tambak yang presisi.</p>
        </div>
      </section>

      {/* Mockup Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20">
        <div className="rounded-2xl border bg-card/50 p-2 md:p-4 backdrop-blur-sm">
          <div className="rounded-xl overflow-hidden border bg-background shadow-2xl relative aspect-video flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="text-center z-10 p-6">
              <h3 className="text-2xl font-bold mb-4">Dasbor Sentralisasi Peternak</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Kelola banyak kolam sekaligus dalam satu aplikasi. Sesuaikan ambang batas masing-masing kolam dan pastikan semuanya tetap optimal.</p>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "secondary" }))}>
                Masuk ke Dasbor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
