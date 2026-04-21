import { auth } from "@/lib/db/firebase";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, current_password, new_password } = body;

    if (!email || !current_password || !new_password) {
      return Response.json({ error: "Email, password lama, dan password baru wajib diisi" }, { status: 400 });
    }

    if (new_password.length < 8) {
      return Response.json({ error: "Password baru harus minimal 8 karakter" }, { status: 400 });
    }

    // Authenticate the user to verify the current password
    const userCredential = await signInWithEmailAndPassword(auth, email, current_password);
    const user = userCredential.user;

    // Change the password
    await updatePassword(user, new_password);

    return Response.json({ success: true, message: "Password berhasil diubah" });
  } catch (error: any) {
    let errorMessage = "Gagal mengubah password";
    
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      errorMessage = "Password saat ini salah";
    }

    return Response.json({ error: errorMessage, details: error.message }, { status: 400 });
  }
}
