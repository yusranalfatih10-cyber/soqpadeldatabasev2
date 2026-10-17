# Panduan Deployment Lengkap
# SOQ.COMM PADEL LEAGUE — TEAM REGISTRATION

---

## Arsitektur Sistem

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Frontend (React)  │────▶│   Backend (Express)   │────▶│  Neon PostgreSQL │
│   Z.ai / Vercel     │     │   Render / Railway    │     │   (Database)    │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
         │                            │
         │                            ▼
         │                   ┌──────────────────────┐
         └──────────────────▶│    Cloudinary        │
            (Upload Foto)    │   (Image Storage)    │
                             └──────────────────────┘
```

---

## A. Persyaratan Sistem

### Frontend
- **Node.js**: v18 atau lebih baru
- **React**: v18.2.0
- **Vite**: v6.3.5
- **Tailwind CSS**: v4.1.7
- **TypeScript**: v5.7.0
- **react-router-dom**: v6.8.0
- **lucide-react**: v0.294.0

### Backend
- **Node.js**: v18 atau lebih baru
- **Express**: v4.18.2
- **pg** (node-postgres): v8.11.3
- **bcryptjs**: v2.4.3
- **jsonwebtoken**: v9.0.2
- **multer**: v1.4.5-lts.1
- **cloudinary**: v1.41.0
- **express-rate-limit**: v7.1.4
- **helmet**: v7.1.0
- **cors**: v2.8.5

### Layanan Eksternal
| Layanan | Fungsi | Free Plan |
|---------|--------|-----------|
| **Neon PostgreSQL** | Database utama | 0.5 GB storage |
| **Cloudinary** | Penyimpanan foto/logo | 25 GB storage, 25 GB bandwidth/bulan |
| **Render** | Hosting backend API | 750 jam/bulan |
| **Vercel / Z.ai** | Hosting frontend | Tergantung layanan |

---

## B. Persiapan Database

### B.1 Membuat Database Neon PostgreSQL

1. Kunjungi https://neon.tech
2. Daftar menggunakan akun GitHub atau Google
3. Klik **New Project**
4. Beri nama project (misal: `soq-padel-league`)
5. Pilih region terdekat (rekomendasi: `Singapore` untuk Asia Tenggara)
6. Tunggu hingga database selesai dibuat
7. Salin **Connection String** dari halaman project

Format connection string:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### B.2 Menjalankan Migrasi Database

1. Di dashboard Neon, buka menu **SQL Editor**
2. Copy seluruh isi file `database/migration.sql`
3. Paste ke SQL Editor
4. Klik **Run** untuk menjalankan
5. Verifikasi semua tabel berhasil dibuat:
   - `app_settings` - Pengaturan aplikasi
   - `admin_users` - Akun admin
   - `teams` - Data tim
   - `players` - Data pemain
   - `registration_logs` - Log aktivitas

### B.3 Mengatur Password Admin

Password default admin di migration.sql menggunakan placeholder hash. Ganti dengan password yang aman:

```sql
-- Generate bcrypt hash di: https://bcrypt-generator.com
-- Atau jalankan: node -e "console.log(require('bcryptjs').hashSync('password_baru', 10))"

UPDATE admin_users 
SET password_hash = '$2b$10$HASH_HASIL_GENERATE' 
WHERE username = 'admin';
```

### B.4 Memeriksa Koneksi Database

Jalankan query sederhana untuk verifikasi:
```sql
SELECT COUNT(*) FROM app_settings;
-- Harus mengembalikan 9 baris (jumlah default settings)
```

---

## C. Environment Variables

### Frontend (Vite)

Buat file `.env` di root project frontend:

```env
# URL Backend API (tanpa trailing slash)
VITE_API_URL=https://your-backend.onrender.com/api

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

| Variabel | Deskripsi | Wajib |
|----------|-----------|-------|
| `VITE_API_URL` | URL lengkap backend API | ✅ |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud name dari dashboard Cloudinary | ❌ (opsional) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload preset name | ❌ (opsional) |

### Backend (Node.js)

Buat file `server/.env` di folder server:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database (Neon PostgreSQL Connection String)
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# JWT Secret (WAJIB: minimal 32 karakter, gunakan random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# CORS - Domain frontend yang diizinkan (comma-separated)
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

