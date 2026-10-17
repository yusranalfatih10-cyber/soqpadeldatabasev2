# SOQ.COMM PADEL LEAGUE — Team Registration

Sistem formulir pendaftaran tim profesional untuk kompetisi liga padel. Aplikasi web modern yang memungkinkan peserta mendaftarkan tim mereka secara online, mengunggah foto pemain dan logo tim, serta memantau status pendaftaran secara real-time.

---

## 📋 Deskripsi dan Tujuan

Aplikasi ini dirancang sebagai sistem pendaftaran resmi untuk **SOQ.COMM PADEL LEAGUE**, sebuah kompetisi padel yang diselenggarakan secara profesional. Tujuan utama:

- Memudahkan peserta mendaftarkan tim secara online
- Mengelola data tim dan pemain secara terpusat
- Memantau status verifikasi pendaftaran
- Menyediakan panel admin untuk pengelolaan kompetisi
- Mendukung 1 hingga 20 pemain per tim

---

## ✨ Daftar Fitur

### Fitur Peserta
- ✅ Formulir pendaftaran multi-step (Info Tim → Data Pemain → Konfirmasi)
- ✅ Upload logo tim (JPG, PNG, WEBP, maks 5 MB)
- ✅ Upload foto setiap pemain (wajib)
- ✅ Tambah/hapus pemain (1-20 pemain per tim)
- ✅ Preview data sebelum pengiriman
- ✅ Nomor pendaftaran otomatis (format: SOQ-REG-2026-0001)
- ✅ Cetak bukti pendaftaran (PDF)
- ✅ Cek status pendaftaran dengan nomor + WhatsApp
- ✅ Notifikasi error yang jelas

### Fitur Admin
- ✅ Login admin dengan autentikasi JWT
- ✅ Dashboard statistik (total pendaftaran, status, dll)
- ✅ Manajemen pendaftaran (verifikasi, tolak, minta perbaikan)
- ✅ Manajemen tim (edit, hapus, aktifkan/nonaktifkan)
- ✅ Manajemen pemain (edit, pindah tim, hapus)
- ✅ Pengaturan aplikasi (buka/tutup pendaftaran, batas pemain, dll)
- ✅ Ekspor data ke CSV
- ✅ Log aktivitas admin

### Fitur Teknis
- ✅ Desain responsif (mobile & desktop)
- ✅ Database PostgreSQL online (Neon)
- ✅ Penyimpanan gambar Cloudinary
- ✅ Validasi data frontend & backend
- ✅ Rate limiting untuk keamanan
- ✅ Proteksi SQL injection
- ✅ Mode demo (tanpa backend)

---

## 🛠️ Teknologi yang Digunakan

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 18.2.0 | UI framework |
| Vite | 6.3.5 | Build tool |
| TypeScript | 5.7.0 | Type safety |
| Tailwind CSS | 4.1.7 | Styling |
| React Router | 6.8.0 | Routing |
| Lucide React | 0.294.0 | Icons |

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js | 18+ | Runtime |
| Express | 4.18.2 | Web framework |
| PostgreSQL (pg) | 8.11.3 | Database driver |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT authentication |
| multer | 1.4.5 | File upload |
| cloudinary | 1.41.0 | Image storage |
| helmet | 7.1.0 | Security headers |
| express-rate-limit | 7.1.4 | Rate limiting |

### Layanan Eksternal
- **Neon PostgreSQL** - Database cloud (sudah terhubung langsung)
- **Cloudinary** - Penyimpanan gambar (opsional, fallback ke base64)
- **Vercel / Z.ai** - Hosting frontend

**Catatan:** Aplikasi ini terhubung langsung ke database Neon PostgreSQL dari browser menggunakan Neon Serverless Driver. Tidak memerlukan backend terpisah!

---

## 🏗️ Arsitektur

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Frontend (React)  │────▶│   Backend (Express)   │────▶│  Neon PostgreSQL │
│   Vite + Tailwind   │     │   Node.js + Express   │     │   Database      │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
         │                            │
         │                            ▼
         │                   ┌──────────────────────┐
         └──────────────────▶│    Cloudinary        │
            (Upload Foto)    │   Image Storage      │
                             └──────────────────────┘
