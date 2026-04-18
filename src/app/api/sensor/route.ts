import { db } from "@/lib/db/firebase";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

function parseFirestoreDate(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && value !== null && "toDate" in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    const date = maybeTimestamp.toDate?.();
    return date ? date.toISOString() : null;
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const pondId = searchParams.get("pondId");
    const limitParam = Number(searchParams.get("limit") ?? "24");

    if (!uid || !pondId) {
      return Response.json({ error: "uid dan pondId wajib" }, { status: 400 });
    }

    const safeLimit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 200)
      : 24;

    const ref = collection(db, "users", uid, "ponds", pondId, "sensors");
    const snapshot = await getDocs(ref);

    const sensors = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        const createdAt = parseFirestoreDate(data.createdAt) ?? parseFirestoreDate(data.created_at);

        return {
          id: docSnap.id,
          ph: data.ph ?? null,
          turbidity: data.turbidity ?? null,
          temperature: data.temperature ?? null,
          waterLevel: data.waterLevel ?? null,
          createdAt,
        };
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, safeLimit);

    return Response.json({ sensors });
  } catch {
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Mapping payload dari ESP32 jika berbeda
    const uid = body.uid;
    const pondId = body.pond_id || body.pondId;
    const ph = body.ph_air || body.ph;
    const turbidity = body.kekeruhan || body.turbidity;
    const temperature = body.suhu || body.temperature;
    const waterLevel = body.tinggi_air || body.waterLevel;

    if (!uid || !pondId) {
      return Response.json({ error: "uid dan pond_id wajib" }, { status: 400 });
    }

    const actions = [];
    if (ph !== undefined && ph !== null) {
      if (ph < 6.5) actions.push("Air Terlalu Asam → Taburkan kapur dolomit");
      else if (ph > 8.5) actions.push("Air Terlalu Basa → Gunakan daun ketapang / ganti air 20-30%");
    }
    
    if (temperature !== undefined && temperature !== null) {
      if (temperature < 25) actions.push("Suhu Dingin → Hentikan pakan & tutup kolam");
      else if (temperature > 30) actions.push("Suhu Panas → Tambahkan peneduh & air segar");
    }
    
    if (waterLevel !== undefined && waterLevel !== null) {
      if (waterLevel < 40) actions.push("Air Terlalu Rendah → Isi bertahap & cek kebocoran");
      else if (waterLevel > 70) actions.push("Air Terlalu Tinggi → Buang air & pasang jaring");
    }
    
    if (turbidity !== undefined && turbidity !== null) {
      if (turbidity > 400) actions.push("Air Kotor → Siphon / drainase / probiotik");
    }

    const ref = collection(db, "users", uid, "ponds", pondId, "sensors");

    await addDoc(ref, {
      ph,
      turbidity,
      temperature,
      waterLevel,
      actions,
      createdAt: serverTimestamp(),
    });

    if (actions.length > 0) {
      // TODO: Panggil webhook telegram dan push notification
      console.log(`Peringatan Kolam ${pondId}:`, actions);
    }

    return Response.json({ status: "success", message: "Data received", actions });
  } catch (error: any) {
    return Response.json({ status: "error", error: error.message }, { status: 500 });
  }
}

