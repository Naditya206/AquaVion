import { Card, CardContent } from "@/components/ui/card"
import { Cpu, Cloud, Database } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl flex-1">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Tentang AquaVion</h1>
      
      <div className="space-y-6">
        <p className="text-xl text-muted-foreground leading-relaxed">
          AquaVion (sebelumnya dikenal sebagai AquaSense/PiscAI/AquaNexa AI) adalah platform mutakhir yang dirancang untuk merevolusi akuakultur melalui integrasi <strong className="text-foreground">Artificial Intelligence of Things (AIoT)</strong>. 
          Misi kami adalah membantu peternak ikan, terutama pembudidaya lele, mengoptimalkan hasil panen mereka sekaligus meminimalkan pemborosan sumber daya dan dampak lingkungan.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">Tantangan dalam Akuakultur</h2>
        <p className="text-muted-foreground">
          Peternakan ikan tradisional sangat bergantung pada pemantauan manual, tebakan, dan pemecahan masalah yang reaktif. Pendekatan ini sering kali menyebabkan pemborosan pakan yang berlebihan, kualitas air buruk yang tidak terdeteksi sehingga mengakibatkan kematian massal, dan hasil panen yang kurang optimal.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">Solusi AIoT Kami</h2>
        <p className="text-muted-foreground">
          Dengan menggabungkan AI dan IoT, kami menciptakan ekosistem cerdas yang terus memantau dan mengelola kolam Anda:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Cpu className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Komputasi Edge</h3>
              <p className="text-sm text-muted-foreground">Pemrosesan lokal untuk kendali otomatis langsung pada aerator tanpa penundaan (latency).</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Cloud className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Analitik Cloud</h3>
              <p className="text-sm text-muted-foreground">Model AI berat untuk visi komputer dan analitik prediktif dijalankan di awan (cloud).</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Database className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Penyimpanan Big Data</h3>
              <p className="text-sm text-muted-foreground">Pelacakan data historis untuk melatih model prediksi pertumbuhan agar semakin akurat.</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">Manfaat bagi Peternak</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Peningkatan Keuntungan:</strong> Pemberian pakan cerdas mengurangi biaya operasional tertinggi (pakan) dengan mencegah pemberian daya berlebih.</li>
          <li><strong className="text-foreground">Mitigasi Risiko:</strong> Peringatan waktu nyata mencegah kerugian total akibat lonjakan amonia mendadak atau penipisan oksigen.</li>
          <li><strong className="text-foreground">Pasokan yang Dapat Diprediksi:</strong> Perkiraan panen yang akurat memungkinkan negosiasi harga pasar yang lebih baik.</li>
          <li><strong className="text-foreground">Efisiensi Tenaga Kerja:</strong> Otomatisasi tugas rutin seperti pengujian kualitas air dan kendali dasar kolam secara remote.</li>
        </ul>
      </div>
    </div>
  )
}