```

### Alur Pendaftaran
1. Peserta mengisi data tim (nama, kapten, WhatsApp, kota, logo)
2. Peserta menambahkan data pemain (1-20 orang) dengan foto
3. Peserta melihat preview dan konfirmasi
4. Data dikirim ke backend → upload gambar ke Cloudinary → simpan ke database
5. Backend menghasilkan nomor pendaftaran unik
6. Peserta menerima nomor pendaftaran dan bisa cek status

---

## 📁 Struktur Folder Proyek

```
├── src/                          # Frontend React
│   ├── App.tsx                   # Main app + routing + context
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Global styles + Tailwind
│   ├── vite-env.d.ts             # TypeScript declarations
│   ├── pages/
│   │   ├── HomePage.tsx          # Halaman utama
│   │   ├── RegistrationPage.tsx  # Formulir pendaftaran
│   │   ├── CheckStatusPage.tsx   # Cek status pendaftaran
│   │   ├── SuccessPage.tsx       # Halaman sukses
│   │   ├── AdminLoginPage.tsx    # Login admin
│   │   ├── AdminDashboard.tsx    # Dashboard admin
│   │   ├── AdminRegistrations.tsx # Manajemen pendaftaran
│   │   ├── AdminTeams.tsx        # Manajemen tim
│   │   ├── AdminPlayers.tsx      # Manajemen pemain
│   │   ├── AdminSettings.tsx     # Pengaturan
│   │   └── AdminLayout.tsx       # Layout admin
│   └── services/
│       ├── api.ts                # API service (backend)
│       └── demoApi.ts            # Demo mode (tanpa backend)
│
├── server/                       # Backend Node.js
│   ├── server.js                 # Express API server
│   ├── package.json              # Backend dependencies
│   └── .env.example              # Contoh environment variables
│
├── database/
│   └── migration.sql             # SQL migration (PostgreSQL)
│
├── index.html                    # HTML entry
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Contoh frontend env
├── README.md                     # Dokumentasi ini
├── DEPLOYMENT.md                 # Panduan deployment lengkap
└── dist/                         # Build output
```

---

## ⚙️ Persyaratan Instalasi

- **Node.js** v18 atau lebih baru
- **npm** v9 atau lebih baru
- Akun **Neon PostgreSQL** (gratis)
- Akun **Cloudinary** (gratis)
- Akun **Render** atau hosting backend lainnya (gratis)

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Clone dan Install

```bash
# Clone repository
git clone <repository-url>
cd project

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Konfigurasi Environment

#### Frontend
```bash
# Buat file .env di root project
cp .env.example .env
# Edit .env dan isi VITE_API_URL
```

#### Backend
```bash
# Buat file .env di folder server
cd server
cp .env.example .env
# Edit .env dan isi semua variabel
```

### 3. Setup Database

```bash
# Buka Neon SQL Editor
# Copy-paste isi database/migration.sql
# Jalankan migrasi
```

### 4. Jalankan Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 5. Build untuk Production

```bash
npm run build
# Output ada di folder dist/
```

---

## 🔑 Konfigurasi Environment Variables

### Frontend (`.env`)
| Variabel | Contoh | Keterangan |
|----------|--------|------------|
| `VITE_API_URL` | `https://backend.onrender.com/api` | URL backend API |
| `VITE_CLOUDINARY_CLOUD_NAME` | `dxyz1234` | Cloud name Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `padel-league` | Upload preset |

### Backend (`server/.env`)
| Variabel | Contoh | Keterangan |
|----------|--------|------------|
| `DATABASE_URL` | `postgresql://...` | Connection string Neon |
| `JWT_SECRET` | `random-64-char-string` | Secret untuk JWT |
| `CLOUDINARY_CLOUD_NAME` | `dxyz1234` | Cloud name |
| `CLOUDINARY_API_KEY` | `123456789` | API key |
| `CLOUDINARY_API_SECRET` | `secret` | API secret |
| `CORS_ORIGINS` | `https://frontend.com` | Domain yang diizinkan |

