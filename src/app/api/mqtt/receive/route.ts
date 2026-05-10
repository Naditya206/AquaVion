import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/firebase"
import { collection, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { BigQuery } from "@google-cloud/bigquery"

// Initialize BigQuery client using environment variables
const bqClient = process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY
  ? new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        // Replace escaped newlines with actual newlines
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    })
  : null;
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { device_id, temperature, ph, turbidity, waterLevel: sensorDistance, userId, ssid } = body
    
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

    console.log(`Incoming request for User: ${ownerId}, Device: ${device_id}`);

    // Find pond with this device_id
    const pondsRef = collection(db, "users", ownerId, "ponds")
    const pondsSnapshot = await getDocs(pondsRef)
    
    console.log(`Found ${pondsSnapshot.size} ponds for this user`);

    for (const pondDoc of pondsSnapshot.docs) {
      const data = pondDoc.data();
      console.log(`Checking pond ${pondDoc.id} with device_id: "${data.device_id}"`);
      if (data.device_id?.trim() === device_id.trim()) {
        pondId = pondDoc.id
        break
      }
    }

    if (!pondId) {
      return NextResponse.json({ 
        error: `No pond found with device_id: ${device_id}` 
      }, { status: 404 })
    }

    // Get pond thresholds and dimensions
    const pondDoc = await getDoc(doc(db, "users", ownerId, "ponds", pondId))
    const pondData = pondDoc.data()
    const thresholds = pondData?.thresholds || {}
    
    // Hitung Tinggi Air Aktual & Volume Air
    const pondDepth = pondData?.depth || 100 // Default 100 cm jika belum diset
    const pondSize = pondData?.size || 0     // Default 0 m2
    
    // Jarak sensor ke air dikurangkan dari tinggi total kolam
    let actualWaterLevel = null
    let waterVolume = null
    
    if (sensorDistance != null) {
      actualWaterLevel = Math.max(0, pondDepth - sensorDistance) // Cegah nilai minus
      waterVolume = actualWaterLevel * pondSize * 10 // (cm * m2 * 10 = Liter)
    }

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

    // Check water level (menggunakan actualWaterLevel)
    if (actualWaterLevel != null) {
      const waterLevelMin = thresholds.waterLevelMin || 40
      const waterLevelMax = thresholds.waterLevelMax || 70
      if (actualWaterLevel < waterLevelMin) {
        actions.push(`Tinggi Air Terlalu Rendah (${actualWaterLevel.toFixed(1)} cm) → Tambah air kolam`)
      } else if (actualWaterLevel > waterLevelMax) {
        actions.push(`Tinggi Air Terlalu Tinggi (${actualWaterLevel.toFixed(1)} cm) → Kurangi air kolam`)
      }
    }

    // Save sensor data to Firestore
    const sensorRef = doc(collection(db, "users", ownerId, "ponds", pondId, "sensors"))
    await setDoc(sensorRef, {
      temperature: temperature || null,
      ph: ph || null,
      turbidity: turbidity || null,
      waterLevel: actualWaterLevel, // Simpan hasil konversi
      water_level: actualWaterLevel, // Alias for compatibility
      rawDistance: sensorDistance || null, // Simpan jarak asli sensor
      waterVolume: waterVolume,
      actions,
      device_id,
      ssid: ssid || null,
      createdAt: serverTimestamp(),
    })

    // Update the pond document with the latest SSID to show on dashboard
    if (ssid) {
      await setDoc(doc(db, "users", ownerId, "ponds", pondId), {
        last_ssid: ssid,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // [RENCANA B] Sync data to BigQuery if configured
    if (bqClient) {
      try {
        const datasetId = 'aquavion_data';
        const tableId = 'sensor_logs';
        const row = {
          user_id: ownerId,
          pond_id: pondId,
          device_id: device_id,
          temperature: temperature || null,
          ph: ph || null,
          turbidity: turbidity || null,
          water_level: actualWaterLevel,
          water_volume: waterVolume,
          actions: actions.join(', ') || null,
          created_at: BigQuery.timestamp(new Date())
        };
        
        await bqClient.dataset(datasetId).table(tableId).insert([row]);
        console.log(`Berhasil sinkronisasi data dari ${device_id} ke BigQuery!`);
      } catch (bqError: any) {
        console.error("Gagal sinkronisasi ke BigQuery:", bqError?.response?.insertErrors || bqError);
        // Kita tidak nge-throw error di sini agar Firestore tetap aman
      }
    }

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
          sensorData: { temperature, ph, turbidity, waterLevel: actualWaterLevel, waterVolume }
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
