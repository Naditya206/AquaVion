"use client"

import { Droplets } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:0.5s]" />
      </div>

      <div className="relative flex flex-col items-center gap-8 px-4">
        {/* Logo with enhanced animations */}
        <div className="relative flex items-center gap-3">
          <div className="relative">
            {/* Multiple ripple layers */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute -inset-4 rounded-full bg-primary/10 animate-ping" />
              <div className="absolute -inset-2 rounded-full bg-primary/20 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping [animation-delay:0.5s]" />
            </div>
            
            {/* Main logo */}
            <div className="relative">
              <Droplets className="h-14 w-14 sm:h-20 sm:w-20 text-primary animate-bounce drop-shadow-lg" />
              {/* Glow effect */}
              <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="font-bold text-3xl sm:text-4xl tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-pulse">
              AquaVion
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground/80 tracking-wide">
              IoT Monitoring System
            </span>
          </div>
        </div>

        {/* Loading text with dots */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Memuat</span>
          <div className="flex gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </div>

        {/* Rotating spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50 animate-spin" />
        </div>
      </div>
    </div>
  )
}
