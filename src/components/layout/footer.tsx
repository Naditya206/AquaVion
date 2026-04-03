import Link from "next/link"
import { Droplets } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          <span className="font-semibold">AquaNexa AI &copy; {new Date().getFullYear()}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Smart Aquaculture with AIoT Technology.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/features" className="hover:text-foreground">Features</Link>
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        </div>
      </div>
    </footer>
  )
}
