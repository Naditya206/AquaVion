import { Droplets, Cpu, Settings, LineChart, Wifi, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesPage() {
  const features = [
    {
      title: "Pemantauan Air Waktu Nyata",
      description: "Pelacakan DO (Oksigen Terlarut), tingkat pH, suhu, dan amonia secara otomatis dan berkelanjutan.",
      icon: <Droplets className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Visi Komputer AI",
      description: "Kamera bawah air yang ditenagai oleh AI mendeteksi ukuran ikan, memperkirakan jumlah total, dan memantau kesehatan/perilaku ikan.",
      icon: <Cpu className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Sistem Pakan Pintar",
      description: "Pemberi pakan otomatis yang menyebarkan makanan berdasarkan nafsu makan ikan dan prediksi biomassa untuk mengurangi limbah.",
      icon: <Settings className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Analitik Prediktif",
      description: "Model pembelajaran mesin memprediksi perkiraan tanggal panen, potensi wabah penyakit, dan tingkat pertumbuhan.",
      icon: <LineChart className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Kendali Otomatis",
      description: "Integrasi IoT secara otomatis memicu aerator atau pompa air jika kondisi berada di bawah ambang batas aman.",
      icon: <Wifi className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Notifikasi Seluler",
      description: "Terima pemberitahuan instan ke perangkat Anda untuk kondisi kritis dan laporan ringkasan harian.",
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
