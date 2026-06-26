import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/db/firebase-admin";
import { writeToHDFS, isHadoopOnline } from "@/lib/bigdata/hdfs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pondId } = body;

    if (!userId || !pondId) {
      return NextResponse.json(
        { error: "Parameter 'userId' dan 'pondId' wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Cek apakah integrasi Hadoop diaktifkan
    if (process.env.ENABLE_HADOOP !== "true") {
      return NextResponse.json(
        { error: "Integrasi Hadoop dinonaktifkan di server (ENABLE_HADOOP=false)." },
        { status: 403 }
      );
    }

    // 2. Cek apakah klaster Hadoop online
    const hadoopOnline = await isHadoopOnline();
    if (!hadoopOnline) {
      return NextResponse.json(
        { 
          error: "Klaster Hadoop sedang offline atau WebHDFS tidak dapat dijangkau.",
          hdfsUrl: process.env.HADOOP_WEBHDFS_URL
        },
        { status: 503 }
      );
    }

    // 3. Ambil data historik dari Firestore
    const sensorsRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("ponds")
      .doc(pondId)
      .collection("sensors")
      .orderBy("createdAt", "desc");

    const snapshot = await sensorsRef.get();

    if (snapshot.empty) {
      return NextResponse.json(
        { message: "Tidak ada data sensor di Firestore untuk disinkronkan.", count: 0 },
        { status: 200 }
      );
    }

    // 4. Format data ke bentuk JSON Lines (JSONL) - format standar untuk big data processing
    const telemetryRecords = snapshot.docs.map(doc => {
      const data = doc.data();
      const rawDate = data.createdAt;
      let timestamp = new Date().toISOString();

      if (rawDate && typeof rawDate.toDate === "function") {
        timestamp = rawDate.toDate().toISOString();
      } else if (rawDate && rawDate.seconds) {
        timestamp = new Date(rawDate.seconds * 1000).toISOString();
      } else if (typeof rawDate === "string") {
        timestamp = new Date(rawDate).toISOString();
      }

      return JSON.stringify({
        id: doc.id,
        timestamp,
        temperature: data.temperature ?? null,
        ph: data.ph ?? null,
        turbidity: data.turbidity ?? null,
        waterLevel: data.waterLevel ?? data.water_level ?? null,
        waterVolume: data.waterVolume ?? null,
        device_id: data.device_id ?? null,
        ssid: data.ssid ?? null,
        actions: data.actions || []
      });
    });

    const fileContent = telemetryRecords.join("\n") + "\n";
    const hdfsPath = `/aquavion/ponds/${pondId}/historical_telemetry.jsonl`;

    // 5. Tulis file ke HDFS (Overwrites existing file)
    const success = await writeToHDFS(hdfsPath, fileContent);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Data historik berhasil disinkronkan ke Hadoop HDFS.",
        count: telemetryRecords.length,
        hdfsPath,
        hdfsConsoleUrl: `http://localhost:9870/explorer.html#${hdfsPath.substring(0, hdfsPath.lastIndexOf("/"))}`
      });
    } else {
      return NextResponse.json(
        { error: "Gagal menulis file ke Hadoop HDFS." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Bulk Sync HDFS Error:", error);
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan internal server.",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
