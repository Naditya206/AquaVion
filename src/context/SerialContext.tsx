"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"

export type SensorData = {
  temperature: number | null
  ph: number | null
  waterLevel: number | null
  turbidity: number | null
  raw: string
}

type SerialContextType = {
  isConnected: boolean
  data: SensorData
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  setSyncPond: (config: { pondId: string, userId: string, deviceId: string } | null) => void
}

const SerialContext = createContext<SerialContextType | undefined>(undefined)

export function SerialProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<SensorData>({
    temperature: null,
    ph: null,
    waterLevel: null,
    turbidity: null,
    raw: ""
  })
  const [error, setError] = useState<string | null>(null)
  const [syncConfig, setSyncConfig] = useState<{ pondId: string, userId: string, deviceId: string } | null>(null)
  
  const portRef = useRef<any>(null)
  const readerRef = useRef<any>(null)
  const keepReadingRef = useRef(true)
  const lastSyncTimeRef = useRef(0)

  const parseSensorData = (text: string): Partial<SensorData> => {
    const results: Partial<SensorData> = {}
    const tempMatch = text.match(/Suhu:\s*(-?[\d.]+)/i)
    const phMatch = text.match(/pH:\s*([\d.]+)/i)
    const distanceMatch = text.match(/Jarak:\s*([\d.]+)/i)
    const turbidityMatch = text.match(/Turbidity:\s*(\d+)/i)

    if (tempMatch) results.temperature = parseFloat(tempMatch[1])
    if (phMatch) results.ph = parseFloat(phMatch[1])
    if (distanceMatch) results.waterLevel = parseFloat(distanceMatch[1])
    if (turbidityMatch) results.turbidity = parseInt(turbidityMatch[1])
    
    return results
  }

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false
    
    if (readerRef.current) {
      try {
        await readerRef.current.cancel()
      } catch (e) {}
      readerRef.current = null
    }

    if (portRef.current) {
      try {
        await portRef.current.close()
      } catch (e) {}
      portRef.current = null
    }

    setIsConnected(false)
  }, [])

  const syncToApi = useCallback(async (sensorData: Partial<SensorData>) => {
    if (!syncConfig) return
    
    // Throttle sync to once every 10 seconds to avoid overloading
    const now = Date.now()
    if (now - lastSyncTimeRef.current < 10000) return
    lastSyncTimeRef.current = now

    try {
      await fetch("/api/mqtt/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: syncConfig.userId,
          device_id: syncConfig.deviceId,
          temperature: sensorData.temperature,
          ph: sensorData.ph,
          turbidity: sensorData.turbidity,
          waterLevel: sensorData.waterLevel
        })
      })
      console.log("Successfully bridged USB data to API for device:", syncConfig.deviceId)
    } catch (err) {
      console.error("Failed to bridge USB data:", err)
    }
  }, [syncConfig])

  const connect = useCallback(async () => {
    try {
      if (!("serial" in navigator)) {
        throw new Error("Browser ini tidak mendukung Web Serial API. Gunakan Chrome atau Edge.")
      }

      if (isConnected && portRef.current) return

      const port = await (navigator as any).serial.requestPort()
      
      if (port.readable) {
         // Port is already readable/open
      } else {
        await port.open({ baudRate: 115200 })
      }

      portRef.current = port
      setIsConnected(true)
      setError(null)
      keepReadingRef.current = true

      const readLoop = async () => {
        let buffer = ""
        while (portRef.current && keepReadingRef.current) {
          try {
            const textDecoder = new TextDecoderStream()
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable)
            const reader = textDecoder.readable.getReader()
            readerRef.current = reader

            try {
              while (keepReadingRef.current) {
                const { value, done } = await reader.read()
                if (done) break
                
                buffer += value
                if (buffer.includes("\n")) {
                  const lines = buffer.split("\n")
                  const lastCompleteLine = lines[lines.length - 2]
                  buffer = lines[lines.length - 1]

                  if (lastCompleteLine.trim()) {
                    const parsed = parseSensorData(lastCompleteLine)
                    setData(prev => ({ ...prev, ...parsed, raw: lastCompleteLine }))
                    
                    // Trigger Sync to API if we have any data
                    if (parsed.temperature !== undefined || parsed.ph !== undefined) {
                       syncToApi(parsed)
                    }
                  }
                }
              }
            } finally {
              reader.releaseLock()
            }
          } catch (err) {
            console.error("Read error:", err)
            break
          }
        }
      }

      readLoop()
    } catch (err: any) {
      console.error("Serial error:", err)
      if (err.message?.includes("already open")) {
          setIsConnected(true)
          setError(null)
          return
      }
      setError(err.message || "Gagal terhubung ke port serial")
      setIsConnected(false)
    }
  }, [isConnected, syncToApi])

  useEffect(() => {
    return () => {
      keepReadingRef.current = false
    }
  }, [])

  return (
    <SerialContext.Provider value={{ isConnected, data, error, connect, disconnect, setSyncPond: setSyncConfig }}>
      {children}
    </SerialContext.Provider>
  )
}

export function useSerial() {
  const context = useContext(SerialContext)
  if (context === undefined) {
    throw new Error("useSerial must be used within a SerialProvider")
  }
  return context
}
