import { db } from "@/lib/db/firebase";
import { collection, getDocs } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return Response.json({ error: "UID wajib diberikan. (Contoh: /api/simulate?uid=xyz)" }, { status: 400 });
    }

    // Ambil maksimal 3 daftar kolam milik user
    const pondsRef = collection(db, "users", uid, "ponds");
    const pondsSnap = await getDocs(pondsRef);
    
    if (pondsSnap.empty) {
      return Response.json({ error: "Anda belum memiliki kolam. Buat kolam terlebih dahulu di dashboard." }, { status: 404 });
    }

    const ponds = pondsSnap.docs.map(doc => doc.id).slice(0, 3);
    const origin = new URL(req.url).origin;
    
    // Skenario 1: Parameter Normal (Aman)
    // Skenario 2: Suhu Dingin & pH Asam (Bahaya)
    // Skenario 3: Kekeruhan Tinggi & Banjir (Bahaya)
    
    const scenarios = [
      { temp: 27.5, ph: 7.2, waterLevel: 55, turbidity: 100 }, // Normal
      { temp: 22.0, ph: 5.5, waterLevel: 45, turbidity: 250 }, // Dingin, Asam
      { temp: 28.0, ph: 8.0, waterLevel: 85, turbidity: 600 }  // Banjir, Kotor
    ];

    const results = [];
    
    for (let i = 0; i < ponds.length; i++) {
        const pondId = ponds[i];
        const scenario = scenarios[i % scenarios.length];
        
        // Memukul API asli IoT kita secara internal
        const response = await fetch(`${origin}/api/sensor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uid: uid,
                pond_id: pondId,
                suhu: scenario.temp,
                ph_air: scenario.ph,
                tinggi_air: scenario.waterLevel,
                kekeruhan: scenario.turbidity
            })
        });
        const data = await response.json();
        results.push({ pondId, dikirim: scenario, respons: data });
    }

    return Response.json({ 
        message: "Simulasi berhasil dieksekusi!", 
        banyak_kolam: ponds.length,
        results 
    });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
