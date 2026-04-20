import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/db/firebase"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, name, image } = session.user

    // Sync user to Firestore
    await setDoc(
      doc(db, "users", session.user.id!),
      {
        name: name || "",
        email: email || "",
        photoURL: image || "",
        role: "user",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
  }
}
