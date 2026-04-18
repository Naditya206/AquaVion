import { db } from "@/lib/db/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { pondId, ph, turbidity, temperature, waterLevel } = body;

    await addDoc(collection(db, "ponds", pondId, "sensors"), {
      ph,
      turbidity,
      temperature,
      waterLevel,
      createdAt: serverTimestamp(),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to save data" }, { status: 500 });
  }
}