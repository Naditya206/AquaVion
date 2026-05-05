"use client"

import { useSerial } from "@/context/SerialContext"

export type { SensorData } from "@/context/SerialContext"

/**
 * Hook wrapper around SerialContext to provide the same API as before
 * but backed by a global provider to solve "already open" errors.
 */
export function useWebSerial() {
  return useSerial()
}
