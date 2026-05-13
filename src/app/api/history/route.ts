import { adminAuth, adminDb } from "@/lib/db/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const pondId = searchParams.get("pondId");
    const period = searchParams.get("period") || "today"; // today, 7d, 30d, custom
    let startDate = searchParams.get("startDate");
    let endDate = searchParams.get("endDate");

    if (!uid || !pondId) {
      console.warn("[GET /api/history] Missing uid or pondId");
      return Response.json({ error: "uid dan pondId wajib diberikan" }, { status: 400 });
    }

    console.log(`[GET /api/history] Fetching history for uid=${uid}, pondId=${pondId}, period=${period}`);

    // Auth verification
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      console.warn("[GET /api/history] Missing authorization token");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const decoded = await adminAuth.verifyIdToken(token);
      if (decoded.uid !== uid) {
        console.warn(`[GET /api/history] Token uid mismatch: ${decoded.uid} vs ${uid}`);
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch (authErr: any) {
      console.error("[GET /api/history] Token verification failed:", authErr.message);
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    // Calculate date range
    const now = new Date();
    let startLimit: Date;
    let endLimit: Date = now;

    if (period === "today") {
      startLimit = new Date();
      startLimit.setHours(0, 0, 0, 0);
    } else if (period === "7d") {
      startLimit = new Date();
      startLimit.setDate(now.getDate() - 7);
    } else if (period === "30d") {
      startLimit = new Date();
      startLimit.setDate(now.getDate() - 30);
    } else if (period === "custom" && startDate && endDate) {
      startLimit = new Date(startDate);
      endLimit = new Date(endDate);
      endLimit.setHours(23, 59, 59, 999);
    } else {
      startLimit = new Date();
      startLimit.setHours(0, 0, 0, 0); // fallback today
    }

    console.log(`[GET /api/history] Date range: ${startLimit.toISOString()} to ${endLimit.toISOString()}`);

    // Query Firestore
    const sensorsRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("ponds")
      .doc(pondId)
      .collection("sensors");
    
    const q = sensorsRef
      .where("createdAt", ">=", Timestamp.fromDate(startLimit))
      .where("createdAt", "<=", Timestamp.fromDate(endLimit))
      .orderBy("createdAt", "desc");

    const snapshot = await q.get();
    console.log(`[GET /api/history] Found ${snapshot.size} documents`);

    // Format response data
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      const rawDate = docData.createdAt || docData.created_at;
      let timestamp = "";
      if (rawDate && rawDate.toDate) {
        timestamp = rawDate.toDate().toISOString();
      } else if (typeof rawDate === "string") {
        timestamp = rawDate;
      }
      
      return {
        id: doc.id,
        suhu: docData.temperature ?? 0,
        ph_air: docData.ph ?? 0,
        kekeruhan: docData.turbidity ?? 0,
        tinggi_air: docData.waterLevel ?? 0,
        timestamp,
        actions: docData.actions || []
      };
    });

    // Calculate summary and status
    let sumSuhu = 0, sumPh = 0;
    let minSuhu = Infinity, maxSuhu = -Infinity;
    let minPh = Infinity, maxPh = -Infinity;

    const formattedData = data.map(item => {
      // Logic for status
      const isWarning = item.suhu < 25 || item.suhu > 30 || item.ph_air < 6.5 || item.ph_air > 8.5 || item.kekeruhan > 400 || item.tinggi_air < 40 || item.tinggi_air > 70;
      const status = isWarning ? "Butuh Tindakan" : "Aman";

      sumSuhu += item.suhu;
      sumPh += item.ph_air;
      if (item.suhu < minSuhu) minSuhu = item.suhu;
      if (item.suhu > maxSuhu) maxSuhu = item.suhu;
      if (item.ph_air < minPh) minPh = item.ph_air;
      if (item.ph_air > maxPh) maxPh = item.ph_air;

      return {
        ...item,
        status
      }
    });

    const summary = {
      avgSuhu: data.length ? parseFloat((sumSuhu / data.length).toFixed(1)) : 0,
      avgPh: data.length ? parseFloat((sumPh / data.length).toFixed(1)) : 0,
      minSuhu: minSuhu !== Infinity ? minSuhu : null,
      maxSuhu: maxSuhu !== -Infinity ? maxSuhu : null,
      minPh: minPh !== Infinity ? minPh : null,
      maxPh: maxPh !== -Infinity ? maxPh : null,
      totalData: data.length
    }

    console.log(`[GET /api/history] ✅ Query successful, returning ${data.length} records`);
    return Response.json({ data: formattedData, summary });
  } catch (error: any) {
    console.error("[GET /api/history] ❌ Error:", error.message, error.code);
    
    // Check if it's a Firestore composite index error
    if (error.code === 9 || error.message?.includes("FAILED_PRECONDITION")) {
      console.error("[GET /api/history] 🔨 Composite index needed. Build it in Firebase Console.");
      return Response.json({ 
        error: "Firestore index tidak tersedia. Silakan tunggu atau buat index di Firebase Console.",
        code: "INDEX_REQUIRED"
      }, { status: 503 });
    }
    
    return Response.json({ 
      error: error.message || "Gagal mengambil data history",
      code: error.code
    }, { status: 500 });
  }
}
      const isWarning = item.suhu < 25 || item.suhu > 30 || item.ph_air < 6.5 || item.ph_air > 8.5 || item.kekeruhan > 400 || item.tinggi_air < 40 || item.tinggi_air > 70;
      const status = isWarning ? "Butuh Tindakan" : "Aman";

      sumSuhu += item.suhu;
      sumPh += item.ph_air;
      if (item.suhu < minSuhu) minSuhu = item.suhu;
      if (item.suhu > maxSuhu) maxSuhu = item.suhu;
      if (item.ph_air < minPh) minPh = item.ph_air;
      if (item.ph_air > maxPh) maxPh = item.ph_air;

      return {
        ...item,
        status
      }
    });

    const summary = {
      avgSuhu: data.length ? (sumSuhu / data.length).toFixed(1) : 0,
      avgPh: data.length ? (sumPh / data.length).toFixed(1) : 0,
      minSuhu: minSuhu !== Infinity ? minSuhu : null,
      maxSuhu: maxSuhu !== -Infinity ? maxSuhu : null,
      minPh: minPh !== Infinity ? minPh : null,
      maxPh: maxPh !== -Infinity ? maxPh : null,
      totalData: data.length
    }

    return Response.json({ data: formattedData, summary });
  } catch (error: any) {
    // If the index is missing, Firestore usually throws an error with a URL to build it.
    // If that happens, fallback to fetching all and mapping.
    return Response.json({ error: error.message || "Gagal mengambil data history" }, { status: 500 });
  }
}
