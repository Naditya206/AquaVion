"use client"

import { useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, CheckCircle, Droplets, Thermometer, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardData } from "./use-dashboard-data"
import { useWebSerial } from "@/hooks/use-web-serial"
import { Monitor, Wifi, WifiOff } from "lucide-react"

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

  const { isConnected, data: serialData, error: serialError, connect: connectSerial, disconnect: disconnectSerial, setSyncPond } = useWebSerial()

  // Update sync config when pond selection changes
  useEffect(() => {
    if (selectedPondId && user?.uid) {
      const selectedPond = ponds.find(p => p.id === selectedPondId)
      if (selectedPond) {
        setSyncPond({
          pondId: selectedPondId,
          userId: user.uid,
          deviceId: selectedPond.device_id || "UNKNOWN"
        })
      }
    } else {
      setSyncPond(null)
    }
  }, [selectedPondId, ponds, user, setSyncPond])

  // Use serial data if connected, otherwise use database data
  const activeSensor = isConnected ? {
    temperature: serialData.temperature ?? latestSensor?.temperature,
    ph: serialData.ph ?? latestSensor?.ph,
    turbidity: serialData.turbidity ?? latestSensor?.turbidity,
    waterLevel: serialData.waterLevel ?? latestSensor?.waterLevel,
    actions: latestSensor?.actions // Keep AI actions from DB
  } : latestSensor

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex-1">
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
              </div>
              
              {/* USB Serial Toggle */}
              <div className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border min-w-[240px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <Monitor className="h-3.5 w-3.5 text-primary" />
                    Monitor USB (COM7)
                  </div>
                  <Button 
                    size="sm" 
                    variant={isConnected ? "destructive" : "outline"}
                    className="h-7 text-[10px] px-2"
                    onClick={isConnected ? disconnectSerial : connectSerial}
                  >
                    {isConnected ? <><WifiOff className="mr-1 h-3 w-3" /> Putus</> : <><Wifi className="mr-1 h-3 w-3" /> Connect</>}
                  </Button>
                </div>
                {isConnected ? (
                  <div className="text-[10px] text-green-500 font-medium animate-pulse flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    Live Streaming dari Serial Port
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground italic">
                    Gunakan USB jika alat tidak terconnect WiFi
                  </div>
                )}
                {serialError && <div className="text-[9px] text-red-500 leading-tight">Error: {serialError}</div>}
              </div>
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
        <Card className={`border-l-4 ${activeSensor?.temperature && (activeSensor.temperature < 25 || activeSensor.temperature > 30) ? 'border-l-red-500 bg-red-500/5' : 'border-l-blue-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Suhu Air</CardTitle>
            <Thermometer className={`h-3 w-3 md:h-4 md:w-4 ${activeSensor?.temperature && (activeSensor.temperature < 25 || activeSensor.temperature > 30) ? 'text-red-500' : 'text-blue-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {activeSensor?.temperature != null ? `${activeSensor.temperature}°C` : "--"}
            </div>
            <p className="text-[10px] md:text-xs flex items-center mt-1">
              {activeSensor?.temperature == null ? null : activeSensor.temperature < 25 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dingin</span></>
              ) : activeSensor.temperature > 30 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Panas</span></>
              ) : (
                <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Suhu Optimal</span></>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card className={`border-l-4 ${activeSensor?.ph && (activeSensor.ph < 6.5 || activeSensor.ph > 8.5) ? 'border-l-red-500 bg-red-500/5' : 'border-l-cyan-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">pH Air</CardTitle>
            <Activity className={`h-3 w-3 md:h-4 md:w-4 ${activeSensor?.ph && (activeSensor.ph < 6.5 || activeSensor.ph > 8.5) ? 'text-red-500' : 'text-cyan-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {activeSensor?.ph != null ? activeSensor.ph : "--"}
            </div>
            <p className="text-[10px] md:text-xs flex items-center mt-1">
              {activeSensor?.ph == null ? null : activeSensor.ph < 6.5 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Asam</span></>
              ) : activeSensor.ph > 8.5 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Basa</span></>
              ) : (
                <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">pH Normal</span></>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${activeSensor?.turbidity && activeSensor.turbidity > 400 ? 'border-l-red-500 bg-red-500/5' : 'border-l-indigo-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Kekeruhan</CardTitle>
            <Wind className={`h-3 w-3 md:h-4 md:w-4 ${activeSensor?.turbidity && activeSensor.turbidity > 400 ? 'text-red-500' : 'text-indigo-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {activeSensor?.turbidity != null ? `${activeSensor.turbidity} NTU` : "--"}
            </div>
            <p className="text-[10px] md:text-xs flex items-center mt-1">
               {activeSensor?.turbidity == null ? null : activeSensor.turbidity > 400 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Air Keruh</span></>
              ) : (
                <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Air Bersih</span></>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${activeSensor?.waterLevel && (activeSensor.waterLevel < 40 || activeSensor.waterLevel > 70) ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Tinggi Air</CardTitle>
            <Droplets className={`h-3 w-3 md:h-4 md:w-4 ${activeSensor?.waterLevel && (activeSensor.waterLevel < 40 || activeSensor.waterLevel > 70) ? 'text-red-500' : 'text-amber-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {activeSensor?.waterLevel != null ? `${activeSensor.waterLevel} cm` : "--"}
            </div>
            <p className="text-[10px] md:text-xs flex items-center mt-1">
              {activeSensor?.waterLevel == null ? null : activeSensor.waterLevel < 40 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dangkal</span></>
              ) : activeSensor.waterLevel > 70 ? (
                <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dalam</span></>
              ) : (
                <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Volume Aman</span></>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">

        {/* Action Recomendation Panel */}
        <div className="space-y-6 md:space-y-8">
          <Card className={activeSensor?.actions && activeSensor.actions.length > 0 ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-green-500"}>
            <CardHeader className={activeSensor?.actions && activeSensor.actions.length > 0 ? "bg-red-500/10 rounded-t-xl" : "bg-green-500/10 rounded-t-xl"}>
              <CardTitle className="flex items-center gap-2">
                {activeSensor?.actions && activeSensor.actions.length > 0 ? (
                  <><AlertTriangle className="h-5 w-5 text-red-500" /> <span className="text-red-500">Butuh Tindakan</span></>
                ) : (
                  <><CheckCircle className="h-5 w-5 text-green-500" /> <span className="text-green-500">Status Aman</span></>
                )}
              </CardTitle>
              <CardDescription>Rekomendasi dari sistem pakar AI kami</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {activeSensor?.actions && activeSensor.actions.length > 0 ? (
                <div className="space-y-4">
                  {activeSensor.actions.map((action, i) => {
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
