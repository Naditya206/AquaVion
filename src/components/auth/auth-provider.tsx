"use client"

import { createContext, useContext } from "react"
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"

type AuthContextValue = {
  user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null } | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  
  const user = session?.user ? {
    uid: session.user.id!,
    email: session.user.email,
    displayName: session.user.name,
    photoURL: session.user.image,
  } : null

  const loading = status === "loading"

  const logout = async () => {
    await nextAuthSignOut({ callbackUrl: "/login" })
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
