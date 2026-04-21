import { db } from "@/lib/db/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, type, data, pondId } = body;

    if (!uid) {
      return Response.json({ error: "UID wajib diberikan" }, { status: 400 });
    }

    if (type === "global") {
      // Update global settings
      const globalRef = doc(db, "users", uid, "settings", "config");
      await setDoc(globalRef, data, { merge: true });
    } else if (type === "pond") {
      // Update pond-specific settings
      if (!pondId) {
        return Response.json({ error: "PondId wajib diberikan untuk pengaturan kolam" }, { status: 400 });
      }
      const pondRef = doc(db, "users", uid, "ponds", pondId);
      await updateDoc(pondRef, data);
    } else {
      return Response.json({ error: "Tipe pengaturan tidak valid" }, { status: 400 });
    }

    return Response.json({ success: true, message: "Pengaturan berhasil diperbarui" });
  } catch (error: any) {
    return Response.json({ error: error.message || "Gagal memperbarui pengaturan" }, { status: 500 });
  }
}
