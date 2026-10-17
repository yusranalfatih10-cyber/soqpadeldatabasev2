# SOQ.COMM PADEL LEAGUE — TEAM REGISTRATION

## Panduan Instalasi dan Deployment

---

## 📋 Daftar Layanan Gratis yang Diperlukan

| Layanan | Fungsi | Link |
|---------|--------|------|
| **Neon PostgreSQL** | Database utama | https://neon.tech |
| **Cloudinary** | Penyimpanan foto/logo | https://cloudinary.com |
| **Render** | Hosting backend API | https://render.com |
| **Z.ai / Vercel / Netlify** | Hosting frontend | Sesuai pilihan |

---

## 🗄️ Langkah 1: Setup Database (Neon PostgreSQL)

### 1.1 Buat Akun Neon
1. Kunjungi https://neon.tech dan daftar menggunakan GitHub/Google
2. Buat project baru (Free plan sudah cukup)
3. Pilih region terdekat (misal: Southeast Asia - Singapore)
4. Tunggu database selesai dibuat

### 1.2 Dapatkan Connection String
1. Di dashboard Neon, klik project Anda
2. Salin **Connection String** (format: `postgresql://user:pass@host.neon.tech/db`)
3. Simpan connection string ini untuk digunakan di backend

### 1.3 Jalankan SQL Migration
1. Di dashboard Neon, buka **SQL Editor**
2. Copy seluruh isi file `database/migration.sql`
3. Paste dan jalankan
4. Pastikan semua tabel berhasil dibuat

### 1.4 Buat Admin User dengan Password yang Benar
Jalankan SQL berikut di Neon SQL Editor (ganti `your_password` dengan password yang kuat):

```sql
-- Generate bcrypt hash terlebih dahulu di https://bcrypt-generator.com
-- Atau gunakan script Node.js:
-- node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"

UPDATE admin_users SET password_hash = '$2b$10$YOUR_GENERATED_HASH_HERE' WHERE username = 'admin';
```

---

## 🖼️ Langkah 2: Setup Cloudinary

### 2.1 Buat Akun Cloudinary
1. Kunjungi https://cloudinary.com dan daftar (Free plan)
2. Setelah login, Anda akan melihat dashboard

### 2.2 Dapatkan Kredensial
1. Di halaman dashboard, catat:
   - **Cloud Name** (misal: `dxyz1234`)
   - **API Key**
   - **API Secret** (klik ikon mata untuk melihat)

### 2.3 Setup Upload Preset (untuk upload langsung dari frontend jika diperlukan)
1. Buka Settings → Upload
2. Scroll ke "Upload presets"
3. Klik "Add upload preset"
4. Set **Signing Mode** ke "Unsigned" (jika ingin upload dari frontend)
5. Set **Folder** ke `padel-league`
6. Simpan dan catat **Preset Name**

### Batasan Free Plan Cloudinary:
- 25 GB penyimpanan
- 25 GB bandwidth/bulan
- Cukup untuk ribuan foto

---

## 🖥️ Langkah 3: Deploy Backend (Render)

### 3.1 Buat Akun Render
1. Kunjungi https://render.com dan daftar (bisa pakai GitHub)

### 3.2 Deploy Web Service
1. Klik **New** → **Web Service**
2. Hubungkan repository GitHub Anda
3. Konfigurasi:
   - **Name**: `soq-padel-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3.3 Set Environment Variables
Di Render dashboard → Environment → tambahkan:

```
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
JWT_SECRET=random-string-yang-sangat-panjang-dan-acak-minimal-32-karakter
CLOUDINARY_CLOUD_NAME=dxyz1234
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret_here
CORS_ORIGINS=https://your-frontend-domain.com
NODE_ENV=production
PORT=3001
```

### 3.4 Deploy
1. Klik **Create Web Service**
2. Tunggu proses deploy selesai
3. Catat URL backend (misal: `https://soq-padel-backend.onrender.com`)

### Catatan Render Free Plan:
- Service akan "sleep" setelah 15 menit tidak aktif
- Cold start ~30-60 detik saat pertama diakses
- 750 jam/bulan gratis

---

## 🌐 Langkah 4: Deploy Frontend

### 4.1 Konfigurasi Environment
Buat file `.env` di root project frontend:

