"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, Settings, User, Droplets, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dasbor" },
  { href: "/dashboard/history", icon: History, label: "Riwayat" },
  { href: "/dashboard/kolam", icon: Droplets, label: "Manajemen Kolam" },
  { href: "/dashboard/guide", icon: BookOpen, label: "Panduan Air" },
  { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
  { href: "/dashboard/profile", icon: User, label: "Profil" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 w-max md:w-full">
      {navItems.map((item) => {
        const Icon = item.icon
        // For /dashboard, be exact so it doesn't highlight for all child routes
        const isActive = item.href === "/dashboard" 
          ? pathname === "/dashboard" 
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: isActive ? "default" : "ghost" }),
              "justify-start"
            )}
          >
            <Icon className="mr-3 h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