---

## 🗄️ Cara Mengatur Database

1. **Buat akun** di https://neon.tech
2. **Buat project** baru (pilih region Singapore)
3. **Salin connection string** dari dashboard
4. **Jalankan migration**: Buka SQL Editor → paste `database/migration.sql` → Run
5. **Ganti password admin**: Generate bcrypt hash → UPDATE admin_users
6. **Verifikasi**: `SELECT * FROM app_settings;` harus mengembalikan 9 baris

### Tabel Database
| Tabel | Fungsi |
|-------|--------|
| `app_settings` | Pengaturan aplikasi (key-value) |
| `admin_users` | Akun admin (bcrypt hashed) |
| `teams` | Data tim terdaftar |
| `players` | Data pemain (relasi ke teams) |
| `registration_logs` | Log aktivitas admin |

---

## 👥 Role dan Akses

### Peserta (Publik)
- Mengisi formulir pendaftaran
- Upload logo tim dan foto pemain
- Melihat preview data
- Menerima nomor pendaftaran
- Cek status pendaftaran
- Cetak bukti pendaftaran

### Admin
- Login dengan username & password
- Melihat semua pendaftaran
- Verifikasi / tolak / minta perbaikan
- Edit data tim dan pemain
- Mengatur batas pemain, status pendaftaran
- Ekspor data ke CSV
- Mengubah pengaturan aplikasi

---

## 📝 Alur Pendaftaran

```
1. Buka halaman utama → Klik "MULAI PENDAFTARAN"
2. Isi data tim:
   - Nama tim (wajib, harus unik)
   - Nama kapten (wajib)
   - WhatsApp kapten (wajib)
   - Kota asal (wajib)
   - Logo tim (opsional)
3. Tambah pemain (1-20 orang):
   - Nama lengkap (wajib)
   - Jenis kelamin (wajib)
   - Posisi bermain: Kiri / Kanan / Kiri & Kanan (wajib)
   - Foto pemain (wajib)
   - Nama panggilan, WhatsApp, keterangan (opsional)
4. Preview → Konfirmasi → Kirim
5. Terima nomor pendaftaran (contoh: SOQ-REG-2026-0001)
6. Admin memverifikasi → Status berubah
7. Peserta cek status dengan nomor + WhatsApp
```

---

## 🎮 Ketentuan Pemain per Tim

- **Minimal**: 1 pemain
- **Maksimal**: 20 pemain
- Setiap pemain didaftarkan secara **individual** (bukan pasangan)
- Setiap pemain terhubung ke satu tim
- Foto pemain **wajib** diunggah
- Jumlah pemain dapat diatur oleh admin di Pengaturan

---

## 🔧 Cara Mengatasi Masalah Umum

### Aplikasi tidak bisa mengirim pendaftaran
- Pastikan `VITE_API_URL` sudah diisi
- Cek backend berjalan dan bisa diakses
- Lihat console browser untuk error

### Foto tidak muncul setelah upload
- Cek koneksi internet
- Verifikasi Cloudinary credentials di backend
- Cek quota Cloudinary

### Admin tidak bisa login
- Pastikan password hash di database sudah benar
- Generate hash baru: `node -e "console.log(require('bcryptjs').hashSync('password', 10))"`

### Data hilang setelah refresh
- Jika mode demo: data tersimpan di memori (hilang saat refresh)
- Jika backend aktif: data tersimpan permanen di database

### Backend lambat pertama kali
- Render free plan: cold start ~30-60 detik
- Solusi: upgrade ke paid plan atau gunakan uptime monitor

---

## 📞 Kontak Panitia

- **WhatsApp**: [+62 814-1227-4044](https://wa.me/6281412274044)
- **Kompetisi**: SOQ.COMM PADEL LEAGUE 2026

---

## 📄 Lisensi

© 2026 SOQ.COMM PADEL LEAGUE. All rights reserved.

Aplikasi ini dikembangkan untuk keperluan kompetisi SOQ.COMM PADEL LEAGUE.
