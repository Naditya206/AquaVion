import { Droplets, Cpu, Settings, LineChart, Wifi, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesPage() {
  const features = [
    {
      title: "Pemantauan Kualitas Air Real-time",
      description: "Pelacakan secara otomatis dan berkelanjutan untuk metrik penting: pH, Suhu, Kekeruhan Air (Turbidity), dan Tinggi Air.",
      icon: <Droplets className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Manajemen Multi-Kolam",
      description: "Daftarkan dan kelola puluhan kolam ikan dari berbagai lokasi dalam satu dashboard sentral secara mudah.",
      icon: <Cpu className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Sistem Pakar Otomatis",
      description: "Analisis cerdas yang mengonversi data sensor mentah menjadi instruksi penanganan (seperti 'Suhu Dingin → Tutup Kolam').",
      icon: <Settings className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Riwayat & Tren Analitik",
      description: "Rekapitulasi otomatis dalam bentuk tabel dan grafik historik. Unduh dalam bentuk CSV untuk keperluan laporan tambak.",
      icon: <LineChart className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Ambang Batas Kustom",
      description: "Tentukan sendiri nilai minimal dan maksimal parameter sensor (Suhu, pH, Tinggi Air) spesifik untuk setiap kolam.",
      icon: <Wifi className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Notifikasi Telegram",
      description: "Terima peringatan seketika melalui bot Telegram saat mendeteksi adanya kejanggalan kualitas air yang berbahaya.",
      icon: <Smartphone className="h-10 w-10 text-cyan-500" />
    }
  ]

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl flex-1 flex flex-col justify-center">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Fitur Platform</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Semua yang Anda butuhkan untuk menjalankan peternakan akuakultur yang modern, efisien, dan menguntungkan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <Card key={i} className="group hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110">
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
