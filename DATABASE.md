# Koneksi Database - SOQ.COMM PADEL LEAGUE

## ✅ Status: TERHUBUNG

Aplikasi ini **sudah terhubung langsung** ke database Neon PostgreSQL.

---

## 📊 Informasi Database

| Item | Nilai |
|------|-------|
| **Provider** | Neon PostgreSQL |
| **Host** | ep-calm-sound-aousqfj3-pooler.c-2.ap-southeast-1.aws.neon.tech |
| **Database** | neondb |
| **Region** | ap-southeast-1 (Singapore) |
| **User** | neondb_owner |
| **Status** | ✅ Aktif & Terhubung |

---

## 🔗 Cara Koneksi

Aplikasi menggunakan **Neon Serverless Driver** (`@neondatabase/serverless`) untuk koneksi langsung dari browser ke database.

### Connection String
```
postgresql://neondb_owner:npg_umgpk6lUJ7zQ@ep-calm-sound-aousqfj3-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Implementasi
File: `src/services/neonDb.ts`

```typescript
import { neon } from '@neondatabase/serverless';

const NEON_CONNECTION_STRING = 'postgresql://...';
const sql = neon(NEON_CONNECTION_STRING);

// Contoh query
const result = await sql`SELECT * FROM teams`;
```

---

## 🗄️ Struktur Database

### Tabel yang Tersedia

1. **app_settings** - Pengaturan aplikasi
   - registration_open
   - competition_name
   - min_players (default: 1)
   - max_players (default: 20)
   - contact_info
   - league_logo
   - dll.

2. **admin_users** - Akun admin
   - username: admin
   - password: admin123 (bcrypt hashed)

3. **teams** - Data tim terdaftar
   - registration_number (unik)
   - team_name
   - captain_name
   - captain_phone
   - city
   - team_logo_url
   - registration_status
   - dll.

4. **players** - Data pemain
   - team_id (foreign key ke teams)
   - full_name
   - gender
   - playing_position
   - player_photo_url
   - dll.

5. **registration_logs** - Log aktivitas admin

---

## 🚀 Cara Kerja

### 1. Inisialisasi Otomatis
Saat aplikasi pertama kali dibuka:
- Database akan otomatis dibuat (jika belum ada)
- Tabel-tabel akan dibuat
- Data default (settings, admin) akan di-insert
- User melihat loading screen "Menghubungkan ke Database..."

### 2. Operasi Database
Semua operasi database dilakukan langsung dari browser:
- **SELECT** - Membaca data
- **INSERT** - Menyimpan data baru
- **UPDATE** - Mengupdate data
- **DELETE** - Menghapus data

### 3. Penyimpanan Gambar
- Jika Cloudinary dikonfigurasi → upload ke Cloudinary
- Jika tidak → simpan sebagai base64 data URL di database
- Base64 cocok untuk demo, tapi tidak disarankan untuk production (ukuran besar)

---

## 🔐 Keamanan

### Catatan Penting
⚠️ **Connection string mengandung password dan terlihat di frontend code.**

Untuk aplikasi production yang serius:
1. Gunakan backend server sebagai proxy
2. Jangan expose connection string di frontend
3. Gunakan environment variables di backend
4. Terapkan row-level security di PostgreSQL
5. Gunakan API keys dengan scope terbatas

Untuk demo/prototype saat ini:
- Koneksi langsung dari browser berfungsi dengan baik
- Cocok untuk testing dan demonstrasi
- Data tersimpan permanen di Neon

---

## 📝 Contoh Penggunaan

### Mendaftar Tim Baru
```typescript
import { teamsApi } from './services/api';

const formData = new FormData();
formData.append('team_name', 'Tim Juara');
formData.append('captain_name', 'John Doe');
formData.append('captain_phone', '081234567890');
formData.append('city', 'Jakarta');
formData.append('players[0][full_name]', 'Player 1');
formData.append('players[0][gender]', 'Laki-laki');
formData.append('players[0][playing_position]', 'Kiri');
formData.append('players[0][photo]', photoFile);

