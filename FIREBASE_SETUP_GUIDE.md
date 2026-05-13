# Firebase Backend Setup Guide - AquaVion IoT

## Arsitektur yang Sudah Di-implementasikan

```
ESP32 
  ↓ POST /api/sensor (dengan userId, pondId, suhu, pH, dll)
  ↓
Next.js API Route (firebase-admin SDK)
  ├→ Write ke RTDB: sensors/{uid}/{pondId}/readings (push)
  ├→ Update RTDB: sensors/{uid}/{pondId}/latest
  ├→ Write ke Firestore: users/{uid}/ponds/{pondId}/sensors (histori permanen)
  ├→ Kirim notifikasi (Telegram, Web Push) jika ada actions
  ↓
Dashboard (baca dari RTDB untuk realtime)
History/Analytics (baca dari Firestore untuk data historis)
```

## File-file yang Sudah Dikonfigurasi

### 1. **`src/lib/db/firebase-admin.ts`** ✅
- Inisialisasi Firebase Admin SDK
- Parse service account credentials dari `FIREBASE_SERVICE_ACCOUNT_KEY`
- Exports: `adminAuth`, `adminDb`, `adminRtdb`

**Yang baru ditambahkan:**
- Warning message jika service account tidak ter-parse
- Firestore settings untuk `ignoreUndefinedProperties`

### 2. **`src/app/api/sensor/route.ts`** ✅
**POST**: Menerima data sensor dari ESP32
- Mapping flexible untuk payload ESP32 (suhu/ph_air/kekeruhan/tinggi_air)
- Evaluasi kondisi otomatis → actions
- Write atomik ke:
  - RTDB `sensors/{uid}/{pondId}/readings` (push)
  - RTDB `sensors/{uid}/{pondId}/latest` (update)
  - Firestore `users/{uid}/ponds/{pondId}/sensors` (histori)
- Non-blocking notification handler (Telegram + Web Push)
- Comprehensive logging untuk debugging

**GET**: Membaca latest readings dari RTDB
- Parameter: `uid`, `pondId`, `limit` (default 24, max 200)
- Return: sorted array (newest first)

### 3. **`src/app/api/history/route.ts`** ✅
**GET**: Membaca histori dari Firestore
- Auth verification (token + uid check)
- Date range filtering: today, 7d, 30d, custom
- Return: formatted data + summary (avg, min, max)
- Error handling untuk missing composite index

### 4. **`database.rules.json`** ✅
**RTDB Security Rules:**
- Client-side access: hanya user bisa read/write data mereka sendiri
- Server-side (admin SDK): bypasses rules (tidak perlu di-rules)
- Struktur: `sensors/{uid}/{pondId}/readings` & `sensors/{uid}/{pondId}/latest`

### 5. **`firestore.rules`** ✅
**Firestore Security Rules:**
- Client-side access: hanya user bisa read/write data mereka sendiri
- Server-side (admin SDK): bypasses rules
- Struktur: `users/{uid}/ponds/{pondId}/sensors` untuk histori

## Deployment Steps

### Step 1: Verify Environment Variables

```bash
# Di .env.local atau deployment environment
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...} # JSON lengkap atau base64
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_webpush_public_key
VAPID_PRIVATE_KEY=your_webpush_private_key
```

### Step 2: Deploy Security Rules

```bash
# Deploy RTDB rules
firebase deploy --only database

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Step 3: Create Firestore Composite Index (jika perlu)

Jika mendapat error **"FAILED_PRECONDITION: The query requires an index"**, lakukan:

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Project: **aquavion-26**
3. Firestore → Indexes (Composite)
4. Buat index untuk collection `users/{uid}/ponds/{pondId}/sensors`:
   - Field 1: `createdAt` (Ascending)
   - Field 2: `createdAt` (Descending)
   - Collection scope: `Automatic`

Atau klik link error yang diberikan Firestore - akan direct ke Firebase Console untuk membuat index.

### Step 4: Verify Service Account Permissions

Service account harus memiliki role **Editor** di Firebase project:

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. IAM & Admin → IAM
3. Service account: `firebase-adminsdk-fbsvc@aquavion-26.iam.gserviceaccount.com`
4. Verify role: **Editor** atau **Firebase Admin**

## Testing Payload

### POST /api/sensor (dari ESP32)

```bash
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "8JAGfvb3EXPKijhoAllz2ObC0Bf2",
    "pondId": "vFiRLFv3vOGHdstJNN0h",
    "temperature": 28.5,
    "ph": 7.2,
    "turbidity": 250,
    "waterLevel": 55
  }'
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Data received",
  "actions": [],
  "rtdbOk": true,
  "firestoreOk": true,
  "latestOk": true
}
```

### GET /api/sensor (baca latest dari RTDB)

```bash
curl "http://localhost:3000/api/sensor?uid=8JAGfvb3EXPKijhoAllz2ObC0Bf2&pondId=vFiRLFv3vOGHdstJNN0h&limit=10"
```

**Response:**
```json
{
  "sensors": [
    {
      "id": "key1",
      "temperature": 28.5,
      "ph": 7.2,
      "turbidity": 250,
      "waterLevel": 55,
      "createdAt": "2026-05-13T10:30:00.000Z"
    }
  ]
}
```

### GET /api/history (baca histori dari Firestore)

```bash
curl -H "Authorization: Bearer <idToken>" \
  "http://localhost:3000/api/history?uid=8JAGfvb3EXPKijhoAllz2ObC0Bf2&pondId=vFiRLFv3vOGHdstJNN0h&period=7d"
