"use client"

import { useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, CheckCircle, Clock, Droplets, Thermometer, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useDashboardData } from "./use-dashboard-data"
import { Wifi, AlertCircle } from "lucide-react"

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
    chartPeriod,
    setChartPeriod,
  } = useDashboardData()

  // Update sync config when pond selection changes
  // USB Serial logic removed as requested

  // Use database data
  const activeSensor = latestSensor
  
  const selectedPond = ponds.find((pond) => pond.id === selectedPondId)
  const connectedSSID = selectedPond?.last_ssid || "Tidak diketahui"

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
          <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1">
            <p className="text-sm md:text-base text-muted-foreground">{headerSubtitle}</p>
            {activeSensor?.createdAt && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full w-fit">
                <Clock className="h-3 w-3" />
                Update: {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(activeSensor.createdAt)).replace(/\./g, ':')}
              </div>
            )}
          </div>
          <div className="rounded-xl border bg-card p-4 md:p-5 flex flex-col md:flex-row md:items-stretch justify-between gap-6 shadow-sm">
            <div className="flex-1">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pilih Kolam</label>
                {pondsLoading ? <span className="text-xs text-muted-foreground animate-pulse">Memuat...</span> : null}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {ponds.length === 0 ? (
                  <span className="text-sm text-muted-foreground italic">Belum ada kolam.</span>
                ) : (
                  ponds.map((pond) => {
                    const isActive = pond.id === selectedPondId

                    return (
                      <Button
                        key={pond.id}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        className="h-auto min-w-[180px] justify-start px-3 py-2.5 text-left transition-all"
                        onClick={() => handlePondChange(pond.id)}
                      >
                        <span className="block">
                          <span className="block text-sm font-semibold">{pond.name || `Kolam ${pond.id.slice(0, 6)}`}</span>
                          <span className="block text-xs opacity-80 mt-0.5">{pond.location || "Lokasi belum diisi"}</span>
                        </span>
                      </Button>
                    )
                  })
                )}
              </div>
              {pondsError ? <span className="mt-2 block text-xs text-destructive">{pondsError}</span> : null}
            </div>
            
            {/* Vertical Divider */}
            <div className="hidden md:block w-px bg-border"></div>
            <div className="md:hidden h-px w-full bg-border"></div>
            
            {/* Dynamic WiFi Indicator */}
            <div className="flex-1 md:max-w-[320px] flex flex-col justify-center">
              <div className="flex items-center gap-2 font-semibold text-sm text-primary mb-3">
                <Wifi className="h-4 w-4" />
                Koneksi Jaringan Alat
              </div>
              <div className="text-sm font-medium flex items-center gap-2 mb-3">
                SSID: <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono text-xs">{connectedSSID}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 md:px-4 md:py-2 border rounded-full shadow-sm w-fit">
            <span className="relative flex h-2 w-2 md:h-3 md:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-green-500"></span>
            </span>
            <span className="text-xs md:text-sm font-medium">Sistem Daring</span>
          </div>
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
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] md:text-xs flex items-center">
                {activeSensor?.temperature == null ? null : activeSensor.temperature < 25 ? (
                  <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dingin</span></>
                ) : activeSensor.temperature > 30 ? (
                  <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Panas</span></>
                ) : (
                  <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Suhu Optimal</span></>
                )}
              </p>
              {activeSensor?.createdAt && (
                <span className="text-[9px] text-muted-foreground opacity-50 font-medium tabular-nums">
                  {new Date(activeSensor.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
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
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] md:text-xs flex items-center">
                {activeSensor?.ph == null ? null : activeSensor.ph < 6.5 ? (
                  <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Asam</span></>
                ) : activeSensor.ph > 8.5 ? (
                  <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Basa</span></>
                ) : (
                  <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">pH Normal</span></>
                )}
              </p>
              {activeSensor?.createdAt && (
                <span className="text-[9px] text-muted-foreground opacity-50 font-medium tabular-nums">
                  {new Date(activeSensor.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
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
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] md:text-xs flex items-center">
                {activeSensor?.turbidity == null ? null : activeSensor.turbidity > 400 ? (
                  <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Air Keruh</span></>
                ) : (
                  <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Air Bersih</span></>
                )}
              </p>
              {activeSensor?.createdAt && (
                <span className="text-[9px] text-muted-foreground opacity-50 font-medium tabular-nums">
                  {new Date(activeSensor.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${activeSensor?.waterLevel && (activeSensor.waterLevel < 40 || activeSensor.waterLevel > 70) ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Tinggi Air</CardTitle>
            <Droplets className={`h-3 w-3 md:h-4 md:w-4 ${activeSensor?.waterLevel && (activeSensor.waterLevel < 40 || activeSensor.waterLevel > 70) ? 'text-red-500' : 'text-amber-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold flex items-baseline gap-2 flex-wrap">
              {activeSensor?.waterLevel != null ? `${activeSensor.waterLevel} cm` : "--"}
              {activeSensor?.waterVolume != null && (
                <span className="text-sm font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50" title="Volume Air Aktual">
                  {Math.round(activeSensor.waterVolume).toLocaleString("id-ID")} L
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] md:text-xs flex items-center">
                {activeSensor?.waterLevel == null ? null : activeSensor.waterLevel < 40 ? (
                  <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dangkal</span></>
                ) : activeSensor.waterLevel > 70 ? (
                  <><AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-500 mr-1" /> <span className="text-red-500 font-medium">Terlalu Dalam</span></>
                ) : (
                  <><CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 mr-1" /> <span className="text-muted-foreground">Volume Aman</span></>
                )}
              </p>
              {activeSensor?.createdAt && (
                <span className="text-[9px] text-muted-foreground opacity-50 font-medium tabular-nums">
                  {new Date(activeSensor.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Charts Panel (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Riwayat Sensor Keseluruhan</CardTitle>
                <CardDescription>Pergerakan 4 parameter kualitas air secara real-time</CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Rentang:</span>
                <select 
                  className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value)}
                >
                  <option value="1d">Hari Ini</option>
                  <option value="7d">7 Hari Terakhir</option>
                  <option value="30d">30 Hari Terakhir</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {chartData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Suhu Air */}
                  <div className="h-[220px] w-full border rounded-xl p-3 bg-card/50 shadow-sm flex flex-col">
                    <h4 className="text-xs font-bold mb-3 text-red-500 flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5"/> Suhu Air (°C)</h4>
                    <div className="flex-1 min-h-0 min-w-0 w-full h-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={5} minTickGap={20} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={5} domain={[20, 40]} />
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="temp" name="Suhu" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* pH Air */}
                  <div className="h-[220px] w-full border rounded-xl p-3 bg-card/50 shadow-sm flex flex-col">
                    <h4 className="text-xs font-bold mb-3 text-cyan-500 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5"/> pH Air</h4>
                    <div className="flex-1 min-h-0 min-w-0 w-full h-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={5} minTickGap={20} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={5} domain={[0, 14]} />
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Kekeruhan */}
                  <div className="h-[220px] w-full border rounded-xl p-3 bg-card/50 shadow-sm flex flex-col">
                    <h4 className="text-xs font-bold mb-3 text-indigo-500 flex items-center gap-1.5"><Wind className="h-3.5 w-3.5"/> Kekeruhan (NTU)</h4>
                    <div className="flex-1 min-h-0 min-w-0 w-full h-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={5} minTickGap={20} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={5} domain={[0, 'auto']} />
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="turbidity" name="Kekeruhan" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tinggi Air */}
                  <div className="h-[220px] w-full border rounded-xl p-3 bg-card/50 shadow-sm flex flex-col">
                    <h4 className="text-xs font-bold mb-3 text-amber-500 flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5"/> Tinggi Air (cm)</h4>
                    <div className="flex-1 min-h-0 min-w-0 w-full h-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={5} minTickGap={20} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={5} domain={[0, 120]} />
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="waterLevel" name="Tinggi Air" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[450px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">Belum ada data riwayat sensor</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Recomendation Panel (1 Column) */}
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
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
