"use client"

import Link from "next/link"
import { Droplets, Menu, X } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/features", label: "Fitur" },
    { href: "/dashboard", label: "Dasbor Pemantauan" },
    { href: "/dashboard/kolam", label: "Manajemen Kolam" },
    { href: "/about", label: "Tentang" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Droplets className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">AquaVion</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
            Mulai Sekarang
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 -mr-2 text-foreground/60 hover:text-foreground"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t py-4 px-4 space-y-4 bg-background">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link 
              href="/dashboard" 
              className={cn(buttonVariants({ variant: "default" }), "w-full justify-center")}
              onClick={() => setIsOpen(false)}
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