const result = await teamsApi.register(formData);
// result.data.registration_number = 'SOQ-REG-2026-0001'
```

### Cek Status Pendaftaran
```typescript
const result = await teamsApi.getByRegistrationNumber(
  'SOQ-REG-2026-0001',
  '081234567890'
);
// result.data.registration_status = 'MENUNGGU_VERIFIKASI'
```

### Login Admin
```typescript
import { adminApi } from './services/api';

const result = await adminApi.login('admin', 'admin123');
// result.data.token = 'base64_encoded_token'
```

---

## 🛠️ Troubleshooting

### Database Tidak Terhubung
**Gejala:** Muncul error "Gagal Menghubungkan ke Database"

**Solusi:**
1. Cek koneksi internet
2. Verifikasi Neon dashboard → database aktif
3. Pastikan connection string benar
4. Cek Neon quota (free plan: 0.5 GB)

### Data Tidak Tersimpan
**Gejala:** Form submit tapi data tidak muncul di database

**Solusi:**
1. Buka browser console → cek error
2. Verifikasi Neon dashboard → SQL Editor → cek data
3. Pastikan semua field wajib diisi
4. Cek validasi (min/max pemain, ukuran file)

### Gambar Tidak Tampil
**Gejala:** Foto pemain/logo tidak muncul

**Solusi:**
- Jika menggunakan base64: cek ukuran data (terlalu besar?)
- Jika menggunakan Cloudinary: cek credentials dan quota
- Verifikasi URL gambar valid

### Admin Tidak Bisa Login
**Gejala:** Error "Username atau password salah"

**Solusi:**
1. Gunakan kredensial default: admin / admin123
2. Cek tabel admin_users di database
3. Reset password jika perlu:
   ```sql
   UPDATE admin_users 
   SET password_hash = '$2a$10$...' 
   WHERE username = 'admin';
   ```

---

## 📊 Monitoring Database

### Akses Neon Dashboard
1. Login ke https://neon.tech
2. Pilih project: ep-calm-sound-aousqfj3
3. Menu yang tersedia:
   - **Dashboard** - Overview usage
   - **SQL Editor** - Query langsung
   - **Tables** - Lihat struktur tabel
   - **Settings** - Konfigurasi database

### Query Berguna
```sql
-- Lihat semua tim
SELECT * FROM teams ORDER BY created_at DESC;

-- Hitung total pemain
SELECT COUNT(*) FROM players;

-- Lihat pengaturan
SELECT * FROM app_settings;

-- Cek tim dengan status tertentu
SELECT * FROM teams WHERE registration_status = 'MENUNGGU_VERIFIKASI';
```

---

## 🔄 Backup & Restore

### Backup Database
1. Neon Dashboard → SQL Editor
2. Export data:
   ```sql
   COPY teams TO '/path/backup.csv' WITH CSV HEADER;
   ```
3. Atau gunakan Neon's built-in backup (automatic)

### Restore Database
1. Neon Dashboard → SQL Editor
2. Import data:
   ```sql
   COPY teams FROM '/path/backup.csv' WITH CSV HEADER;
   ```

---

## 📞 Support

Jika ada masalah dengan database:
- **Neon Docs:** https://neon.tech/docs
- **Neon Support:** https://neon.tech/support
- **WhatsApp Panitia:** +62 814-1227-4044

---

## ✅ Checklist Koneksi Database

- [x] Connection string dikonfigurasi
- [x] Neon Serverless Driver terinstall
- [x] Tabel-tabel dibuat otomatis
- [x] Data default di-insert
- [x] Aplikasi bisa membaca data
- [x] Aplikasi bisa menulis data
- [x] Admin bisa login
- [x] Pendaftaran tim berfungsi
- [x] Cek status berfungsi
- [x] Upload gambar berfungsi

---

**Terakhir diupdate:** 2026
**Status:** ✅ PRODUCTION READY (untuk demo/prototype)
