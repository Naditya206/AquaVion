"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, CheckCircle, Droplets, Thermometer, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardData } from "./use-dashboard-data"

export default function DashboardPage() {
  const {
    user,
    loading,
    ponds,
    pondsLoading,
    pondsError,
    selectedPondId,
    handlePondChange,
    sensorsLoading,
    sensorsError,
    latestSensor,
    chartData,
  } = useDashboardData()

  const headerSubtitle = useMemo(() => {
    const selectedPond = ponds.find((pond) => pond.id === selectedPondId)
    if (!selectedPond) return "Telemetri waktu nyata dan analitik AI."
    const details = [selectedPond.name, selectedPond.location].filter(Boolean).join(" - ")
    return `Telemetri waktu nyata dan analitik AI (${details}).`
  }, [ponds, selectedPondId])

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-muted-foreground">
        Memuat dasbor...
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dasbor Pemantauan Kolam</h1>
          <p className="text-muted-foreground">{headerSubtitle}</p>
          <div className="rounded-xl border bg-card/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pilih Kolam</label>
              {pondsLoading ? <span className="text-xs text-muted-foreground">Memuat...</span> : null}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ponds.length === 0 ? (
                <span className="text-sm text-muted-foreground">Belum ada kolam.</span>
              ) : (
                ponds.map((pond) => {
                  const isActive = pond.id === selectedPondId

                  return (
                    <Button
                      key={pond.id}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      className="h-auto min-w-44 justify-start px-3 py-2 text-left"
                      onClick={() => handlePondChange(pond.id)}
                    >
                      <span className="block">
                        <span className="block text-sm font-semibold">{pond.name || `Kolam ${pond.id.slice(0, 6)}`}</span>
                        <span className="block text-xs opacity-80">{pond.location || "Lokasi belum diisi"}</span>
                      </span>
                    </Button>
                  )
                })
              )}
            </div>
            {pondsError ? <span className="mt-2 block text-xs text-destructive">{pondsError}</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 border rounded-full shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium">Sistem Daring</span>
        </div>
      </div>

      {/* Sensor Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suhu (Temperature)</CardTitle>
            <Thermometer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSensor?.temperature != null ? `${latestSensor.temperature}°C` : "--"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Normal
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat pH</CardTitle>
            <Activity className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSensor?.ph != null ? latestSensor.ph : "--"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Optimal (Lele: 6.5-8.0)
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kekeruhan (Turbidity)</CardTitle>
            <Wind className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSensor?.turbidity != null ? `${latestSensor.turbidity}` : "--"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="ml-1">Pantau tingkat kekeruhan</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ketinggian Air</CardTitle>
            <Droplets className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {latestSensor?.waterLevel != null ? `${latestSensor.waterLevel} ml` : "--"}
            </div>
            <p className="mt-1 flex items-center text-xs text-amber-500">
              <AlertTriangle className="h-3 w-3" />
              <span className="ml-1">Cek tinggi air secara berkala</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Tren Kualitas Air (24j)</CardTitle>
              <CardDescription>Data historis untuk Suhu, pH, dan DO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-75 min-h-75 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="temp" name="Suhu (°C)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="turbidity" name="Turbidity" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="waterLevel" name="Tinggi Air (ml)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {sensorsLoading ? (
                <p className="mt-3 text-xs text-muted-foreground">Memuat data sensor...</p>
              ) : null}
              {sensorsError ? (
                <p className="mt-3 text-xs text-destructive">{sensorsError}</p>
              ) : null}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analisis Visi Komputer AI</CardTitle>
              <CardDescription>Hasil pindaian terbaru dari kamera bawah air</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted min-h-32 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl font-bold text-primary">12,450</span>
                  <span className="text-sm text-muted-foreground">Perkiraan Jumlah Ikan</span>
                </div>
                <div className="bg-muted min-h-32 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl font-bold text-primary">125g</span>
                  <span className="text-sm text-muted-foreground">Rata-rata Berat / Ikan</span>
                </div>
                <div className="bg-muted min-h-32 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl font-bold text-primary">Normal</span>
                  <span className="text-sm text-muted-foreground">Perilaku Makan</span>
                </div>
                <div className="bg-muted min-h-32 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl font-bold text-primary">45 Hari</span>
                  <span className="text-sm text-muted-foreground">Perk. Waktu Panen</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications and Logs */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Notifikasi Sistem</CardTitle>
              <CardDescription>Peringatan terbaru dan tindakan yang diambil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Kadar amonia naik</h4>
                    <p className="text-xs text-muted-foreground">08:15 AM - Tingkat terdeteksi pada 0.03 mg/L.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Pompa air diaktifkan</h4>
                    <p className="text-xs text-muted-foreground">08:16 AM - Sistem otomatis memicu pertukaran air untuk menurunkan amonia.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Pemberian Pakan Pagi Selesai</h4>
                    <p className="text-xs text-muted-foreground">07:00 AM - Menyebarkan 5kg pakan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-full text-cyan-500">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Pemindaian Kamera AI</h4>
                    <p className="text-xs text-muted-foreground">06:00 AM - Tingkat pertumbuhan +2% dibandingkan minggu lalu.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Tindakan Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full bg-background/20 hover:bg-background/30 transition-colors rounded-md p-2 text-sm font-medium text-left flex justify-between items-center">
                Pemberian Pakan Manual <span className="text-xl">→</span>
              </button>
              <button className="w-full bg-background/20 hover:bg-background/30 transition-colors rounded-md p-2 text-sm font-medium text-left flex justify-between items-center">
                Nyalakan Aerator <span className="text-xl">→</span>
              </button>
              <button className="w-full bg-background/20 hover:bg-background/30 transition-colors rounded-md p-2 text-sm font-medium text-left flex justify-between items-center">
                Mulai Pemindaian AI <span className="text-xl">→</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
