import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Sync user to Firestore on Google sign-in
      if (account?.provider === "google" && user) {
        try {
          const { initializeApp, getApps } = await import("firebase/app")
          const { getFirestore, doc, setDoc, serverTimestamp } = await import("firebase/firestore")
          
          const apps = getApps()
          const app = apps.length > 0 ? apps[0] : initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          })
          
          const db = getFirestore(app)
          
          await setDoc(
            doc(db, "users", user.id!),
            {
              name: user.name || "",
              email: user.email || "",
              photoURL: user.image || "",
              role: "user",
              createdAt: serverTimestamp(),
            },
            { merge: true }
          )
        } catch (error) {
          console.error("Error syncing user to Firestore:", error)
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
})
