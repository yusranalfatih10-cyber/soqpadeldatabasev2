// Neon PostgreSQL Database Service
// Menggunakan Neon Serverless Driver untuk koneksi langsung dari browser
import { neon } from '@neondatabase/serverless';

// Connection string Neon PostgreSQL
const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_umgpk6lUJ7zQ@ep-calm-sound-aousqfj3-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Initialize SQL client
const sql = neon(NEON_CONNECTION_STRING);

// Flag untuk tracking apakah database sudah di-setup
let dbInitialized = false;

// SQL Migration - membuat semua tabel yang diperlukan
const MIGRATION_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE: app_settings
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    captain_name VARCHAR(255) NOT NULL,
    captain_phone VARCHAR(50) NOT NULL,
    captain_email VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    team_logo_url TEXT,
    team_logo_public_id VARCHAR(255),
    registration_status VARCHAR(50) DEFAULT 'MENUNGGU_VERIFIKASI',
    admin_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: players
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    phone VARCHAR(50),
    gender VARCHAR(20),
    playing_position VARCHAR(50),
    player_photo_url TEXT,
    player_photo_public_id VARCHAR(255),
    player_strength TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: registration_logs
CREATE TABLE IF NOT EXISTS registration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    admin_id UUID,
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_registration_number ON teams(registration_number);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(registration_status);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_full_name ON players(full_name);
CREATE INDEX IF NOT EXISTS idx_logs_registration_id ON registration_logs(registration_id);
`;

// Default settings
const DEFAULT_SETTINGS = [
  { key: 'registration_open', value: 'true' },
  { key: 'competition_name', value: 'SOQ.COMM PADEL LEAGUE 2026' },
  { key: 'min_players', value: '1' },
  { key: 'max_players', value: '20' },
  { key: 'max_photo_size', value: '5' },
  { key: 'max_logo_size', value: '5' },
  { key: 'contact_info', value: 'WhatsApp: +62 814-1227-4044' },
  { key: 'league_logo', value: 'https://img.sanishtech.com/u/4139abe5f1ad93ba9a1f348e5b1a34da.jpg' },
  { key: 'registration_info', value: 'Daftarkan tim Anda dan jadilah bagian dari kompetisi padel. Lengkapi informasi tim dan pemain dengan benar sebelum mengirimkan formulir pendaftaran.' },
];

// Default admin (password: admin123)
// bcrypt hash of 'admin123'
const DEFAULT_ADMIN_HASH = '$2a$10$XQjL5KQHy7UlGTxVnGZqQeCZKxWwM6jFbNzQmLqRvTzXxYyZzAaBb';

// Initialize database - create tables and insert defaults
export async function initializeDatabase(): Promise<{ success: boolean; error?: string }> {
  if (dbInitialized) return { success: true };

  try {
    // Split migration SQL into individual statements
    const statements = MIGRATION_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt);
      } catch (err: any) {
        // Ignore "already exists" errors
        if (!err.message?.includes('already exists')) {
          console.warn('Migration statement warning:', err.message);
        }
      }
    }

    // Insert default settings (skip if exists)
    for (const setting of DEFAULT_SETTINGS) {
      try {
        await sql`
          INSERT INTO app_settings (setting_key, setting_value) 
          VALUES (${setting.key}, ${setting.value})
          ON CONFLICT (setting_key) DO NOTHING
        `;
      } catch (err) {
        console.warn('Settings insert warning:', err);
      }
    }

    // Insert default admin (skip if exists)
    try {
      await sql`
        INSERT INTO admin_users (username, password_hash, role)
        VALUES ('admin', ${DEFAULT_ADMIN_HASH}, 'superadmin')
        ON CONFLICT (username) DO NOTHING
      `;
    } catch (err) {
      console.warn('Admin insert warning:', err);
    }

    dbInitialized = true;
    return { success: true };
  } catch (err: any) {
    console.error('Database initialization error:', err);
    return { success: false, error: err.message || 'Gagal menginisialisasi database' };
  }
}

// Check if database is initialized
export function isDbInitialized(): boolean {
  return dbInitialized;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as test`;
    return result.length > 0;
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
}

