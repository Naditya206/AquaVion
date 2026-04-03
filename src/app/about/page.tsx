import { Card, CardContent } from "@/components/ui/card"
import { Cpu, Cloud, Database } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl flex-1">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">About AquaNexa AI</h1>
      
      <div className="space-y-6">
        <p className="text-xl text-muted-foreground leading-relaxed">
          AquaNexa AI (formerly known as AquaSense/PiscAI) is a cutting-edge platform designed to revolutionize aquaculture through the integration of <strong className="text-foreground">Artificial Intelligence of Things (AIoT)</strong>. 
          Our mission is to help fish farmers, especially catfish breeders, optimize their yield while minimizing resource waste and environmental impact.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">The Challenge in Aquaculture</h2>
        <p className="text-muted-foreground">
          Traditional fish farming relies heavily on manual monitoring, guesswork, and reactive problem-solving. This approach often leads to excessive feed waste, undetected poor water quality resulting in mass mortality, and suboptimal harvest yields.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">Our AIoT Solution</h2>
        <p className="text-muted-foreground">
          By combining AI and IoT, we create a smart ecosystem that constantly monitors and manages your pools:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Cpu className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Edge Computing</h3>
              <p className="text-sm text-muted-foreground">Local processing for immediate automatic control of aerators without latency.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Cloud className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Cloud Analytics</h3>
              <p className="text-sm text-muted-foreground">Heavy AI models for computer vision and predictive analytics run in the cloud.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Database className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Big Data</h3>
              <p className="text-sm text-muted-foreground">Historical data tracking to train better growth prediction models.</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">Benefits for Farmers</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Increased Profitability:</strong> Smart feeding reduces the highest operational cost (feed) by preventing overfeeding.</li>
          <li><strong className="text-foreground">Risk Mitigation:</strong> Real-time alerts prevent total loss from sudden ammonia spikes or oxygen depletion.</li>
          <li><strong className="text-foreground">Predictable Supply:</strong> Accurate harvest estimations allow for better market price negotiations.</li>
          <li><strong className="text-foreground">Labor Efficiency:</strong> Automation of routine tasks like water testing and basic pool control.</li>
        </ul>
      </div>
    </div>
  )
}
