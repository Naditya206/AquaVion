"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { Bell, Send, Sliders, Save, Database } from "lucide-react"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  
  // Available Ponds cache locally to avoid rewriting usePonds context logic here if not exported
  const [ponds, setPonds] = useState<any[]>([])
  const [selectedPondId, setSelectedPondId] = useState("")

  // Global Settings
  const [globalSettings, setGlobalSettings] = useState({
    webPushEnabled: true,
    telegramEnabled: false,
    botToken: "",
    chatId: "",
  })

  // Pond Settings
  const [pondSettings, setPondSettings] = useState({
    batas_min_ph: 6.5,
    batas_max_ph: 8.5,
    batas_min_suhu: 25,
    batas_max_suhu: 30,
    batas_min_air: 40,
    batas_max_air: 70,
  })

  const [savingGlobal, setSavingGlobal] = useState(false)
  const [savingPond, setSavingPond] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    // Fetch user ponds simplified
    if (user && !loading) {
      import("firebase/firestore").then(({ collection, getDocs }) => {
        import("@/lib/db/firebase").then(({ db }) => {
          getDocs(collection(db, "users", user.uid, "ponds")).then((snap) => {
            const fetchedPonds = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
            setPonds(fetchedPonds);
            
            let initialPondId = "";
            if (typeof window !== "undefined") {
              initialPondId = window.localStorage.getItem("selectedPondId") || "";
            }
            if (!initialPondId && fetchedPonds.length > 0) initialPondId = fetchedPonds[0].id;
            
            setSelectedPondId(initialPondId);

            // Fetch Settings
            fetch(`/api/settings?uid=${user.uid}${initialPondId ? '&pondId='+initialPondId : ''}`)
              .then(res => res.json())
              .then(data => {
                if (data.global) setGlobalSettings(data.global);
                if (data.pond) setPondSettings(data.pond);
              })
          })
        })
      })
    }
  }, [user, loading])

  // Refetch pond settings when pond changes
  useEffect(() => {
    if (user && selectedPondId) {
      fetch(`/api/settings?uid=${user.uid}&pondId=${selectedPondId}`)
        .then(res => res.json())
        .then(data => {
          if (data.pond) setPondSettings(data.pond);
        })
    }
  }, [selectedPondId, user])

  const handleGlobalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingGlobal(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, type: "global", data: globalSettings })
      });
      const data = await res.json();
      if (res.ok) setMessage({ type: "success", text: "Pengaturan notifikasi disimpan" });
      else setMessage({ type: "error", text: data.error });
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menyimpan pengaturan" });
    } finally {
      setSavingGlobal(false);
    }
  }

  const handlePondSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPondId) return;
    setSavingPond(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, pondId: selectedPondId, type: "pond", data: pondSettings })
      });
      const data = await res.json();
      if (res.ok) setMessage({ type: "success", text: "Threshold kolam berhasil diperbarui" });
      else setMessage({ type: "error", text: data.error });
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menyimpan pengatauran kolam" });
    } finally {
      setSavingPond(false);
    }
  }

  const [isSimulating, setIsSimulating] = useState(false)
  
  const handleTestTelegram = async () => {
    if (!user) return;
    setIsSimulating(true);
    setMessage({ type: "", text: "Memulai pengiriman simulasi ke 3 kolam..." });
    try {
      const res = await fetch(`/api/simulate?uid=${user.uid}`);
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Pengiriman berhasil! IoT dummy telah mengirim data ke ${data.banyak_kolam} kolam Anda. Cek Telegram Anda jika ada peringatan bahaya!` });
      } else {
        setMessage({ type: "error", text: data.error || "Gagal memulai simulasi" });
      }
    } catch (error) {
       setMessage({ type: "error", text: "Terjadi masalah saat mengakses API simulasi" });
    } finally {
       setIsSimulating(false);
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const handlePushToggle = async (checked: boolean) => {
    setGlobalSettings({...globalSettings, webPushEnabled: checked});
    if (checked && 'serviceWorker' in navigator && 'PushManager' in window && user) {
      try {
        const swReg = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
           const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
           if (!vapidPublicKey) {
              setMessage({ type: "error", text: "VAPID Public Key belum disetel di .env.local" });
              return;
           }
           setMessage({ type: "", text: "Mendaftarkan perangkat Anda ke Web Push..." });
           const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
           const subscription = await swReg.pushManager.subscribe({
             userVisibleOnly: true,
             applicationServerKey: convertedVapidKey
           });
           await fetch('/api/web-push/save', {
             method: 'POST',
             headers: {'Content-Type':'application/json'},
             body: JSON.stringify({ uid: user.uid, subscription })
           });
           setMessage({ type: "success", text: "Perangkat ini sukses berlangganan Push Notification!" });
        } else {
           setMessage({ type: "error", text: "Izin notifikasi diblokir oleh browser Anda." });
           setGlobalSettings({...globalSettings, webPushEnabled: false});
        }
      } catch (err) {
        console.error("Gagal mendaftar push", err);
        setMessage({ type: "error", text: "Gagal menghubungkan Service Worker Push Browser." });
      }
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat pengaturan...</div>
  if (!user) return <div className="p-8 text-center text-muted-foreground">Anda harus masuk.</div>

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">Sesuaikan perilaku sistem, notifikasi, dan ambang batas sensor.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-700 dark:text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-400'}`}>
          <p className="font-medium inline-block mr-2">{message.type === 'success' ? 'Berhasil:' : 'Peringatan:'}</p>
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* TABS Equivalent layout */}
      <div className="grid gap-8">
        
        {/* POND THRESHOLD SETTINGS */}
        <Card className="border-primary/20">
          <form onSubmit={handlePondSubmit}>
            <CardHeader className="bg-primary/5 pb-4 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Ambang Batas Sensor (Threshold)</CardTitle>
                  <CardDescription>Atur nilai minimal dan maksimal status aman untuk setiap kolam.</CardDescription>
                </div>
                <div className="w-full md:w-1/3">
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedPondId}
                    onChange={(e) => setSelectedPondId(e.target.value)}
                  >
                    {ponds.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    {ponds.length === 0 && <option value="">Tidak ada kolam</option>}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
                  <h4 className="font-medium text-sm flex items-center gap-2">🛠️ Suhu Air (°C)</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs text-muted-foreground">Minimal</label>
                       <input type="number" step="0.1" value={pondSettings.batas_min_suhu} onChange={e => setPondSettings({...pondSettings, batas_min_suhu: Number(e.target.value)})} className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-muted-foreground">Maksimal</label>
                       <input type="number" step="0.1" value={pondSettings.batas_max_suhu} onChange={e => setPondSettings({...pondSettings, batas_max_suhu: Number(e.target.value)})} className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background" />
                     </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
                  <h4 className="font-medium text-sm flex items-center gap-2">🛠️ Keasaman (pH)</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs text-muted-foreground">Minimal</label>
                       <input type="number" step="0.1" value={pondSettings.batas_min_ph} onChange={e => setPondSettings({...pondSettings, batas_min_ph: Number(e.target.value)})} className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-muted-foreground">Maksimal</label>
                       <input type="number" step="0.1" value={pondSettings.batas_max_ph} onChange={e => setPondSettings({...pondSettings, batas_max_ph: Number(e.target.value)})} className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background" />
                     </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
                  <h4 className="font-medium text-sm flex items-center gap-2">🛠️ Tinggi Air (cm)</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs text-muted-foreground">Minimal</label>
                       <input type="number" step="1" value={pondSettings.batas_min_air} onChange={e => setPondSettings({...pondSettings, batas_min_air: Number(e.target.value)})} className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-muted-foreground">Maksimal</label>
                       <input type="number" step="1" value={pondSettings.batas_max_air} onChange={e => setPondSettings({...pondSettings, batas_max_air: Number(e.target.value)})} className="w-full h-9 rounded-md border border-input px-3 py-1 text-sm bg-background" />
                     </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t justify-end">
              <Button type="submit" disabled={savingPond || !selectedPondId}>
                <Save className="h-4 w-4 mr-2" /> {savingPond ? "Menyimpan..." : "Simpan Threshold"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* NOTIFICATION SETTINGS */}
        <Card>
          <form onSubmit={handleGlobalSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-indigo-500" /> Preferensi Notifikasi</CardTitle>
              <CardDescription>Konfigurasi cara sistem memberitahu Anda saat ada kendala pada kolam.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div>
                  <h4 className="font-semibold">Web Push Notification</h4>
                  <p className="text-sm text-muted-foreground">Terima notifikasi di browser walau halaman ditutup.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={globalSettings.webPushEnabled} onChange={e => handlePushToggle(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div>
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-sky-500" />
                    <h4 className="font-semibold">Telegram Bot Notifikasi</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Kirim log insiden ke bot Telegram Anda.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={globalSettings.telegramEnabled} onChange={e => setGlobalSettings({...globalSettings, telegramEnabled: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {globalSettings.telegramEnabled && (
                <div className="p-4 border rounded-lg bg-sky-50 dark:bg-sky-950/20 space-y-4">
                   <div className="grid gap-2">
                    <label className="text-sm font-medium">Telegram Bot Token</label>
                    <input
                      type="password"
                      value={globalSettings.botToken}
                      onChange={(e) => setGlobalSettings({...globalSettings, botToken: e.target.value})}
                      placeholder="Contoh: 123456789:ABCdefGHIjkl..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Chat ID / Group ID</label>
                    <input
                      type="text"
                      value={globalSettings.chatId}
                      onChange={(e) => setGlobalSettings({...globalSettings, chatId: e.target.value})}
                      placeholder="Contoh: 987654321"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleTestTelegram} disabled={isSimulating} className="mt-2 text-sky-600 border-sky-200 hover:bg-sky-100 dark:text-sky-400 dark:border-sky-800 dark:hover:bg-sky-900">
                    {isSimulating ? (
                      <>Menyiapkan Simulasi Iot...</>
                    ) : (
                      <><Send className="h-3 w-3 mr-2" /> Jalankan Simulasi 3 Kolam</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
               <Button type="submit" disabled={savingGlobal}>
                  <Save className="h-4 w-4 mr-2" /> {savingGlobal ? "Menyimpan..." : "Simpan Preferensi"}
                </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