| Variabel | Deskripsi | Wajib |
|----------|-----------|-------|
| `DATABASE_URL` | Connection string PostgreSQL | ✅ |
| `JWT_SECRET` | Secret key untuk JWT token | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary | ✅ |
| `CLOUDINARY_API_KEY` | API key Cloudinary | ✅ |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary | ✅ |
| `CORS_ORIGINS` | Domain frontend yang diizinkan | ✅ |
| `PORT` | Port server (default: 3001) | ❌ |
| `NODE_ENV` | Environment mode | ❌ |

---

## D. Deployment Aplikasi

### D.1 Setup Cloudinary

1. Daftar di https://cloudinary.com (Free plan)
2. Setelah login, catat dari dashboard:
   - **Cloud Name** (tampil di dashboard)
   - **API Key** (Settings → API Keys)
   - **API Secret** (Settings → API Keys → klik show)
3. Buat Upload Preset:
   - Settings → Upload → Upload presets → Add upload preset
   - Signing Mode: **Unsigned** (untuk upload dari frontend jika diperlukan)
   - Folder: `padel-league`
   - Save dan catat **Preset Name**

### D.2 Instalasi dan Running Lokal

#### Frontend:
```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build
```

#### Backend:
```bash
cd server

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Atau untuk production
npm start
```

### D.3 Deploy Backend ke Render

1. Push kode ke repository GitHub
2. Kunjungi https://render.com dan daftar
3. Klik **New** → **Web Service**
4. Connect repository GitHub
5. Konfigurasi:
   - **Name**: `soq-padel-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Tambahkan semua **Environment Variables** dari bagian C
7. Klik **Create Web Service**
8. Tunggu deploy selesai (~2-5 menit)
9. Catat URL backend (contoh: `https://soq-padel-backend.onrender.com`)

### D.4 Deploy Frontend

#### Opsi A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Untuk production
vercel --prod
```

Atau via GitHub integration di vercel.com:
1. Import repository
2. Framework Preset: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Tambahkan Environment Variables
6. Deploy

#### Opsi B: Netlify
1. Build lokal: `npm run build`
2. Drag & drop folder `dist/` ke netlify.com
3. Atau connect GitHub untuk auto-deploy
4. Tambahkan Environment Variables

#### Opsi C: Z.ai
1. Build lokal: `npm run build`
2. Upload isi folder `dist/` ke Z.ai
3. Konfigurasi routing SPA (semua route ke index.html)

### D.5 Menghubungkan Frontend dengan Backend

1. Setelah backend di-deploy di Render, salin URL backend
2. Update `VITE_API_URL` di frontend environment:
   ```
   VITE_API_URL=https://soq-padel-backend.onrender.com/api
   ```
3. Update `CORS_ORIGINS` di backend environment:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
4. Redeploy kedua layanan

### D.6 Memastikan Database Dapat Diakses

1. Di Neon dashboard → Settings → Allowed IPs
2. Untuk Render free, pastikan IP Render diizinkan (atau allow all)
3. Test koneksi dari backend:
   ```
   curl https://your-backend.onrender.com/api/health
   ```
4. Respons yang diharapkan: `{"status":"ok","timestamp":"..."}`

---

## E. Troubleshooting

### E.1 Data Tidak Tersimpan pada Panel Preview

**Penyebab**: Backend belum dikonfigurasi atau tidak bisa diakses.

**Solusi**:
1. Pastikan `VITE_API_URL` sudah diisi dengan URL backend yang benar
2. Cek backend bisa diakses: `curl https://your-backend.onrender.com/api/health`
3. Jika Render free plan, tunggu ~30-60 detik untuk cold start
4. Cek console browser untuk error network
5. Pastikan CORS_ORIGINS di backend sudah mencakup domain frontend

### E.2 Database Tidak Dapat Dihubungkan

**Penyebab**: Connection string salah atau database belum dibuat.

**Solusi**:
1. Verifikasi `DATABASE_URL` di environment backend
2. Cek Neon dashboard → project aktif
3. Pastikan format connection string benar:
   ```
   postgresql://user:pass@host.neon.tech/dbname?sslmode=require
   ```
