## Lele Smart
Lele Smart adalah sistem berbasis web yang digunakan untuk monitoring alat iot yang terletak di kolam, Lele Smart akan terintegrasi dengan IOT, Cloud Computing dan Big Data

## Fitur Utama
- Dashboard - berisi chart, graph, untuk monitoring seluruh isi kolam yang terdaftar pada akun
- Manajemen kolam (CRUD) - menambah kolam dan menambahkan alat iot agar terhubung ke identitas kolam ini di database
- Menu pembelajaran terkait lele ( detail apa aja penindakan itu, kenapa, dan dari mana sumbernya)

## Teknologi yang Digunakan
Website ini dikembangkan menggunakan teknologi web modern untuk performa dan UI/UX yang maksimal:
- **[Next.js (App Router)](https://nextjs.org/)** - Framework React utama
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS untuk desain responsif dan styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animasi dinamis
- **[Recharts](https://recharts.org/)** - Visualisasi data dan grafik interaktif untuk dashboard
- **[Lucide React](https://lucide.dev/)** - Kumpulan ikon modern

## Cara Menjalankan Project (Local Development)
Pastikan Anda memiliki instalasi Node.js pada komputer Anda. Buka terminal pada folder project ini dan jalankan perintah:

1. Install seluruh dependencies (jika belum):
   ```bash
   npm install
   ```
2. Jalankan server lokal:
   ```bash
   npm run dev
   ```
3. Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

## Cara Build Project
- disarankan manggunakan pipeline CI/CD agar bisa langsung implementasi CC nya
- gunakan branch jika ingin update, dan sering sering buka github !
- setiap perubahan harus ada izin dari user lain untuk di merge ke main/master branch
- kita sama sama belajar, jadi perbanyak komunikasi di grup, jangan takut salah !!!!!
