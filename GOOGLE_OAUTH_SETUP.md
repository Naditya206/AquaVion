# Setup Google OAuth untuk AquaVion

## Langkah 1: Buat OAuth Credentials di Google Cloud Console

1. Buka https://console.cloud.google.com
2. Pilih project Firebase kamu (aquavion-26) atau buat project baru
3. Di sidebar, pilih **APIs & Services** → **Credentials**
4. Klik **Create Credentials** → **OAuth 2.0 Client ID**
5. Jika diminta, configure OAuth consent screen dulu:
   - User Type: **External**
   - App name: **AquaVion**
   - User support email: email kamu
   - Developer contact: email kamu
   - Save and Continue
6. Kembali ke Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **AquaVion Web**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://192.168.1.77:3000` (IP lokal kamu)
     - `https://your-domain.vercel.app` (production nanti)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://192.168.1.77:3000/api/auth/callback/google`
     - `https://your-domain.vercel.app/api/auth/callback/google` (production nanti)
7. Klik **Create**
8. Copy **Client ID** dan **Client Secret**

## Langkah 2: Update .env.local

Buka file `.env.local` dan ganti placeholder dengan credentials asli:

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

## Langkah 3: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## Langkah 4: Test Google Sign-In

1. Buka http://localhost:3000/login
2. Klik tombol "Masuk dengan Google"
3. Pilih akun Google
4. Setelah berhasil, akan redirect ke dashboard
5. Profile picture dari Google akan muncul di navbar

## Cara Kerja

- NextAuth.js handle OAuth flow dengan Google
- Data user (nama, email, foto) otomatis tersimpan ke Firestore via Firebase Adapter
- Profile picture dari Google otomatis sinkron
- Session management handled by NextAuth

## Troubleshooting

### Error: redirect_uri_mismatch
- Pastikan redirect URI di Google Console sama persis dengan yang digunakan
- Format: `http://localhost:3000/api/auth/callback/google`

### Error: invalid_client
- Cek GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET sudah benar di .env.local
- Pastikan tidak ada spasi atau karakter tambahan
- Restart dev server setelah update .env.local

### Profile picture tidak muncul
- Cek di Firestore collection `users` apakah field `image` tersimpan
- Refresh halaman atau logout/login ulang

### Error: Cannot find module 'next-auth'
- Jalankan: `npm install`
- Pastikan next-auth@beta sudah terinstall

