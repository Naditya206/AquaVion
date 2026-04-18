import { db } from "@/lib/db/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { uid, subscription } = await req.json();

    if (!uid || !subscription) {
      return Response.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Simpan token Push Subscription ke Firestore
    const subRef = doc(db, "users", uid, "settings", "push_subs");
    await setDoc(subRef, {
      subscription,
      updatedAt: new Date().toISOString()
    });

    return Response.json({ status: "success", message: "Push Subscription berhasil disimpan." });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