```

**Response:**
```json
{
  "data": [
    {
      "id": "docId",
      "suhu": 28.5,
      "ph_air": 7.2,
      "kekeruhan": 250,
      "tinggi_air": 55,
      "timestamp": "2026-05-13T10:30:00.000Z",
      "actions": [],
      "status": "Aman"
    }
  ],
  "summary": {
    "avgSuhu": 28.2,
    "avgPh": 7.15,
    "minSuhu": 25,
    "maxSuhu": 30,
    "minPh": 6.8,
    "maxPh": 7.5,
    "totalData": 45
  }
}
```

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Sebab:** Service account credentials tidak ter-set atau tidak valid.

**Solusi:**
1. Verify `.env.local` memiliki `FIREBASE_SERVICE_ACCOUNT_KEY` yang valid
2. Check di Firebase Console: project settings → service accounts
3. Pastikan role service account adalah **Editor** atau **Firebase Admin**
4. Re-download JSON credentials jika lama:
   - Firebase Console → Settings (gear) → Service Accounts
   - Generate new key → Download JSON
   - Copy isinya ke `FIREBASE_SERVICE_ACCOUNT_KEY`

### Error: "The query requires an index"

**Sebab:** Firestore composite index belum dibuat.

**Solusi:**
1. Buka link yang diberikan error message (direct ke Firebase Console)
2. Atau manual: Firebase Console → Firestore → Indexes (Composite) → Create Index
3. Collection: `users/{uid}/ponds/{pondId}/sensors`
4. Fields: 
   - `createdAt` (Ascending)
   - `createdAt` (Descending) ← untuk ORDER BY DESC
5. Status akan menjadi "Enabled" setelah ~5 menit

### Error: "RTDB write timeout"

**Sebab:** RTDB URL tidak valid atau service account tidak punya akses.

**Solusi:**
1. Verify `FIREBASE_DATABASE_URL` di `.env.local`
2. Pastikan format: `https://{project}-default-rtdb.{region}.firebasedatabase.app`
3. Check RTDB rules: Settings → Rules → should be set (tidak "Null")

### Data tidak muncul di RTDB tapi Firestore OK

**Sebab:** RTDB path structure tidak sesuai rules.

**Solusi:**
1. Verify path: `sensors/{uid}/{pondId}/readings` & `sensors/{uid}/{pondId}/latest`
2. Check database.rules.json sudah ter-deploy
3. Manual test di Firebase Console → Realtime Database → cek structure

### Notifikasi Telegram tidak terkirim

**Sebab:** Settings tidak tersimpan atau bot token salah.

**Solusi:**
1. Verify di Firestore: `users/{uid}/settings/config`
2. Harus ada field: `telegramEnabled`, `botToken`, `chatId`
3. Re-enter bot token jika bermasalah
4. Check server logs: `[POST /api/sensor]` untuk error messages

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     ESP32 IoT Device                             │
│  Sends: {userId, pondId, suhu, ph_air, kekeruhan, tinggi_air}  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
          POST /api/sensor (firebase-admin)
          ├─ Validate: uid, pondId required
          ├─ Evaluate conditions → actions
          ├─ Push to RTDB sensors/{uid}/{pondId}/readings
          ├─ Update RTDB sensors/{uid}/{pondId}/latest
          └─ Write to Firestore users/{uid}/ponds/{pondId}/sensors
                     │
        ┌────────────┴────────────┬─────────────────┐
        ▼                         ▼                 ▼
   Dashboard             History/Analytics    Notifications
(realtime from RTDB) (histori dari Firestore) (Telegram/Web Push)
```

## Best Practices

✅ **DO:**
- Selalu kirim `uid` dan `pondId` dari ESP32
- Gunakan token verification di endpoint history
- Monitor server logs untuk error messages
- Create Firestore composite index untuk production
- Backup security rules secara regular

❌ **DON'T:**
- Expose `FIREBASE_SERVICE_ACCOUNT_KEY` di frontend
- Ubah RTDB/Firestore rules tanpa testing
- Ignore error messages saat deployment
- Hardcode credentials di code

## Support

Jika ada issue, check:
1. Server logs: `[POST /api/sensor]` atau `[GET /api/history]`
2. Firebase Console → Firestore/RTDB untuk struktur data
3. Network tab: POST request body vs error response
4. Environment variables: `.env.local` sudah reload?

---

**Last Updated:** 2026-05-13
**Firebase Project:** aquavion-26
**Version:** 1.0.0
