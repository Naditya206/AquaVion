import { Droplets, Cpu, Settings, LineChart, Wifi, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesPage() {
  const features = [
    {
      title: "Real-time Water Monitoring",
      description: "Continuous tracking of DO (Dissolved Oxygen), pH levels, temperature, and ammonia automatically.",
      icon: <Droplets className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "AI Computer Vision",
      description: "Underwater cameras powered by AI detect fish size, estimate total count, and monitor fish health/behavior.",
      icon: <Cpu className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Smart Feeding System",
      description: "Automated feeders that disperse food based on fish appetite and biomass predictions to reduce waste.",
      icon: <Settings className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Predictive Analytics",
      description: "Machine learning models predict harvest dates, potential disease outbreaks, and overall growth rates.",
      icon: <LineChart className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Automatic Control",
      description: "IoT integration automatically triggers aerators or water pumps if conditions fall below safe thresholds.",
      icon: <Wifi className="h-10 w-10 text-cyan-500" />
    },
    {
      title: "Mobile Alerts",
      description: "Receive instant notifications to your devices for critical conditions and daily summary reports.",
      icon: <Smartphone className="h-10 w-10 text-cyan-500" />
    }
  ]

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl flex-1 flex flex-col justify-center">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Platform Features</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to run a modern, efficient, and profitable aquaculture farm.
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