4. Jalankan migration SQL jika tabel belum dibuat
5. Cek log Render untuk error detail

### E.3 Foto Pemain Gagal Diunggah

**Penyebab**: Cloudinary credentials salah atau quota habis.

**Solusi**:
1. Verifikasi `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. Cek quota Cloudinary di dashboard
3. Pastikan format file didukung: JPG, PNG, WEBP
4. Pastikan ukuran file tidak melebihi batas (default 5MB)
5. Cek log backend untuk error detail

### E.4 Logo Tim Tidak Tampil

**Penyebab**: URL logo tidak valid atau Cloudinary error.

**Solusi**:
1. Cek apakah file berhasil diupload ke Cloudinary
2. Verifikasi URL yang tersimpan di database
3. Cek CORS Cloudinary jika gambar tidak tampil di domain tertentu

### E.5 Error Saat Mengirim Formulir

**HTTP 400**: Data tidak lengkap atau validasi gagal
- Pastikan semua field wajib diisi
- Cek jumlah pemain sesuai batas (1-20)
- Pastikan foto pemain sudah diupload

**HTTP 403**: Pendaftaran ditutup
- Admin perlu membuka pendaftaran di Pengaturan

**HTTP 409**: Nama tim sudah terdaftar
- Gunakan nama tim yang berbeda

**HTTP 500**: Error server
- Cek log backend di Render
- Verifikasi koneksi database
- Cek Cloudinary credentials

### E.6 Environment Variables Belum Terisi

**Solusi**:
1. Frontend: Pastikan file `.env` ada di root project
2. Backend: Pastikan file `server/.env` ada
3. Di Vercel/Render: Tambahkan env vars di dashboard
4. Restart aplikasi setelah mengubah env vars
5. Untuk Vite, variabel harus diawali `VITE_`

### E.7 Migrasi Database Gagal

**Solusi**:
1. Pastikan sudah login ke Neon dengan akses yang benar
2. Copy seluruh isi `database/migration.sql` tanpa memodifikasi
3. Jalankan satu per satu jika ada error
4. Gunakan `IF NOT EXISTS` untuk tabel yang sudah ada
5. Cek Neon SQL Editor untuk pesan error spesifik

### E.8 Admin Tidak Bisa Login

**Solusi**:
1. Pastikan password hash di database sudah benar
2. Generate hash baru: `node -e "console.log(require('bcryptjs').hashSync('password', 10))"`
3. Update di database:
   ```sql
   UPDATE admin_users SET password_hash = 'hash_baru' WHERE username = 'admin';
   ```
4. Pastikan `JWT_SECRET` sudah diisi di backend

### E.9 Render Cold Start (Lambat Pertama Kali)

**Penyebab**: Render free plan menidurkan service setelah 15 menit tidak aktif.

**Solusi**:
- Tunggu 30-60 detik untuk request pertama
- Atau upgrade ke Render paid plan ($7/bulan)
- Gunakan service monitoring (UptimeRobot) untuk ping berkala

---

## F. Checklist Deployment

- [ ] Database Neon dibuat dan migration dijalankan
- [ ] Password admin sudah diganti dari default
- [ ] Cloudinary account dibuat dan credentials dicatat
- [ ] Backend di-deploy ke Render
- [ ] Environment variables backend sudah diisi
- [ ] Backend health check berhasil (`/api/health`)
- [ ] Frontend di-deploy ke Vercel/Z.ai
- [ ] `VITE_API_URL` sudah diisi URL backend
- [ ] `CORS_ORIGINS` di backend sudah mencakup domain frontend
- [ ] Pendaftaran tim baru berhasil
- [ ] Foto pemain berhasil diupload
- [ ] Logo tim berhasil diupload
- [ ] Admin login berhasil
- [ ] Dashboard admin menampilkan data
- [ ] Cek status pendaftaran berfungsi
- [ ] Cetak bukti pendaftaran berfungsi

---

## G. Kontak Support

- **WhatsApp**: [+62 814-1227-4044](https://wa.me/6281412274044)
- **Kompetisi**: SOQ.COMM PADEL LEAGUE 2026

---

© 2026 SOQ.COMM PADEL LEAGUE. All rights reserved.
