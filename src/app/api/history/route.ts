import { db } from "@/lib/db/firebase";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const pondId = searchParams.get("pondId");
    const period = searchParams.get("period") || "today"; // today, 7d, 30d, custom
    let startDate = searchParams.get("startDate");
    let endDate = searchParams.get("endDate");

    if (!uid || !pondId) {
      return Response.json({ error: "uid dan pondId wajib diberikan" }, { status: 400 });
    }

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

    const sensorsRef = collection(db, "users", uid, "ponds", pondId, "sensors");
    
    // Note: Due to Firestore composite index limits, if we haven't created an index, 
    // we might need to filter the date manually if orderBy createdAt and where createdAt > startLimit fails.
    // Assuming standard query or we can fetch last 1000 and filter in memory.
    // For safety without building composite index immediately, fetch all from a limit or just no-filter and memory filter.
    // Let's use simple where query assuming default indexing works for single inequalities.

    const q = query(
      sensorsRef,
      where("createdAt", ">=", Timestamp.fromDate(startLimit)),
      where("createdAt", "<=", Timestamp.fromDate(endLimit)),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

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

    // Generate Status and calculate summary
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
