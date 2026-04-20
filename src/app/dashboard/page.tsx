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
    <div className="flex flex-1 flex-col gap-4 w-full px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="space-y-2 w-full">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dasbor Pemantauan Kolam</h1>
          <p className="text-sm md:text-base text-muted-foreground">{headerSubtitle}</p>
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
        <div className="flex items-center gap-2 bg-card px-3 py-1.5 md:px-4 md:py-2 border rounded-full shadow-sm">
          <span className="relative flex h-2 w-2 md:h-3 md:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-green-500"></span>
          </span>
          <span className="text-xs md:text-sm font-medium">Sistem Daring</span>
        </div>
      </div>

      {/* Sensor Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card className={`border-l-4 ${latestSensor?.temperature && (latestSensor.temperature < 25 || latestSensor.temperature > 30) ? 'border-l-red-500 bg-red-500/5' : 'border-l-blue-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Suhu Air</CardTitle>
            <Thermometer className={`h-3 w-3 md:h-4 md:w-4 ${latestSensor?.temperature && (latestSensor.temperature < 25 || latestSensor.temperature > 30) ? 'text-red-500' : 'text-blue-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {latestSensor?.temperature != null ? `${latestSensor.temperature}°C` : "--"}
            </div>
            <p className="text-[10px] md:text-xs flex items-center mt-1">
              {latestSensor?.temperature == null ? null : latestSensor.temperature < 25 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dingin</span></>
              ) : latestSensor.temperature > 30 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Panas</span></>
              ) : (
                <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Suhu Optimal</span></>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card className={`border-l-4 ${latestSensor?.ph && (latestSensor.ph < 6.5 || latestSensor.ph > 8.5) ? 'border-l-red-500 bg-red-500/5' : 'border-l-cyan-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">pH Air</CardTitle>
            <Activity className={`h-3 w-3 md:h-4 md:w-4 ${latestSensor?.ph && (latestSensor.ph < 6.5 || latestSensor.ph > 8.5) ? 'text-red-500' : 'text-cyan-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {latestSensor?.ph != null ? latestSensor.ph : "--"}
            </div>
            <p className="text-[10px] md:text-xs flex items-center mt-1">
              {latestSensor?.ph == null ? null : latestSensor.ph < 6.5 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Asam</span></>
              ) : latestSensor.ph > 8.5 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Basa</span></>
              ) : (
                <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">pH Normal</span></>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${latestSensor?.turbidity && latestSensor.turbidity > 400 ? 'border-l-red-500 bg-red-500/5' : 'border-l-indigo-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Kekeruhan</CardTitle>
            <Wind className={`h-3 w-3 md:h-4 md:w-4 ${latestSensor?.turbidity && latestSensor.turbidity > 400 ? 'text-red-500' : 'text-indigo-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {latestSensor?.turbidity != null ? `${latestSensor.turbidity} NTU` : "--"}
            </div>
            <p className="text-[10px] md:text-xs flex items-center mt-1">
               {latestSensor?.turbidity == null ? null : latestSensor.turbidity > 400 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Air Keruh</span></>
              ) : (
                <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Air Bersih</span></>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${latestSensor?.waterLevel && (latestSensor.waterLevel < 40 || latestSensor.waterLevel > 70) ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Tinggi Air</CardTitle>
            <Droplets className={`h-3 w-3 md:h-4 md:w-4 ${latestSensor?.waterLevel && (latestSensor.waterLevel < 40 || latestSensor.waterLevel > 70) ? 'text-red-500' : 'text-amber-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {latestSensor?.waterLevel != null ? `${latestSensor.waterLevel} cm` : "--"}
            </div>
            <p className="text-[10px] md:text-xs flex items-center mt-1">
              {latestSensor?.waterLevel == null ? null : latestSensor.waterLevel < 40 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dangkal</span></>
              ) : latestSensor.waterLevel > 70 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dalam</span></>
              ) : (
                <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Volume Aman</span></>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Tren Kualitas Air (24 Jam)</CardTitle>
              <CardDescription className="text-xs md:text-sm">Visualisasi riwayat sensor untuk mencegah masalah lebih dini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-80 w-full overflow-x-auto">
                <div className="min-w-[500px] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                      <XAxis dataKey="time" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line type="monotone" dataKey="temp" name="Suhu (°C)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="turbidity" name="Kekeruhan" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="waterLevel" name="Tinggi (cm)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {sensorsLoading ? (
                <p className="mt-3 text-xs text-muted-foreground">Memuat data sensor secara live...</p>
              ) : null}
              {sensorsError ? (
                <p className="mt-3 text-xs text-destructive">{sensorsError}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Action Recomendation Panel */}
        <div className="space-y-6 md:space-y-8">
          <Card className={latestSensor?.actions && latestSensor.actions.length > 0 ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-green-500"}>
            <CardHeader className={latestSensor?.actions && latestSensor.actions.length > 0 ? "bg-red-500/10 rounded-t-xl" : "bg-green-500/10 rounded-t-xl"}>
              <CardTitle className="flex items-center gap-2">
                {latestSensor?.actions && latestSensor.actions.length > 0 ? (
                  <><AlertTriangle className="h-5 w-5 text-red-500" /> <span className="text-red-500">Butuh Tindakan</span></>
                ) : (
                  <><CheckCircle className="h-5 w-5 text-green-500" /> <span className="text-green-500">Status Aman</span></>
                )}
              </CardTitle>
              <CardDescription>Rekomendasi dari sistem pakar AI kami</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {latestSensor?.actions && latestSensor.actions.length > 0 ? (
                <div className="space-y-4">
                  {latestSensor.actions.map((action, i) => {
                    const [problem, solution] = action.split("→");
                    return (
                      <div key={i} className="flex flex-col gap-1 pb-4 border-b last:border-0 last:pb-0">
                        <span className="font-semibold text-sm text-red-500 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" />{problem?.trim()}</span>
                        <span className="text-sm font-medium text-foreground bg-muted p-2 rounded-md border">{solution?.trim()}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">Kualitas air terpantau optimal. Tidak ada masalah pada kolam ini, lele dapat tumbuh dengan baik.</p>
                </div>
              )}
            </CardContent>
          </Card>
          

        </div>
      </div>
    </div>
  )
}
