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
  const { user, loading, signInWithGoogle } = useAuth()
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

  const handleGoogleSignIn = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await signInWithGoogle()
      router.replace(redirectTo)
    } catch (err) {
      setError({
        title: "Gagal masuk dengan Google",
        message: "Terjadi kendala saat masuk dengan Google. Coba lagi.",
      })
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
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Atau</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Masuk dengan Google
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
