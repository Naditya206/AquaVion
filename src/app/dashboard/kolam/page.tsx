"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Check, X, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePonds } from "@/app/dashboard/kolam/use-ponds"

export default function KolamManagementPage() {
  const router = useRouter()
  const {
    user,
    loading,
    kolamList,
    isAdding,
    editingId,
    isSaving,
    isLoading,
    error,
    formData,
    setFormData,
    setIsAdding,
    resetForm,
    handleEdit,
    handleSave,
    handleDelete,
  } = usePonds()

  const openMonitoring = (pondId: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("selectedPondId", pondId)
      window.sessionStorage.setItem("selectedPondId", pondId)
    }
    router.push("/dashboard")
  }

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-muted-foreground">
        Memuat data...
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Kolam</h1>
          <p className="text-muted-foreground">Kelola daftar kolam dan perangkat IoT yang terhubung.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kolam
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isAdding && (
        <Card className="mb-8 border-primary">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Kolam" : "Tambah Kolam Baru"}</CardTitle>
            <CardDescription>Masukkan detail identitas kolam di bawah ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Kolam *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: Kolam Lele Pembibitan"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lokasi *</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: Blok Selatan"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Alat (Device ID IoT) *</label>
                <input 
                  type="text" 
                  value={formData.device_id}
                  onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: AQN-IOT-002"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ukuran Kolam (m²)</label>
                <input 
                  type="number" 
                  value={formData.size || ''}
                  onChange={(e) => setFormData({...formData, size: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: 50"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah Ikan (ekor)</label>
                <input 
                  type="number" 
                  value={formData.fishCount || ''}
                  onChange={(e) => setFormData({...formData, fishCount: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: 1000"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kedalaman Air (cm)</label>
                <input 
                  type="number" 
                  value={formData.depth || ''}
                  onChange={(e) => setFormData({...formData, depth: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Misal: 80"
                  min="0"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-primary">Threshold Sensor (Opsional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">pH Min</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.thresholds?.phMin || ''}
                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, phMin: e.target.value ? Number(e.target.value) : undefined}})}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="6.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">pH Max</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.thresholds?.phMax || ''}
                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, phMax: e.target.value ? Number(e.target.value) : undefined}})}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="8.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Suhu Min (°C)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.thresholds?.tempMin || ''}
                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, tempMin: e.target.value ? Number(e.target.value) : undefined}})}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="25"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Suhu Max (°C)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.thresholds?.tempMax || ''}
                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, tempMax: e.target.value ? Number(e.target.value) : undefined}})}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Turbidity Max (NTU)</label>
                  <input 
                    type="number" 
                    value={formData.thresholds?.turbidityMax || ''}
                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, turbidityMax: e.target.value ? Number(e.target.value) : undefined}})}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Tinggi Air Min (cm)</label>
                  <input 
                    type="number" 
                    value={formData.thresholds?.waterLevelMin || ''}
                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, waterLevelMin: e.target.value ? Number(e.target.value) : undefined}})}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Tinggi Air Max (cm)</label>
                  <input 
                    type="number" 
                    value={formData.thresholds?.waterLevelMax || ''}
                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, waterLevelMax: e.target.value ? Number(e.target.value) : undefined}})}
                    className="w-full flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="70"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Check className="mr-2 h-4 w-4" /> {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="mr-2 h-4 w-4" /> Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center p-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">Memuat daftar kolam...</p>
        </div>
      ) : kolamList.length === 0 ? (
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
                  <Button variant="secondary" className="w-full gap-2" onClick={() => openMonitoring(k.id)}>
                    <Eye className="h-4 w-4" /> Buka Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
