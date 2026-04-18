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

    const { uid, pondId, ph, turbidity, temperature, waterLevel } = body;

    if (!uid || !pondId) {
      return Response.json({ error: "uid dan pondId wajib" }, { status: 400 });
    }

    const ref = collection(db, "users", uid, "ponds", pondId, "sensors");

    await addDoc(ref, {
      ph,
      turbidity,
      temperature,
      waterLevel,
      createdAt: serverTimestamp(),
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to save data" }, { status: 500 });
  }
}

