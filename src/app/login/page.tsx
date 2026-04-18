"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/db/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const rawNext = searchParams.get("next")
  const redirectTo = rawNext?.startsWith("/") ? rawNext : "/dashboard"
  const registered = searchParams.get("registered")

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo)
    }
  }, [loading, redirectTo, router, user])

  useEffect(() => {
    if (registered === "1") {
      setSuccessMessage("Akun berhasil dibuat. Silakan masuk untuk melanjutkan.")
    }
  }, [registered])

  const getErrorCopy = (err: unknown) => {
    const code = typeof err === "object" && err !== null && "code" in err
      ? String((err as { code?: string }).code)
      : ""

    switch (code) {
      case "auth/user-not-found":
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return {
          title: "Email atau kata sandi salah",
          message: "Cek kembali email dan kata sandi yang kamu masukkan.",
        }
      case "auth/invalid-email":
        return {
          title: "Format email tidak valid",
          message: "Pastikan email yang kamu masukkan benar.",
        }
      case "auth/too-many-requests":
        return {
          title: "Terlalu banyak percobaan",
          message: "Coba lagi beberapa saat lagi.",
        }
      default:
        return {
          title: "Gagal masuk",
          message: "Terjadi kendala saat masuk. Coba lagi nanti.",
        }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.replace(redirectTo)
    } catch (err) {
      setError(getErrorCopy(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Masuk</CardTitle>
        <CardDescription>Gunakan email dan kata sandi terdaftar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            disabled={submitting}
            className={cn(buttonVariants({ variant: "default" }), "w-full")}
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary hover:underline">Daftar sekarang</Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-muted-foreground animate-pulse text-sm">Menyiapkan form masuk...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
