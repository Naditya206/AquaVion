"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/db/firebase"
import { useAuth } from "@/components/auth/auth-provider"

const SELECTED_POND_STORAGE_KEY = "selectedPondId"

type Pond = {
  id: string
  name: string
  location: string
  device_id: string
  created_at?: string
}

type SensorRecord = {
  id: string
  ph?: number
  temperature?: number
  turbidity?: number
  waterLevel?: number
  createdAt?: string
}

type ChartPoint = {
  time: string
  ph?: number
  temp?: number
  turbidity?: number
  waterLevel?: number
}

const formatTime = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date)
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

export function useDashboardData() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [ponds, setPonds] = useState<Pond[]>([])
  const [pondsLoading, setPondsLoading] = useState(true)
  const [pondsError, setPondsError] = useState<string | null>(null)

  const [selectedPondId, setSelectedPondId] = useState("")

  const [sensors, setSensors] = useState<SensorRecord[]>([])
  const [sensorsLoading, setSensorsLoading] = useState(false)
  const [sensorsError, setSensorsError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/dashboard")
    }
  }, [loading, router, user])

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const pondIdFromUrl = params.get("pondId") ?? params.get("kolam") ?? ""
    const pondIdFromStorage =
      window.localStorage.getItem(SELECTED_POND_STORAGE_KEY) ??
      window.sessionStorage.getItem(SELECTED_POND_STORAGE_KEY) ??
      ""

    const initialPondId = pondIdFromUrl || pondIdFromStorage
    if (initialPondId) {
      setSelectedPondId(initialPondId)
      window.localStorage.setItem(SELECTED_POND_STORAGE_KEY, initialPondId)
      window.sessionStorage.setItem(SELECTED_POND_STORAGE_KEY, initialPondId)
    }

    if (pondIdFromUrl && window.location.pathname === "/dashboard") {
      router.replace("/dashboard")
    }
  }, [router])

  useEffect(() => {
    if (!user) {
      setPonds([])
      setPondsLoading(false)
      setPondsError(null)
      return
    }

    setPondsLoading(true)
    const pondsRef = collection(db, "users", user.uid, "ponds")
    const unsubscribe = onSnapshot(
      pondsRef,
      (snapshot) => {
        const pondItems = snapshot.docs
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

        setPonds(pondItems)
        setPondsLoading(false)
        setPondsError(null)
      },
      (err) => {
        setPondsError(err.message ?? "Gagal memuat data kolam.")
        setPondsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (selectedPondId || pondsLoading) return
    if (!ponds.length) return

    const fallbackId = ponds[0]?.id
    if (!fallbackId) return

    setSelectedPondId(fallbackId)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_POND_STORAGE_KEY, fallbackId)
      window.sessionStorage.setItem(SELECTED_POND_STORAGE_KEY, fallbackId)
    }
  }, [ponds, pondsLoading, selectedPondId])

  useEffect(() => {
    if (!user || !selectedPondId) {
      setSensors([])
      setSensorsLoading(false)
      setSensorsError(null)
      return
    }

    setSensorsLoading(true)
    setSensorsError(null)

    const sensorsRef = collection(db, "users", user.uid, "ponds", selectedPondId, "sensors")
    const unsubscribe = onSnapshot(
      sensorsRef,
      (snapshot) => {
        const items = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data()
            const createdAt = parseFirestoreDate(data.createdAt) ?? parseFirestoreDate(data.created_at)

            return {
              id: docSnap.id,
              ph: data.ph ?? null,
              temperature: data.temperature ?? null,
              turbidity: data.turbidity ?? null,
              waterLevel: data.waterLevel ?? data.water_level ?? null,
              createdAt,
            }
          })
          .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
          .slice(0, 24)

        setSensors(items)
        setSensorsLoading(false)
        setSensorsError(null)
      },
      (err) => {
        const message = err.message ?? "Gagal memuat data sensor."
        setSensorsError(message)
        setSensors([])
        setSensorsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [selectedPondId, user])

  const latestSensor = sensors[0]

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!sensors.length) return []

    return [...sensors]
      .filter((item) => item.createdAt)
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
      .map((item) => ({
        time: formatTime(item.createdAt) || "--:--",
        ph: item.ph,
        temp: item.temperature,
        turbidity: item.turbidity,
        waterLevel: item.waterLevel,
      }))
  }, [sensors])

  const handlePondChange = (pondId: string) => {
    setSelectedPondId(pondId)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_POND_STORAGE_KEY, pondId)
      window.sessionStorage.setItem(SELECTED_POND_STORAGE_KEY, pondId)
    }
  }

  return {
    user,
    loading,
    ponds,
    pondsLoading,
    pondsError,
    selectedPondId,
    handlePondChange,
    sensors,
    sensorsLoading,
    sensorsError,
    latestSensor,
    chartData,
  }
}

export type { Pond, SensorRecord, ChartPoint }
