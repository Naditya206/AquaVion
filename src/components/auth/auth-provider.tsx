"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, type User } from "firebase/auth"
import { auth } from "@/lib/db/firebase"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/db/firebase"

type AuthContextValue = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const AUTH_COOKIE = "av_uid"

function setAuthCookie(uid: string | null) {
  const base = `${AUTH_COOKIE}=${uid ? encodeURIComponent(uid) : ""}; Path=/; SameSite=Lax;`
  if (!uid) {
    document.cookie = `${base} Max-Age=0;`
    return
  }

  const maxAge = 60 * 60 * 24 * 7
  const secure = window.location.protocol === "https:" ? " Secure;" : ""
  document.cookie = `${base} Max-Age=${maxAge};${secure}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthCookie(currentUser?.uid ?? null)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    setAuthCookie(null)
    setUser(null)
    await signOut(auth)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const firebaseUser = result.user

    // Sync user data to Firestore
    await setDoc(
      doc(db, "users", firebaseUser.uid),
      {
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "",
        role: "user",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  const value = useMemo(() => ({ user, loading, logout, signInWithGoogle }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
