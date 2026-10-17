import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Parser } from 'json2csv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const registerLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  message: { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
});

// Multer config for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung.'));
    }
  },
});

// Helper: Upload to Cloudinary
async function uploadToCloudinary(buffer, folder = 'padel-league') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// Helper: Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan.' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    req.adminRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
}

// ============================================
// PUBLIC ROUTES
// ============================================

// Get registration status (public)
app.get('/api/stats/registration-status', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'registration_open'"
    );
    const isOpen = result.rows[0]?.setting_value === 'true';
    res.json({ data: { registration_open: isOpen } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data.' });
  }
});

// Get app settings (public)
app.get('/api/stats/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT setting_key, setting_value FROM app_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json({ data: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil pengaturan.' });
  }
});

// Check registration status (public - requires reg number + phone)
app.get('/api/teams/check-status', async (req, res) => {
  const { registration_number, phone } = req.query;
  
  if (!registration_number || !phone) {
    return res.status(400).json({ error: 'Nomor pendaftaran dan nomor WhatsApp wajib diisi.' });
  }

  try {
    const result = await pool.query(
      `SELECT t.registration_number, t.team_name, t.captain_name, t.registration_status, 
              t.admin_notes, t.created_at,
              COUNT(p.id) as player_count
       FROM teams t
       LEFT JOIN players p ON p.team_id = t.id
       WHERE t.registration_number = $1 AND t.captain_phone = $2
       GROUP BY t.id`,
      [registration_number, phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan. Pastikan nomor pendaftaran dan nomor WhatsApp benar.' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memeriksa status.' });
  }
});