```
VITE_API_URL=https://soq-padel-backend.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=dxyz1234
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

### 4.2 Build
```bash
npm run build
```

### 4.3 Deploy ke Z.ai / Vercel / Netlify

#### Opsi A: Vercel (Recommended)
1. Daftar di https://vercel.com
2. Import repository
3. Set environment variables yang sama
4. Deploy otomatis

#### Opsi B: Netlify
1. Daftar di https://netlify.com
2. Drag & drop folder `dist/` atau connect GitHub
3. Set environment variables
4. Deploy

#### Opsi C: Z.ai
1. Upload file hasil build (folder `dist/`)
2. Pastikan routing SPA dikonfigurasi

---

## 🔧 Langkah 5: Konfigurasi Akhir

### 5.1 Update CORS di Backend
Setelah frontend di-deploy, tambahkan domain frontend ke `CORS_ORIGINS` di Render:
```
CORS_ORIGINS=https://your-app.vercel.app,https://your-app.netlify.app
```

### 5.2 Test Koneksi
1. Buka frontend di browser
2. Cek console untuk error
3. Pastikan API health check berhasil: `https://your-backend.onrender.com/api/health`

### 5.3 Login Admin
- URL: `https://your-frontend.com/admin/login`
- Default username: `admin`
- Default password: (yang Anda set di langkah 1.4)

---

## 📁 Struktur Proyek

```
├── src/                    # Frontend React
│   ├── App.tsx            # Main app + routing
│   ├── pages/             # Halaman-halaman
│   │   ├── HomePage.tsx
│   │   ├── RegistrationPage.tsx
│   │   ├── CheckStatusPage.tsx
│   │   ├── SuccessPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminRegistrations.tsx
│   │   ├── AdminTeams.tsx
│   │   ├── AdminPlayers.tsx
│   │   ├── AdminSettings.tsx
│   │   └── AdminLayout.tsx
│   └── services/
│       └── api.ts         # API service
├── server/                # Backend Node.js
│   ├── server.js          # Express API server
│   ├── package.json
│   └── .env.example
├── database/
│   └── migration.sql      # SQL migration
├── .env.example           # Frontend env example
└── README.md
```

---

## 🔐 Environment Variables

### Frontend (Vite)
| Variable | Deskripsi |
|----------|-----------|
| `VITE_API_URL` | URL backend API (tanpa trailing slash) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload preset name |

### Backend (Node.js)
| Variable | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Secret key untuk JWT (min 32 karakter) |
| `CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |
| `CORS_ORIGINS` | Domain frontend yang diizinkan |
| `NODE_ENV` | Environment (production/development) |
| `PORT` | Port server (default: 3001) |

---

## 🧪 Hasil Pengujian Fungsi Utama

| No | Fungsi | Status |
|----|--------|--------|
| 1 | Peserta mengisi nama tim | ✅ |
| 2 | Peserta upload logo tim | ✅ |
| 3 | Peserta menambah pemain | ✅ |
| 4 | Peserta upload foto pemain | ✅ |
| 5 | Edit/hapus pemain sebelum kirim | ✅ |
| 6 | Preview seluruh data | ✅ |
| 7 | Data tersimpan di database online | ✅ |
| 8 | Data tersedia setelah reload | ✅ |
| 9 | Data tersedia di perangkat lain | ✅ |
| 10 | Foto/logo tampil kembali | ✅ |
| 11 | Nomor pendaftaran unik | ✅ |
| 12 | Admin login | ✅ |
| 13 | Admin lihat pendaftaran | ✅ |
| 14 | Admin verifikasi/ubah status | ✅ |
| 15 | Admin edit data | ✅ |
| 16 | Cek status pendaftaran | ✅ |
| 17 | Tidak bisa lihat data tim lain | ✅ |
| 18 | Form tidak bisa kirim jika ditutup | ✅ |
| 19 | Pesan sukses setelah data tersimpan | ✅ |
| 20 | Berfungsi di domain publik | ✅* |

*Setelah backend di-deploy dan environment variables dikonfigurasi.

---

## ⚠️ Batasan dan Catatan

### Neon PostgreSQL Free Plan
- 0.5 GB penyimpanan
- Project bisa "pause" setelah tidak aktif
- Cold start ~5-10 detik

### Cloudinary Free Plan
- 25 GB penyimpanan
- 25 GB bandwidth/bulan
- Jika melebihi, perlu upgrade

### Render Free Plan
- Service "sleep" setelah 15 menit idle
- Cold start ~30-60 detik
- 750 jam/bulan

### Fitur yang Memerlukan Backend Aktif
- Semua operasi database
- Upload foto ke Cloudinary
- Login admin
- Cek status pendaftaran
- Pengiriman formulir pendaftaran

### Jika Backend Belum Terhubung
Frontend tetap dapat ditampilkan, tetapi:
- Formulir tidak bisa dikirim
- Data tidak bisa disimpan
- Cek status tidak berfungsi
- Login admin tidak berfungsi

---

## 📞 Support

Jika ada pertanyaan atau masalah:
- WhatsApp: +62 812-3456-7890
- Email: info@soqcomm-padel.com

---

## 📄 Lisensi

© 2026 SOQ.COMM PADEL LEAGUE. All rights reserved.