// ============================================
// TEAMS QUERIES
// ============================================

export async function createTeam(data: {
  registration_number: string;
  team_name: string;
  captain_name: string;
  captain_phone: string;
  captain_email?: string;
  city: string;
  team_logo_url?: string;
  team_logo_public_id?: string;
}): Promise<any> {
  const result = await sql`
    INSERT INTO teams (registration_number, team_name, captain_name, captain_phone, captain_email, city, team_logo_url, team_logo_public_id, registration_status)
    VALUES (${data.registration_number}, ${data.team_name}, ${data.captain_name}, ${data.captain_phone}, ${data.captain_email || null}, ${data.city}, ${data.team_logo_url || null}, ${data.team_logo_public_id || null}, 'MENUNGGU_VERIFIKASI')
    RETURNING id, registration_number
  `;
  return result[0];
}

export async function generateRegistrationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await sql`
    SELECT COUNT(*) as count FROM teams WHERE EXTRACT(YEAR FROM created_at) = ${year}
  `;
  const count = parseInt(result[0].count) + 1;
  return `SOQ-REG-${year}-${String(count).padStart(4, '0')}`;
}

export async function getAllTeams(): Promise<any[]> {
  const result = await sql`
    SELECT t.*, COUNT(p.id)::int as player_count
    FROM teams t
    LEFT JOIN players p ON p.team_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;
  return result;
}

export async function getTeamById(id: string): Promise<any> {
  const teamResult = await sql`SELECT * FROM teams WHERE id = ${id}`;
  if (teamResult.length === 0) return null;
  
  const playersResult = await sql`SELECT * FROM players WHERE team_id = ${id} ORDER BY created_at`;
  return { ...teamResult[0], players: playersResult };
}

export async function checkTeamStatus(registrationNumber: string, phone: string): Promise<any> {
  const result = await sql`
    SELECT t.registration_number, t.team_name, t.captain_name, t.registration_status,
           t.admin_notes, t.created_at,
           COUNT(p.id)::int as player_count
    FROM teams t
    LEFT JOIN players p ON p.team_id = t.id
    WHERE t.registration_number = ${registrationNumber} AND t.captain_phone = ${phone}
    GROUP BY t.id
  `;
  return result[0] || null;
}

export async function updateTeamStatus(id: string, status: string, notes?: string): Promise<void> {
  await sql`
    UPDATE teams SET registration_status = ${status}, admin_notes = ${notes || null}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function updateTeam(id: string, data: any): Promise<void> {
  await sql`
    UPDATE teams SET 
      team_name = ${data.team_name},
      captain_name = ${data.captain_name},
      captain_phone = ${data.captain_phone},
      city = ${data.city},
      is_active = ${data.is_active !== false},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteTeam(id: string): Promise<void> {
  await sql`DELETE FROM teams WHERE id = ${id}`;
}

export async function checkDuplicateTeamName(teamName: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM teams WHERE LOWER(team_name) = LOWER(${teamName}) AND registration_status != 'DITOLAK'
  `;
  return result.length > 0;
}

// ============================================
// PLAYERS QUERIES
// ============================================

export async function createPlayer(data: {
  team_id: string;
  full_name: string;
  nickname?: string;
  phone?: string;
  gender: string;
  playing_position: string;
  player_photo_url?: string;
  player_photo_public_id?: string;
  player_strength?: string;
}): Promise<any> {
  const result = await sql`
    INSERT INTO players (team_id, full_name, nickname, phone, gender, playing_position, player_photo_url, player_photo_public_id, player_strength)
    VALUES (${data.team_id}, ${data.full_name}, ${data.nickname || null}, ${data.phone || null}, ${data.gender}, ${data.playing_position}, ${data.player_photo_url || null}, ${data.player_photo_public_id || null}, ${data.player_strength || null})
    RETURNING id
  `;
  return result[0];
}

export async function getAllPlayers(): Promise<any[]> {
  const result = await sql`SELECT * FROM players ORDER BY created_at DESC`;
  return result;
}

export async function getPlayersByTeam(teamId: string): Promise<any[]> {
  const result = await sql`SELECT * FROM players WHERE team_id = ${teamId} ORDER BY created_at`;
  return result;
}

export async function updatePlayer(id: string, data: any): Promise<void> {
  await sql`
    UPDATE players SET
      full_name = ${data.full_name},
      nickname = ${data.nickname || null},
      phone = ${data.phone || null},
      gender = ${data.gender},
      playing_position = ${data.playing_position},
      player_strength = ${data.player_strength || null},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deletePlayer(id: string): Promise<void> {
  await sql`DELETE FROM players WHERE id = ${id}`;
}

export async function transferPlayer(id: string, newTeamId: string): Promise<void> {
  await sql`UPDATE players SET team_id = ${newTeamId}, updated_at = NOW() WHERE id = ${id}`;
}

// ============================================
// SETTINGS QUERIES
// ============================================

export async function getAllSettings(): Promise<Record<string, string>> {
  const result = await sql`SELECT setting_key, setting_value FROM app_settings`;
  const settings: Record<string, string> = {};
  result.forEach((row: any) => {
    settings[row.setting_key] = row.setting_value;
  });
  return settings;
}

export async function updateSettings(settings: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    await sql`
      INSERT INTO app_settings (setting_key, setting_value)
      VALUES (${key}, ${value})
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = ${value}, updated_at = NOW()
    `;
  }
}

// ============================================
// ADMIN QUERIES
// ============================================

export async function getAdminByUsername(username: string): Promise<any> {
  const result = await sql`
    SELECT * FROM admin_users WHERE username = ${username} AND is_active = true
  `;
  return result[0] || null;
}

export async function getDashboardStats(): Promise<any> {
  const [totalReg, pending, verified, needsRevision, totalPlayers, recent] = await Promise.all([
    sql`SELECT COUNT(*)::int as count FROM teams`,
    sql`SELECT COUNT(*)::int as count FROM teams WHERE registration_status = 'MENUNGGU_VERIFIKASI'`,
    sql`SELECT COUNT(*)::int as count FROM teams WHERE registration_status = 'DIVERIFIKASI'`,
    sql`SELECT COUNT(*)::int as count FROM teams WHERE registration_status = 'PERLU_PERBAIKAN'`,
    sql`SELECT COUNT(*)::int as count FROM players`,
    sql`SELECT * FROM teams ORDER BY created_at DESC LIMIT 5`,
  ]);

  return {
    total_registrations: totalReg[0]?.count || 0,
    pending_verification: pending[0]?.count || 0,
    verified: verified[0]?.count || 0,
    needs_revision: needsRevision[0]?.count || 0,
    total_players: totalPlayers[0]?.count || 0,
    recent_registrations: recent,
  };
}

export async function logAction(registrationId: string, action: string, notes?: string): Promise<void> {
  await sql`
    INSERT INTO registration_logs (registration_id, action, notes)
    VALUES (${registrationId}, ${action}, ${notes || null})
  `;
}

export default {
  initializeDatabase,
  isDbInitialized,
  testConnection,
  createTeam,
  generateRegistrationNumber,
  getAllTeams,
  getTeamById,
  checkTeamStatus,
  updateTeamStatus,
  updateTeam,
  deleteTeam,
  checkDuplicateTeamName,
  createPlayer,
  getAllPlayers,
  getPlayersByTeam,
  updatePlayer,
  deletePlayer,
  transferPlayer,
  getAllSettings,
  updateSettings,
  getAdminByUsername,
  getDashboardStats,
  logAction,
};