// Register team (public)
app.post('/api/teams/register', registerLimiter, upload.fields([
  { name: 'team_logo', maxCount: 1 },
  { name: 'players[0][photo]', maxCount: 1 },
  { name: 'players[1][photo]', maxCount: 1 },
  { name: 'players[2][photo]', maxCount: 1 },
  { name: 'players[3][photo]', maxCount: 1 },
  { name: 'players[4][photo]', maxCount: 1 },
  { name: 'players[5][photo]', maxCount: 1 },
  { name: 'players[6][photo]', maxCount: 1 },
  { name: 'players[7][photo]', maxCount: 1 },
]), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if registration is open
    const settingsResult = await client.query(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'registration_open'"
    );
    if (settingsResult.rows[0]?.setting_value !== 'true') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Pendaftaran sedang ditutup.' });
    }

    // Get settings for validation
    const minPlayersResult = await client.query(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'min_players'"
    );
    const maxPlayersResult = await client.query(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'max_players'"
    );
    const minPlayers = parseInt(minPlayersResult.rows[0]?.setting_value) || 4;
    const maxPlayers = parseInt(maxPlayersResult.rows[0]?.setting_value) || 8;

    // Parse form data
    const { team_name, captain_name, captain_phone, captain_email, city } = req.body;

    // Validate required fields
    if (!team_name || !captain_name || !captain_phone || !city) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Field wajib belum lengkap.' });
    }

    // Check for duplicate team name
    const duplicateCheck = await client.query(
      'SELECT id FROM teams WHERE LOWER(team_name) = LOWER($1) AND registration_status != $2',
      [team_name, 'DITOLAK']
    );
    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Nama tim sudah terdaftar. Gunakan nama yang berbeda.' });
    }

    // Parse players from form data
    const players = [];
    for (let i = 0; i < maxPlayers; i++) {
      const fullName = req.body[`players[${i}][full_name]`];
      if (!fullName) continue;
      
      players.push({
        full_name: fullName,
        nickname: req.body[`players[${i}][nickname]`] || '',
        phone: req.body[`players[${i}][phone]`] || '',
        gender: req.body[`players[${i}][gender]`] || '',
        playing_position: req.body[`players[${i}][playing_position]`] || '',
        player_strength: req.body[`players[${i}][player_strength]`] || '',
        photo_file: req.files?.[`players[${i}][photo]`]?.[0] || null,
      });
    }

    if (players.length < minPlayers || players.length > maxPlayers) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Jumlah pemain harus antara ${minPlayers} dan ${maxPlayers}.` });
    }

    // Validate each player
    for (const player of players) {
      if (!player.full_name || !player.gender || !player.playing_position) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Data pemain tidak lengkap.' });
      }
      if (!player.photo_file) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Foto pemain "${player.full_name}" wajib diunggah.` });
      }
    }

    // Upload team logo
    let logoUrl = null;
    let logoPublicId = null;
    if (req.files?.team_logo?.[0]) {
      const logoResult = await uploadToCloudinary(req.files.team_logo[0].buffer, 'padel-league/logos');
      logoUrl = logoResult.secure_url;
      logoPublicId = logoResult.public_id;
    }

    // Generate registration number
    const regNumResult = await client.query('SELECT generate_registration_number()');
    const registrationNumber = regNumResult.rows[0].generate_registration_number;

    // Insert team
    const teamResult = await client.query(
      `INSERT INTO teams (registration_number, team_name, captain_name, captain_phone, captain_email, city, team_logo_url, team_logo_public_id, registration_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'MENUNGGU_VERIFIKASI')
       RETURNING id, registration_number`,
      [registrationNumber, team_name, captain_name, captain_phone, captain_email || null, city, logoUrl, logoPublicId]
    );

    const teamId = teamResult.rows[0].id;

    // Upload player photos and insert players
    for (const player of players) {
      let photoUrl = null;
      let photoPublicId = null;
      
      if (player.photo_file) {
        const photoResult = await uploadToCloudinary(player.photo_file.buffer, 'padel-league/players');
        photoUrl = photoResult.secure_url;
        photoPublicId = photoResult.public_id;
      }

      await client.query(
        `INSERT INTO players (team_id, full_name, nickname, phone, gender, playing_position, player_photo_url, player_photo_public_id, player_strength)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [teamId, player.full_name, player.nickname, player.phone, player.gender, player.playing_position, photoUrl, photoPublicId, player.player_strength]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        id: teamId,
        registration_number: registrationNumber,
      },
      message: 'Pendaftaran berhasil!',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Gagal memproses pendaftaran. Silakan coba lagi.' });
  } finally {
    client.release();
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Admin login
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      data: { token, username: admin.username, role: admin.role },
      message: 'Login berhasil.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal login.' });
  }
});

// Admin dashboard
app.get('/api/admin/dashboard', authMiddleware, async (req, res) => {
  try {
    const [totalReg, pending, verified, needsRevision, totalPlayers, recent] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM teams'),
      pool.query("SELECT COUNT(*) FROM teams WHERE registration_status = 'MENUNGGU_VERIFIKASI'"),
      pool.query("SELECT COUNT(*) FROM teams WHERE registration_status = 'DIVERIFIKASI'"),
      pool.query("SELECT COUNT(*) FROM teams WHERE registration_status = 'PERLU_PERBAIKAN'"),
      pool.query('SELECT COUNT(*) FROM players'),
      pool.query('SELECT * FROM teams ORDER BY created_at DESC LIMIT 5'),
    ]);

    res.json({
      data: {
        total_registrations: parseInt(totalReg.rows[0].count),
        pending_verification: parseInt(pending.rows[0].count),
        verified: parseInt(verified.rows[0].count),
        needs_revision: parseInt(needsRevision.rows[0].count),
        total_players: parseInt(totalPlayers.rows[0].count),
        recent_registrations: recent.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat dashboard.' });
  }
});

// Get all teams
app.get('/api/teams', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, COUNT(p.id) as player_count
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data tim.' });
  }
});

// Get team by ID
app.get('/api/teams/:id', authMiddleware, async (req, res) => {
  try {
    const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [req.params.id]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tim tidak ditemukan.' });
    }
    const playersResult = await pool.query('SELECT * FROM players WHERE team_id = $1 ORDER BY created_at', [req.params.id]);
    res.json({ data: { ...teamResult.rows[0], players: playersResult.rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data.' });
  }
});

// Update team
app.put('/api/teams/:id', authMiddleware, async (req, res) => {
  const { team_name, captain_name, captain_phone, captain_email, city, is_active } = req.body;
  try {
    await pool.query(
      `UPDATE teams SET team_name=$1, captain_name=$2, captain_phone=$3, captain_email=$4, city=$5, is_active=$6 WHERE id=$7`,
      [team_name, captain_name, captain_phone, captain_email, city, is_active, req.params.id]
    );
    res.json({ message: 'Data tim berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui data.' });
  }
});

// Update team status
app.patch('/api/teams/:id/status', authMiddleware, async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['MENUNGGU_VERIFIKASI', 'DIVERIFIKASI', 'PERLU_PERBAIKAN', 'DITOLAK'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid.' });
  }

  try {
    await pool.query(
      'UPDATE teams SET registration_status=$1, admin_notes=$2 WHERE id=$3',
      [status, notes || null, req.params.id]
    );
    
    // Log the action
    await pool.query(
      'INSERT INTO registration_logs (registration_id, admin_id, action, notes) VALUES ($1, $2, $3, $4)',
      [req.params.id, req.adminId, `STATUS_CHANGE_${status}`, notes]
    );

    res.json({ message: 'Status berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui status.' });
  }
});

// Delete team
app.delete('/api/teams/:id', authMiddleware, async (req, res) => {
  try {
    // Delete associated Cloudinary images first (optional, can be done async)
    const teamResult = await pool.query('SELECT team_logo_public_id FROM teams WHERE id = $1', [req.params.id]);
    const playersResult = await pool.query('SELECT player_photo_public_id FROM players WHERE team_id = $1', [req.params.id]);
    
    // Delete from Cloudinary (non-blocking)
    if (teamResult.rows[0]?.team_logo_public_id) {
      cloudinary.uploader.destroy(teamResult.rows[0].team_logo_public_id).catch(console.error);
    }
    for (const player of playersResult.rows) {
      if (player.player_photo_public_id) {
        cloudinary.uploader.destroy(player.player_photo_public_id).catch(console.error);
      }
    }

    await pool.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tim dan data terkait berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus data.' });
  }
});

// Get all players
app.get('/api/players', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM players ORDER BY created_at DESC');
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data pemain.' });
  }
});

// Get players by team
app.get('/api/players/team/:teamId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM players WHERE team_id = $1 ORDER BY created_at', [req.params.teamId]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data pemain.' });
  }
});

// Update player
app.put('/api/players/:id', authMiddleware, async (req, res) => {
  const { full_name, nickname, phone, gender, playing_position, player_strength } = req.body;
  try {
    await pool.query(
      `UPDATE players SET full_name=$1, nickname=$2, phone=$3, gender=$4, playing_position=$5, player_strength=$6 WHERE id=$7`,
      [full_name, nickname, phone, gender, playing_position, player_strength, req.params.id]
    );
    res.json({ message: 'Data pemain berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui data.' });
  }
});

// Transfer player to another team
app.patch('/api/players/:id/transfer', authMiddleware, async (req, res) => {
  const { new_team_id } = req.body;
  try {
    // Validate target team exists and check player count
    const targetTeam = await pool.query('SELECT id FROM teams WHERE id = $1', [new_team_id]);
    if (targetTeam.rows.length === 0) {
      return res.status(404).json({ error: 'Tim tujuan tidak ditemukan.' });
    }

    const maxResult = await pool.query("SELECT setting_value FROM app_settings WHERE setting_key = 'max_players'");
    const maxPlayers = parseInt(maxResult.rows[0]?.setting_value) || 8;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM players WHERE team_id = $1', [new_team_id]);
    if (parseInt(countResult.rows[0].count) >= maxPlayers) {
      return res.status(400).json({ error: 'Tim tujuan sudah mencapai batas maksimal pemain.' });
    }

    await pool.query('UPDATE players SET team_id = $1 WHERE id = $2', [new_team_id, req.params.id]);
    res.json({ message: 'Pemain berhasil dipindahkan.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memindahkan pemain.' });
  }
});

// Delete player
app.delete('/api/players/:id', authMiddleware, async (req, res) => {
  try {
    const playerResult = await pool.query('SELECT player_photo_public_id FROM players WHERE id = $1', [req.params.id]);
    if (playerResult.rows[0]?.player_photo_public_id) {
      cloudinary.uploader.destroy(playerResult.rows[0].player_photo_public_id).catch(console.error);
    }
    await pool.query('DELETE FROM players WHERE id = $1', [req.params.id]);
    res.json({ message: 'Pemain berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus pemain.' });
  }
});

// Get admin settings
app.get('/api/admin/settings', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT setting_key, setting_value FROM app_settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.setting_key] = row.setting_value; });
    res.json({ data: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil pengaturan.' });
  }
});

// Update admin settings
app.put('/api/admin/settings', authMiddleware, async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await pool.query(
        "INSERT INTO app_settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()",
        [key, String(value)]
      );
    }
    res.json({ message: 'Pengaturan berhasil disimpan.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan pengaturan.' });
  }
});

// Export CSV
app.get('/api/admin/export/csv', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.registration_number, t.team_name, t.captain_name, t.captain_phone, t.captain_email,
             t.city, t.registration_status, t.created_at, COUNT(p.id) as player_count
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    const fields = ['registration_number', 'team_name', 'captain_name', 'captain_phone', 'captain_email', 'city', 'registration_status', 'created_at', 'player_count'];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('registrations.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengekspor data.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SOQ.COMM PADEL LEAGUE API running on port ${PORT}`);
});
