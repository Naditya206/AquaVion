"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { User, Lock, Save, Camera } from "lucide-react"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  
  // Profile Forms
  const [name, setName] = useState("")
  const [role, setRole] = useState("user")
  
  // Password Forms
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    if (user && !loading) {
      fetch(`/api/profile?uid=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setProfile(data.profile)
            setName(data.profile.name || "")
            setRole(data.profile.role || "user")
          }
        })
    }
  }, [user, loading])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, name, role })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profil berhasil diperbarui" });
      } else {
        setMessage({ type: "error", text: data.error || "Gagal memperbarui profil" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem" });
    } finally {
      setSavingProfile(false);
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password baru tidak cocok" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password baru minimal 8 karakter" });
      return;
    }

    setSavingPassword(true);
    setMessage({ type: "", text: "" });

    try {
       const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, 
          current_password: currentPassword, 
          new_password: newPassword 
        })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Password berhasil diubah" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "Gagal mengubah password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan" });
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat profil...</div>
  if (!user) return <div className="p-8 text-center text-muted-foreground">Anda harus masuk.</div>

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground">Kelola informasi akun Anda dan preferensi keamanan sistem.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-700 dark:text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-400'}`}>
          <p className="font-semibold">{message.type === 'success' ? 'Berhasil' : 'Peringatan'}</p>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-md relative group">
                <User className="h-10 w-10 text-primary" />
                <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{name || "Pengguna Baru"}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-semibold text-primary mx-auto w-fit">
                  {role}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono bg-muted p-1 rounded border">
                  UID: {user.uid}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleUpdateProfile}>
              <CardHeader>
                <CardTitle className="text-xl">Informasi Pribadi</CardTitle>
                <CardDescription>Perbarui data diri dan identitas Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Role Sistem</label>
                  <input
                    type="text"
                    value={role}
                    readOnly
                    className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed opacity-70"
                  />
                  <p className="text-xs text-muted-foreground">Hubungi super admin untuk mengubah role Anda.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={savingProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <form onSubmit={handleChangePassword}>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Lock className="h-5 w-5" /> Keamanan Akun</CardTitle>
                <CardDescription>Ubah kata sandi secara berkala untuk menjaga keamanan akun Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Kata Sandi Baru</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Min. 8 karakter"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="outline" disabled={savingPassword}>
                  {savingPassword ? "Memproses..." : "Perbarui Kata Sandi"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
