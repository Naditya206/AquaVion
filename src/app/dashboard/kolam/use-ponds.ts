"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/db/firebase"
import { useAuth } from "@/components/auth/auth-provider"

type Kolam = {
  id: string
  name: string
  location: string
  device_id: string
  size?: number
  fishCount?: number
  depth?: number
  thresholds?: {
    phMin?: number
    phMax?: number
    tempMin?: number
    tempMax?: number
    turbidityMax?: number
    waterLevelMin?: number
    waterLevelMax?: number
  }
  created_at?: string
}

type FormData = {
  name: string
  location: string
  device_id: string
  size?: number
  fishCount?: number
  depth?: number
  thresholds?: {
    phMin?: number
    phMax?: number
    tempMin?: number
    tempMax?: number
    turbidityMax?: number
    waterLevelMin?: number
    waterLevelMax?: number
  }
}

const EMPTY_FORM: FormData = { 
  name: "", 
  location: "", 
  device_id: "",
  thresholds: {}
}

const parseFirestoreDate = (value: unknown): string | undefined => {
  if (!value) return undefined

  if (typeof value === "string") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "object" && value !== null && "toDate" in value) {
    const maybeTimestamp = value as { toDate?: () => Date }
    const date = maybeTimestamp.toDate?.()
    return date ? date.toISOString() : undefined
  }

  return undefined
}

export function usePonds() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [kolamList, setKolamList] = useState<Kolam[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)

  // Removed automatic redirect - let user stay on page
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.replace("/login?next=/dashboard/kolam")
  //   }
  // }, [loading, router, user])

  useEffect(() => {
    if (!user) {
      setKolamList([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const pondsRef = collection(db, "users", user.uid, "ponds")
    const unsubscribe = onSnapshot(
      pondsRef,
      (snapshot) => {
        const ponds = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data()
            const createdAt = parseFirestoreDate(data.createdAt) ?? parseFirestoreDate(data.created_at)

            return {
              id: docSnap.id,
              name: data.name ?? "",
              location: data.location ?? "",
              device_id: data.device_id ?? "",
              created_at: createdAt,
            }
          })
          .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))

        setKolamList(ponds)
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message ?? "Gagal memuat data kolam.")
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (k: Kolam) => {
    setEditingId(k.id)
    setFormData({ 
      name: k.name, 
      location: k.location, 
      device_id: k.device_id,
      size: k.size,
      fishCount: k.fishCount,
      depth: k.depth,
      thresholds: k.thresholds || {}
    })
    setIsAdding(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !user) return
    setIsSaving(true)
    setError(null)

    try {
      const pondData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        device_id: formData.device_id.trim(),
        size: formData.size,
        fishCount: formData.fishCount,
        depth: formData.depth,
        thresholds: formData.thresholds,
      }

      if (editingId) {
        const pondRef = doc(db, "users", user.uid, "ponds", editingId)
        await setDoc(
          pondRef,
          {
            ...pondData,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      } else {
        const pondRef = doc(collection(db, "users", user.uid, "ponds"))
        await setDoc(pondRef, {
          ...pondData,
          createdAt: serverTimestamp(),
        })
      }

      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan kolam."
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    if (!confirm("Apakah Anda yakin ingin menghapus kolam ini?")) return

    try {
      await deleteDoc(doc(db, "users", user.uid, "ponds", id))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus kolam."
      setError(message)
    }
  }

  return {
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
  }
}

export type { Kolam }
