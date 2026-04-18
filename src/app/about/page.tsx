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
              <h3 className="font-bold mb-2">Node IoT Sensor</h3>
              <p className="text-sm text-muted-foreground">Perangkat mikrokontroler di kolam yang secara presisi mengukur suhu, kualitas dan volume air.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Cloud className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Cloud Terpusat</h3>
              <p className="text-sm text-muted-foreground">Infrastruktur serverless mengumpulkan dan memproses ribuan data sensor dari berbagai kolam setiap harinya.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Database className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Penyimpanan Histori</h3>
              <p className="text-sm text-muted-foreground">Seluruh data direkam dalam pangkalan data yang aman untuk membentuk tren analitik jangka panjang.</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">Manfaat bagi Peternak Lele</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Mitigasi Risiko:</strong> Peringatan dini waktu nyata (real-time) melalui Telegram mencegah kerugian akibat kualitas air yang memburuk mendadak.</li>
          <li><strong className="text-foreground">Kesehatan Ikan Optimal:</strong> Dengan memastikan kadar derajat keasaman (pH) dan Suhu tetap pada ambang ideal, lele bisa terhindar dari stres dan penyakit.</li>
          <li><strong className="text-foreground">Efisiensi Tenaga Kerja:</strong> Menggantikan proses manual berupa pengecekan suhu atau memantau kolam secara keliling setiap hari.</li>
          <li><strong className="text-foreground">Manajemen Jarak Jauh:</strong> Memantau banyak kolam secara simultan tanpa harus berada di lokasi fisik tambak.</li>
        </ul>
      </div>
    </div>
  )
}
