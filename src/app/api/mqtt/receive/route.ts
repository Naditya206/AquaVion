import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/firebase"
import { collection, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { device_id, temperature, ph, turbidity, waterLevel, userId } = body
    
    if (!device_id) {
      return NextResponse.json({ error: "device_id is required" }, { status: 400 })
    }

    // Find pond by device_id
    let pondId = null
    let ownerId = userId // If userId provided, use it

    if (!ownerId) {
      // Search all users for this device_id (not efficient, better to pass userId)
      return NextResponse.json({ 
        error: "userId is required. Please include userId in the payload." 
      }, { status: 400 })
    }

    // Find pond with this device_id
    const pondsRef = collection(db, "users", ownerId, "ponds")
    const pondsSnapshot = await getDocs(pondsRef)
    
    for (const pondDoc of pondsSnapshot.docs) {
      if (pondDoc.data().device_id === device_id) {
        pondId = pondDoc.id
        break
      }
    }

    if (!pondId) {
      return NextResponse.json({ 
        error: `No pond found with device_id: ${device_id}` 
      }, { status: 404 })
    }

    // Get pond thresholds
    const pondDoc = await getDoc(doc(db, "users", ownerId, "ponds", pondId))
    const pondData = pondDoc.data()
    const thresholds = pondData?.thresholds || {}

    // Analyze sensor data and generate actions
    const actions: string[] = []
    
    // Check temperature
    if (temperature != null) {
      const tempMin = thresholds.tempMin || 25
      const tempMax = thresholds.tempMax || 30
      if (temperature < tempMin) {
        actions.push(`Suhu Terlalu Dingin (${temperature}°C) → Tutup kolam atau gunakan pemanas`)
      } else if (temperature > tempMax) {
        actions.push(`Suhu Terlalu Panas (${temperature}°C) → Buka kolam atau tambah aerasi`)
      }
    }

    // Check pH
    if (ph != null) {
      const phMin = thresholds.phMin || 6.5
      const phMax = thresholds.phMax || 8.5
      if (ph < phMin) {
        actions.push(`pH Terlalu Asam (${ph}) → Tambahkan kapur pertanian`)
      } else if (ph > phMax) {
        actions.push(`pH Terlalu Basa (${ph}) → Ganti sebagian air kolam`)
      }
    }

    // Check turbidity
    if (turbidity != null) {
      const turbidityMax = thresholds.turbidityMax || 400
      if (turbidity > turbidityMax) {
        actions.push(`Air Terlalu Keruh (${turbidity} NTU) → Kurangi pakan atau ganti air`)
      }
    }

    // Check water level
    if (waterLevel != null) {
      const waterLevelMin = thresholds.waterLevelMin || 40
      const waterLevelMax = thresholds.waterLevelMax || 70
      if (waterLevel < waterLevelMin) {
        actions.push(`Tinggi Air Terlalu Rendah (${waterLevel} cm) → Tambah air kolam`)
      } else if (waterLevel > waterLevelMax) {
        actions.push(`Tinggi Air Terlalu Tinggi (${waterLevel} cm) → Kurangi air kolam`)
      }
    }

    // Save sensor data to Firestore
    const sensorRef = doc(collection(db, "users", ownerId, "ponds", pondId, "sensors"))
    await setDoc(sensorRef, {
      temperature: temperature || null,
      ph: ph || null,
      turbidity: turbidity || null,
      waterLevel: waterLevel || null,
      water_level: waterLevel || null, // Alias for compatibility
      actions,
      device_id,
      createdAt: serverTimestamp(),
    })

    // If there are critical actions, trigger notification
    if (actions.length > 0) {
      // Trigger Telegram notification (async, don't wait)
      fetch(`${request.nextUrl.origin}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: ownerId,
          pondId,
          pondName: pondData?.name || "Kolam",
          actions,
          sensorData: { temperature, ph, turbidity, waterLevel }
        })
      }).catch(err => console.error("Failed to send notification:", err))
    }

    return NextResponse.json({ 
      success: true, 
      message: "Sensor data received and saved",
      pondId,
      actionsCount: actions.length,
      actions
    })

  } catch (error) {
    console.error("Error processing MQTT data:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Import getDocs
import { getDocs } from "firebase/firestore"
