"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/db/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [loading, router, user])

  const getErrorCopy = (err: unknown) => {
    const code = typeof err === "object" && err !== null && "code" in err
      ? String((err as { code?: string }).code)
      : ""

    switch (code) {
      case "auth/email-already-in-use":
        return {
          title: "Email sudah terdaftar",
          message: "Gunakan email lain atau masuk dengan akun yang ada.",
        }
      case "auth/weak-password":
        return {
          title: "Kata sandi terlalu lemah",
          message: "Gunakan minimal 6 karakter dengan kombinasi yang lebih kuat.",
        }
      case "auth/invalid-email":
        return {
          title: "Format email tidak valid",
          message: "Periksa kembali alamat email kamu.",
        }
      default:
        return {
          title: "Gagal mendaftar",
          message: "Terjadi kendala saat membuat akun. Coba lagi nanti.",
        }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setSubmitting(true)

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = credential.user

      if (name.trim()) {
        await updateProfile(firebaseUser, { displayName: name.trim() })
      }

      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          name: name.trim() || firebaseUser.displayName || "",
          email: firebaseUser.email ?? email,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      )

      await signOut(auth)
      setSuccessMessage("Akun berhasil dibuat. Silakan masuk dengan akun Anda.")
      window.setTimeout(() => {
        router.replace("/login?registered=1")
      }, 900)
    } catch (err) {
      setError(getErrorCopy(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Daftar</CardTitle>
          <CardDescription>Buat akun baru untuk mengelola kolam Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nama</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="nama@email.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Kata Sandi</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Minimal 6 karakter"
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <p className="font-semibold">{error.title}</p>
                <p className="text-destructive/90">{error.message}</p>
              </div>
            )}
            {successMessage && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                <p className="font-semibold">Berhasil</p>
                <p>{successMessage}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || Boolean(successMessage)}
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
            >
              {successMessage ? "Mengalihkan..." : submitting ? "Memproses..." : "Daftar"}
            </button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline">Masuk sekarang</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
