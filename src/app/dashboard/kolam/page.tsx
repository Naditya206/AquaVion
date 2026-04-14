"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Check, X, Eye } from "lucide-react"
import Link from "next/link"

type Kolam = {
  id: string
  name: string
  location: string
  device_id: string
  created_at: string
}

export default function KolamManagementPage() {
  const [kolamList, setKolamList] = useState<Kolam[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({ name: "", location: "", device_id: "" })

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem("aquanexa_kolam_list")
    if (saved) {
      setKolamList(JSON.parse(saved))
    } else {
      // initial mock
      const mockList = [
        { id: "1", name: "Kolam A (Lele Utama)", location: "Blok Utara", device_id: "AQN-IoT-001", created_at: new Date().toISOString() }
      ]
      setKolamList(mockList)
      localStorage.setItem("aquanexa_kolam_list", JSON.stringify(mockList))
    }
  }, [])

  const handleSave = () => {
    if (!formData.name.trim()) return

    let updatedList;
    if (editingId) {
      updatedList = kolamList.map(k => k.id === editingId ? { ...k, ...formData } : k)
    } else {
      const newKolam: Kolam = {
        id: Date.now().toString(),
        name: formData.name,
        location: formData.location,
        device_id: formData.device_id,
        created_at: new Date().toISOString()
      }
      updatedList = [...kolamList, newKolam]
    }

    setKolamList(updatedList)
    localStorage.setItem("aquanexa_kolam_list", JSON.stringify(updatedList))
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kolam ini?")) return;
    const updatedList = kolamList.filter(k => k.id !== id)
    setKolamList(updatedList)
    localStorage.setItem("aquanexa_kolam_list", JSON.stringify(updatedList))
  }

  const handleEdit = (k: Kolam) => {
    setEditingId(k.id)
    setFormData({ name: k.name, location: k.location, device_id: k.device_id })
    setIsAdding(true)
  }

  const resetForm = () => {
    setFormData({ name: "", location: "", device_id: "" })
    setIsAdding(false)
    setEditingId(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Kolam</h1>
          <p className="text-muted-foreground">Kelola daftar kolam dan perangkat IoT yang terhubung.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kolam
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="mb-8 border-primary">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Kolam" : "Tambah Kolam Baru"}</CardTitle>
            <CardDescription>Masukkan detail identitas kolam di bawah ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Kolam</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: Kolam Lele Pembibitan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lokasi</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: Blok Selatan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Alat (Device ID IoT)</label>
                <input 
                  type="text" 
                  value={formData.device_id}
                  onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: AQN-IOT-002"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" /> Simpan
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="mr-2 h-4 w-4" /> Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {kolamList.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">Belum ada kolam yang ditambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kolamList.map((k) => (
            <Card key={k.id} className="flex flex-col transition-all hover:shadow-md border-border/50">
              <CardHeader className="pb-3 border-b border-border/20 bg-muted/10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-primary">{k.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      {k.location || 'Tidak ada lokasi spesifik'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 -mr-2 -mt-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(k)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(k.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3 text-sm flex-1">
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Device ID:</span>
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-sm border">{k.device_id || 'Belum di-set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status IoT:</span>
                    <span className="text-green-500 font-medium flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Aktif
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-0">
                  <Link href={`/dashboard?kolam=${k.id}`} className="w-full">
                    <Button variant="secondary" className="w-full gap-2">
                      <Eye className="h-4 w-4" /> Buka Monitoring
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
