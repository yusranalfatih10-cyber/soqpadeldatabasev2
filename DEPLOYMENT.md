# Panduan Deployment Lengkap
# SOQ.COMM PADEL LEAGUE — TEAM REGISTRATION

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

## Langkah-langkah Deployment

### 1. Buat Akun Layanan

#### a. Neon PostgreSQL (Database)
- URL: https://neon.tech
- Daftar gratis dengan GitHub
- Buat project baru
- Pilih region: Singapore (Asia)
- Salin connection string

#### b. Cloudinary (Storage Foto)
- URL: https://cloudinary.com
- Daftar gratis
- Catat: Cloud Name, API Key, API Secret
- Buat upload preset (Unsigned)

#### c. Render (Backend Hosting)
- URL: https://render.com
- Daftar gratis dengan GitHub
- Buat Web Service baru

#### d. Z.ai / Vercel / Netlify (Frontend Hosting)
- Pilih salah satu untuk hosting frontend
- Vercel: https://vercel.com (recommended)
- Netlify: https://netlify.com
- Z.ai: sesuai instruksi platform

### 2. Setup Database

#### Jalankan SQL Migration
1. Buka Neon Dashboard → SQL Editor
2. Copy isi file `database/migration.sql`
3. Execute
4. Verifikasi semua tabel terbuat

#### Set Password Admin
```sql
-- Ganti 'password_baru_anda' dengan password yang kuat
-- Generate hash di: https://bcrypt-generator.com
UPDATE admin_users 
SET password_hash = '$2b$10$HASH_YANG_DI_GENERATE' 
WHERE username = 'admin';
```

### 3. Deploy Backend

#### Di Render:
1. New → Web Service
2. Connect GitHub repository
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Plan: Free

#### Environment Variables di Render:
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
JWT_SECRET=generate-random-64-character-string-here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGINS=https://your-frontend-domain.com
NODE_ENV=production
PORT=3001
```

### 4. Deploy Frontend

#### Build:
```bash
# Buat file .env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name

# Build
npm run build
```

#### Deploy ke Vercel:
1. `vercel` command atau push ke GitHub
2. Set environment variables yang sama
3. Deploy otomatis

### 5. Verifikasi

1. Buka frontend URL
2. Test pendaftaran tim baru
3. Login admin
4. Verifikasi data tersimpan
5. Cek status pendaftaran
6. Upload foto dan verifikasi tampil

## Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan DATABASE_URL benar
- Cek Neon dashboard → Connection Details
- Pastikan IP tidak diblokir

### Foto tidak upload
- Cek Cloudinary credentials
- Pastikan API Key dan Secret benar
- Cek quota Cloudinary

### CORS error
- Tambahkan domain frontend ke CORS_ORIGINS di backend
- Format: `https://domain1.com,https://domain2.com`

### Frontend tidak bisa connect ke backend
- Pastikan VITE_API_URL benar (tanpa trailing slash)
- Cek backend URL bisa diakses: `https://your-backend.onrender.com/api/health`
- Render free plan butuh ~30 detik cold start

## Batasan Free Plan

| Layanan | Batasan |
|---------|---------|
| Neon PostgreSQL | 0.5 GB storage, auto-pause |
| Cloudinary | 25 GB storage, 25 GB bandwidth/bulan |
| Render | 750 jam/bulan, sleep setelah 15 min idle |
| Vercel | 100 GB bandwidth/bulan |

## Keamanan

- Password admin di-hash dengan bcrypt
- JWT token untuk autentikasi
- Rate limiting pada endpoint sensitif
- CORS whitelist
- File upload validation
- SQL injection prevention (parameterized queries)
- Environment variables untuk secrets
- HTTPS enforced

## Maintenance

- Monitor Neon dashboard untuk storage usage
- Monitor Cloudinary untuk bandwidth
- Backup database secara berkala
- Update dependencies secara berkala
- Monitor error logs di Render
