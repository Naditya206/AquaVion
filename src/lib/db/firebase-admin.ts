import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const parseServiceAccount = (value: string) => {
  const trimmed = value.trim();

  // Support base64-encoded JSON to avoid newline issues in env files.
  if (!trimmed.startsWith("{")) {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    return JSON.parse(decoded);
  }

  try {
    return JSON.parse(trimmed.replace(/\\n/g, "\n"));
  } catch {
    // Handle raw newlines inside the JSON string (invalid JSON as-is).
    const repaired = trimmed.replace(/\n/g, "\\n");
    return JSON.parse(repaired);
  }
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp(
      serviceAccountJson
        ? {
            credential: cert(parseServiceAccount(serviceAccountJson)),
          }
        : undefined
    );

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth, adminDb };
