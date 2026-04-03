import Link from "next/link"
import { ArrowRight, Activity, Cpu, LineChart } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-10">
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center gap-8 py-20 relative">
        <div className="absolute top-0 -z-10 h-full w-full bg-transparent"><div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-primary/20 opacity-50 blur-[80px]"></div></div>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          Introducing AquaNexa AI
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Smart Aquaculture</span> 
          <br className="hidden md:inline" /> with AIoT
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-8">
          Revolutionize your fish farming with next-generation Artificial Intelligence of Things. 
          Real-time water quality monitoring, computer vision, and predictive analytics for optimal yield.
        </p>
        <div className="flex gap-4 flex-col sm:flex-row">
          <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/features" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
            Explore Features
          </Link>
        </div>
      </section>

      {/* Mini Feature Highlights */}
      <section className="w-full max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 py-10">
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Real-Time Sensors</h3>
          <p className="text-sm text-muted-foreground">Monitor pH, DO, Temperature and Ammonia 24/7.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Computer Vision</h3>
          <p className="text-sm text-muted-foreground">AI detection for fish sizing, counting, and behavior analysis.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <LineChart className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Predictive Yield</h3>
          <p className="text-sm text-muted-foreground">Data-driven insights to estimate harvest and feed needs.</p>
        </div>
      </section>

      {/* Mockup Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20">
        <div className="rounded-2xl border bg-card/50 p-2 md:p-4 backdrop-blur-sm">
          <div className="rounded-xl overflow-hidden border bg-background shadow-2xl relative aspect-video flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="text-center z-10 p-6">
              <h3 className="text-2xl font-bold mb-4">Interactive Dashboard</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Experience the full power of AquaNexa AI. Monitor your pools, analyze AI predictions, and control hardware remotely.</p>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "secondary" }))}>
                View Live Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
