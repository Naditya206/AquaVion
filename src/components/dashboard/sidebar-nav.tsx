"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, Settings, User, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/history", icon: History, label: "History" },
  { href: "/dashboard/kolam", icon: Droplets, label: "Kolam" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
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
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
