# Firebase Backend - Deployment Checklist ✅

## Pre-Deployment Verification

### Environment Setup
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` di `.env.local` (JSON valid)
- [ ] `FIREBASE_DATABASE_URL` di `.env.local`
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` di `.env.local`
- [ ] Service account role = **Editor** di Google Cloud IAM

### Code Review
- [ ] `src/lib/db/firebase-admin.ts` - firebase-admin SDK initialized
- [ ] `src/app/api/sensor/route.ts` - POST handler untuk ESP32 data
- [ ] `src/app/api/sensor/route.ts` - GET handler untuk membaca readings
- [ ] `src/app/api/history/route.ts` - GET handler untuk histori dengan auth

### Firebase Configuration
- [ ] `database.rules.json` - RTDB rules di-deploy (`firebase deploy --only database`)
- [ ] `firestore.rules` - Firestore rules di-deploy (`firebase deploy --only firestore:rules`)
- [ ] Firestore composite index di-create (collection: `users/{uid}/ponds/{pondId}/sensors`)

## Local Testing (Dev Mode)

```bash
# Terminal 1: Run Next.js dev server
npm run dev
# Expected: http://localhost:3000

# Terminal 2: Test POST endpoint
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-uid","pondId":"test-pond","temperature":28,"ph":7,"turbidity":200,"waterLevel":50}'

# Terminal 3: Test GET endpoint (readings)
curl "http://localhost:3000/api/sensor?uid=test-uid&pondId=test-pond&limit=5"

# Terminal 4: Test GET endpoint (history) - perlu valid token
curl -H "Authorization: Bearer <idToken>" \
  "http://localhost:3000/api/history?uid=test-uid&pondId=test-pond&period=today"
```

### Expected Test Results

**POST /api/sensor:**
```json
{
  "status": "success",
  "message": "Data received",
  "rtdbOk": true,
  "firestoreOk": true,
  "latestOk": true
}
```

**GET /api/sensor:**
```json
{
  "sensors": [...]
}
```

**GET /api/history:**
```json
{
  "data": [...],
  "summary": {
    "totalData": X,
    "avgSuhu": Y,
    ...
  }
}
```

## Debugging Server Logs

Jika ada error, lihat console output untuk:
- `[POST /api/sensor]` messages
- `[GET /api/history]` messages
- Error stack traces dengan file & line number

### Common Issues & Fixes

| Issue | Log Message | Fix |
|-------|-------------|-----|
| RTDB permission denied | `❌ RTDB readings failed: permission denied` | Check service account role (Editor?), re-download credentials |
| Firestore permission denied | `❌ Firestore history failed: permission denied` | Check Firestore rules, service account role |
| Missing index | `code: 'FAILED_PRECONDITION'` | Create composite index di Firebase Console |
| Invalid credentials | `Warning: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY` | Verify JSON format, try base64 encoding |
| Token verification failed | `Invalid token` | Verify token sudah valid (tidak expired), uid match |

## Production Deployment

### Step 1: Build & Test
```bash
npm run build
npm start
# Test endpoints dengan curl/Postman
```

### Step 2: Deploy Firebase Rules
```bash
firebase deploy --only database,firestore:rules
```

### Step 3: Deploy Next.js
```bash
# Vercel (recommended)
vercel deploy --prod

# Or Docker/Self-hosted
docker build -t aquavion-backend .
docker run -e FIREBASE_SERVICE_ACCOUNT_KEY="..." -p 3000:3000 aquavion-backend
```

### Step 4: Verify Production

```bash
# Test endpoint di production domain
curl -X POST https://your-production-domain.com/api/sensor \
  -H "Content-Type: application/json" \
  -d '{"userId":"uid","pondId":"pond","temperature":28,"ph":7,"turbidity":200,"waterLevel":50}'
```

## Post-Deployment Monitoring

### Metrics to Track
- [ ] RTDB readings write success rate
- [ ] Firestore history write success rate
- [ ] Notification delivery (Telegram, Web Push)
- [ ] API response time (goal: < 2s)
- [ ] Error rate (goal: < 0.5%)

### Check Dashboard
- [ ] Firestore: data ada di `users/{uid}/ponds/{pondId}/sensors`
- [ ] RTDB: data ada di `sensors/{uid}/{pondId}/readings` & `latest`
- [ ] Notifications: Telegram/Web Push terkirim ketika ada actions

### Setup Alerting (Optional)
- Cloud Monitoring: monitor 500 errors di API routes
- Firestore: monitor write errors
- RTDB: monitor write errors

## Rollback Plan

Jika ada issues di production:

```bash
# Rollback Firebase rules ke previous version
firebase deploy --only database,firestore:rules

# Rollback Next.js deployment (Vercel)
vercel rollback

# Manual: restart application dengan backup env file
```

## Success Criteria ✅

Deployment dianggap sukses jika:
- [ ] ESP32 POST request → `status: "success"`
- [ ] Data muncul di RTDB dalam < 2 detik
- [ ] Data muncul di Firestore dalam < 5 detik
- [ ] History query return correct data dengan auth verification
- [ ] Notifikasi terkirim ketika ada anomali
- [ ] No 500 errors di production logs selama 24 jam

---

**Last Updated:** 2026-05-13
**Maintenance:** Check logs setiap hari untuk 1 minggu pertama
