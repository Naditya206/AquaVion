"use client"

import { createContext, useContext } from "react"
import { useSession } from "next-auth/react"

type NextAuthContextValue = {
  user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null } | null
  loading: boolean
}

const NextAuthContext = createContext<NextAuthContextValue | undefined>(undefined)

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  
  const user = session?.user ? {
    uid: session.user.id!,
    email: session.user.email,
    displayName: session.user.name,
    photoURL: session.user.image,
  } : null

  const loading = status === "loading"

  return (
    <NextAuthContext.Provider value={{ user, loading }}>
      {children}
    </NextAuthContext.Provider>
  )
}

export function useNextAuth() {
  const context = useContext(NextAuthContext)
  if (!context) {
    throw new Error("useNextAuth must be used within NextAuthProvider")
  }
  return context
}
