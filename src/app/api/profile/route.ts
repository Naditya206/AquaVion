import { db } from "@/lib/db/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return Response.json({ error: "UID wajib diberikan" }, { status: 400 });
    }

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return Response.json({ profile: docSnap.data() });
    } else {
      return Response.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message || "Gagal mengambil profil" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uid, name, role, photoUrl } = body;

    if (!uid) {
      return Response.json({ error: "UID wajib diberikan" }, { status: 400 });
    }

    const docRef = doc(db, "users", uid);
    
    // Check if doc exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return Response.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    updates.updatedAt = new Date().toISOString();

    await updateDoc(docRef, updates);

    return Response.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error: any) {
    return Response.json({ error: error.message || "Gagal memperbarui profil" }, { status: 500 });
  }
}
