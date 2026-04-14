import Link from "next/link"
import { Droplets } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          <span className="font-semibold">AquaVion &copy; {new Date().getFullYear()}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Akuakultur Pintar Terintegrasi dengan Teknologi AIoT.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">Tentang</Link>
          <Link href="/features" className="hover:text-foreground">Fitur</Link>
          <Link href="/dashboard" className="hover:text-foreground">Dasbor</Link>
        </div>
      </div>
    </footer>
  )
}
