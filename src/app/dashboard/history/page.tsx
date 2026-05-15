"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Calendar, Download, Filter, Table as TableIcon, Activity } from "lucide-react"
import { db } from "@/lib/db/firebase"
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  
  const [ponds, setPonds] = useState<any[]>([])
  const [selectedPondId, setSelectedPondId] = useState("")
  const [period, setPeriod] = useState("7d")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortOrder, setSortOrder] = useState("desc") // "desc" or "asc"
  
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
      const now = new Date();
      let startLimit = new Date();
      let endLimit = new Date();
      
      if (period === "today") {
        startLimit.setHours(0, 0, 0, 0);
      } else if (period === "7d") {
        startLimit.setDate(now.getDate() - 7);
      } else if (period === "30d") {
        startLimit.setDate(now.getDate() - 30);
      } else if (period === "custom" && startDate && endDate) {
        startLimit = new Date(startDate);
        endLimit = new Date(endDate);
        endLimit.setHours(23, 59, 59, 999);
      } else {
        startLimit.setHours(0, 0, 0, 0);
      }

      const sensorsRef = collection(db, "users", user.uid, "ponds", selectedPondId, "sensors");
      
      // Menggunakan query dasar lalu filter di JS agar tidak butuh Composite Index yang kompleks
      const q = query(
        sensorsRef,
        orderBy("createdAt", "desc"),
        limit(500)
      );

      const snapshot = await getDocs(q);
      
      const fetchedData = snapshot.docs.map(doc => {
        const docData = doc.data();
        const rawDate = docData.createdAt || docData.created_at;
        let timestamp = "";
        let dateObj = new Date();
        
        if (rawDate && rawDate.toDate) {
          dateObj = rawDate.toDate();
          timestamp = dateObj.toISOString();
        } else if (typeof rawDate === "string") {
          dateObj = new Date(rawDate);
          timestamp = rawDate;
        }
        
        return {
          id: doc.id,
          suhu: docData.temperature ?? 0,
          ph_air: docData.ph ?? 0,
          kekeruhan: docData.turbidity ?? 0,
          tinggi_air: docData.waterLevel ?? 0,
          timestamp,
          dateObj,
          actions: docData.actions || []
        };
      });

      // Filter by Date di memory JS
      const filteredData = fetchedData.filter(item => {
        return item.dateObj >= startLimit && item.dateObj <= endLimit;
      });

      let sumSuhu = 0, sumPh = 0;
      let minSuhu = Infinity, maxSuhu = -Infinity;
      let minPh = Infinity, maxPh = -Infinity;

      const formattedData = filteredData.map(item => {
        const isWarning = item.suhu < 25 || item.suhu > 30 || item.ph_air < 6.5 || item.ph_air > 8.5 || item.kekeruhan > 400 || item.tinggi_air < 40 || item.tinggi_air > 70;
        const status = isWarning ? "Butuh Tindakan" : "Aman";

        sumSuhu += item.suhu;
        sumPh += item.ph_air;
        if (item.suhu < minSuhu) minSuhu = item.suhu;
        if (item.suhu > maxSuhu) maxSuhu = item.suhu;
        if (item.ph_air < minPh) minPh = item.ph_air;
        if (item.ph_air > maxPh) maxPh = item.ph_air;

        return { ...item, status }
      });

      const sortedData = formattedData.sort((a, b) => {
        return sortOrder === "desc" 
          ? b.dateObj.getTime() - a.dateObj.getTime()
          : a.dateObj.getTime() - b.dateObj.getTime();
      });

      setData(sortedData);
      setCurrentPage(1);

    } catch (err: any) {
      console.error(err);
      setError("Kesalahan saat mengambil data riwayat: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user && selectedPondId) {
      fetchData();
    }
  }, [selectedPondId, period, user, sortOrder]) // Re-run when sort order changes

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

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <div className="space-y-2 w-full md:w-1/4">
              <label className="text-sm font-medium text-muted-foreground">Urutkan Waktu</label>
              <select
                 className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                 value={sortOrder}
                 onChange={(e) => setSortOrder(e.target.value)}
              >
                 <option value="desc">Terbaru ke Terlama</option>
                 <option value="asc">Terlama ke Terbaru</option>
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
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row) => (
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
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-muted-foreground">
                    Menampilkan halaman {currentPage} dari {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
