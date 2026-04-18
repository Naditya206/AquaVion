import { db } from "@/lib/db/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const pondId = searchParams.get("pondId");

    if (!uid) {
      return Response.json({ error: "UID wajib diberikan" }, { status: 400 });
    }

    let result: any = {
      global: null,
      pond: null,
    };

    // Get global settings (Telegram config, global toggles)
    const globalRef = doc(db, "users", uid, "settings", "config");
    const globalSnap = await getDoc(globalRef);
    if (globalSnap.exists()) {
      result.global = globalSnap.data();
    } else {
      result.global = {
        webPushEnabled: true,
        telegramEnabled: false,
        botToken: "",
        chatId: "",
      };
    }

    // Get pond-specific settings if pondId is provided
    if (pondId) {
      const pondRef = doc(db, "users", uid, "ponds", pondId);
      const pondSnap = await getDoc(pondRef);
      if (pondSnap.exists()) {
        const data = pondSnap.data();
        result.pond = {
          batas_min_ph: data.batas_min_ph ?? 6.5,
          batas_max_ph: data.batas_max_ph ?? 8.5,
          batas_min_suhu: data.batas_min_suhu ?? 25,
          batas_max_suhu: data.batas_max_suhu ?? 30,
          batas_min_air: data.batas_min_air ?? 40,
          batas_max_air: data.batas_max_air ?? 70,
        };
      }
    }

    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message || "Gagal mengambil pengaturan" }, { status: 500 });
  }
}
