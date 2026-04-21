"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, Download, Filter, Table as TableIcon, Activity } from "lucide-react"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  
  const [ponds, setPonds] = useState<any[]>([])
  const [selectedPondId, setSelectedPondId] = useState("")
  const [period, setPeriod] = useState("7d")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  const [data, setData] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user && !loading) {
      import("firebase/firestore").then(({ collection, getDocs }) => {
        import("@/lib/db/firebase").then(({ db }) => {
           getDocs(collection(db, "users", user.uid, "ponds")).then((snap) => {
            const fetchedPonds = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
            setPonds(fetchedPonds);
            let initialPondId = typeof window !== "undefined" ? window.localStorage.getItem("selectedPondId") || "" : "";
            if (!initialPondId && fetchedPonds.length > 0) initialPondId = fetchedPonds[0].id;
            setSelectedPondId(initialPondId);
          });
        });
      });
    }
  }, [user, loading])

  const fetchData = async () => {
    if (!user || !selectedPondId) return;
    setIsLoading(true);
    setError("");

    try {
      let queryUrl = `/api/history?uid=${user.uid}&pondId=${selectedPondId}&period=${period}`;
      if (period === "custom") {
        queryUrl += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const res = await fetch(queryUrl);
      const json = await res.json();
      
      if (res.ok) {
        // Reverse data so it's sorted historically (oldest first for charts)
        setData(json.data.reverse());
        setSummary(json.summary);
      } else {
        setError(json.error || "Gagal mengambil data");
        setData([]);
      }
    } catch (err) {
      setError("Kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user && selectedPondId) {
      fetchData();
    }
  }, [selectedPondId, period, user])

  const chartData = useMemo(() => {
    return data.map(d => ({
      time: new Date(d.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      ...d
    }))
  }, [data])

  const exportCSV = () => {
    if (!data.length) return;
    const headers = ["Waktu", "Suhu (°C)", "pH", "Kekeruhan (NTU)", "Tinggi Air (cm)", "Status"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + data.map(row => {
          return `${new Date(row.timestamp).toLocaleString("id-ID")},${row.suhu},${row.ph_air},${row.kekeruhan},${row.tinggi_air},${row.status}`
      }).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Kolam_${selectedPondId}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat...</div>
  if (!user) return <div className="p-8 text-center text-muted-foreground">Anda harus masuk.</div>

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat & Analitik Data</h1>
        <p className="text-muted-foreground">Pantau tren kualitas air dan rekap aktivitas sensor kolam.</p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 w-full md:w-1/3">
              <label className="text-sm font-medium text-muted-foreground">Pilih Kolam</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedPondId}
                onChange={(e) => setSelectedPondId(e.target.value)}
              >
                {ponds.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                {ponds.length === 0 && <option value="">Tidak ada kolam</option>}
              </select>
            </div>
            <div className="space-y-2 w-full md:w-1/4">
              <label className="text-sm font-medium text-muted-foreground">Rentang Waktu</label>
              <select
                 className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                 value={period}
                 onChange={(e) => setPeriod(e.target.value)}
              >
                 <option value="today">Hari Ini</option>
                 <option value="7d">7 Hari Terakhir</option>
                 <option value="30d">30 Hari Terakhir</option>
                 <option value="custom">Kustom</option>
              </select>
            </div>
            
            {period === "custom" && (
              <>
                <div className="space-y-2 w-full md:w-1/6">
                  <label className="text-sm font-medium text-muted-foreground">Mulai</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2 w-full md:w-1/6">
                  <label className="text-sm font-medium text-muted-foreground">Sampai</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <Button onClick={fetchData} variant="secondary" className="w-full md:w-auto mt-auto">Set</Button>
              </>
            )}

            <Button onClick={exportCSV} variant="outline" className="w-full md:w-auto mt-auto md:ml-auto" disabled={!data.length}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="p-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : isLoading ? (
        <div className="p-12 text-center border rounded-xl bg-card/50">
          <Activity className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Menarik data dari server IoT...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="p-4 flex flex-col justify-center text-center space-y-1">
                   <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Rata-rata Suhu</p>
                   <h3 className="text-2xl font-bold">{summary.avgSuhu} °C</h3>
                   <p className="text-xs text-muted-foreground">Min {summary.minSuhu ?? '--'} / Max {summary.maxSuhu ?? '--'}</p>
                </CardContent>
              </Card>
              <Card className="bg-cyan-500/5 border-cyan-500/20">
                <CardContent className="p-4 flex flex-col justify-center text-center space-y-1">
                   <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Rata-rata pH</p>
                   <h3 className="text-2xl font-bold">{summary.avgPh}</h3>
                   <p className="text-xs text-muted-foreground">Min {summary.minPh ?? '--'} / Max {summary.maxPh ?? '--'}</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                 <CardContent className="p-4 flex flex-col justify-center text-center space-y-1">
                   <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Status Umum</p>
                   <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Aman</h3>
                   <p className="text-xs text-muted-foreground">{summary.totalData} Data Terkumpul</p>
                </CardContent>
              </Card>
              <Card className="bg-indigo-500/5 border-indigo-500/20">
                 <CardContent className="p-4 flex flex-col justify-center text-center space-y-1">
                   <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Total Insiden</p>
                   <h3 className="text-2xl font-bold">{data.filter(d => d.status === "Butuh Tindakan").length}</h3>
                   <p className="text-xs text-muted-foreground">Membutuhkan intervensi</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grafik Kualitas Air</CardTitle>
              <CardDescription>Tren sensor dari waktu ke waktu berdasarkan rentang waktu yang dipilih.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full min-w-0">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                      <XAxis dataKey="time" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="suhu" name="Suhu (°C)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="ph_air" name="pH" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="kekeruhan" name="Kekeruhan" stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="tinggi_air" name="Tinggi Air" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Tidak ada data untuk grafik</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table Data */}
          <Card>
             <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><TableIcon className="h-5 w-5" /> Data Tabel Historik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Waktu</th>
                      <th className="px-4 py-3 font-medium">Suhu (°C)</th>
                      <th className="px-4 py-3 font-medium">pH Air</th>
                      <th className="px-4 py-3 font-medium">Kekeruhan</th>
                      <th className="px-4 py-3 font-medium">Tinggi Air</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((row) => (
                        <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(row.timestamp).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td>
                          <td className="px-4 py-3 font-medium">{row.suhu}</td>
                          <td className="px-4 py-3">{row.ph_air}</td>
                          <td className="px-4 py-3">{row.kekeruhan} NTU</td>
                          <td className="px-4 py-3">{row.tinggi_air} cm</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.status === 'Aman' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada riwayat sensor di rentang waktu ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
