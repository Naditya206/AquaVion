import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const parseServiceAccount = (value: string) => {
  const trimmed = value.trim();

  try {
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
  } catch (error) {
    console.error("Firebase Admin Initialization Warning: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.", error);
    return null;
  }
};

const databaseUrlEnv = process.env.FIREBASE_DATABASE_URL;
const databaseUrl = databaseUrlEnv && databaseUrlEnv.trim()
  ? databaseUrlEnv
  : "https://aquavion-26-default-rtdb.asia-southeast1.firebasedatabase.app";

const parsedKey = serviceAccountJson ? parseServiceAccount(serviceAccountJson) : null;

const app = getApps().length
  ? getApps()[0]
  : initializeApp(
      parsedKey
        ? {
            credential: cert(parsedKey),
            databaseURL: databaseUrl,
          }
        : { databaseURL: databaseUrl }
    );

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);
const adminRtdb = getDatabase(app);

export { adminAuth, adminDb, adminRtdb };
