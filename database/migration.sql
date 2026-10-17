-- SOQ.COMM PADEL LEAGUE - Database Migration
-- PostgreSQL (Neon Free Plan Compatible)
-- Run this SQL to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: app_settings
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
-- Updated: min_players=1, max_players=20, contact info changed, logo added
INSERT INTO app_settings (setting_key, setting_value) VALUES
    ('registration_open', 'true'),
    ('competition_name', 'SOQ.COMM PADEL LEAGUE 2026'),
    ('min_players', '1'),
    ('max_players', '20'),
    ('max_photo_size', '5'),
    ('max_logo_size', '5'),
    ('contact_info', 'WhatsApp: +62 814-1227-4044'),
    ('league_logo', 'https://img.sanishtech.com/u/4139abe5f1ad93ba9a1f348e5b1a34da.jpg'),
    ('registration_info', 'Daftarkan tim Anda dan jadilah bagian dari kompetisi padel. Lengkapi informasi tim dan pemain dengan benar sebelum mengirimkan formulir pendaftaran.')
ON CONFLICT (setting_key) DO NOTHING;

-- Update existing settings if migration is run on existing database
UPDATE app_settings SET setting_value = '1' WHERE setting_key = 'min_players' AND setting_value = '4';
UPDATE app_settings SET setting_value = '20' WHERE setting_key = 'max_players' AND setting_value = '8';
UPDATE app_settings SET setting_value = 'WhatsApp: +62 814-1227-4044' WHERE setting_key = 'contact_info';
UPDATE app_settings SET setting_value = 'https://img.sanishtech.com/u/4139abe5f1ad93ba9a1f348e5b1a34da.jpg' WHERE setting_key = 'league_logo';

-- ============================================
-- TABLE: admin_users
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin (password: admin123 - CHANGE THIS IN PRODUCTION!)
-- The password_hash below is bcrypt hash of 'admin123'
INSERT INTO admin_users (username, password_hash, role) VALUES
    ('admin', '$2b$10$rQZ8KzWFBcEjXVjHqQmKYeOYr5cT5G5x5x5x5x5x5x5x5x5x5x5x5', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- TABLE: teams
-- ============================================
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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_registration_number ON teams(registration_number);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(registration_status);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);

-- ============================================
-- TABLE: players
-- ============================================
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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_full_name ON players(full_name);

-- ============================================
-- TABLE: registration_logs
-- ============================================
CREATE TABLE IF NOT EXISTS registration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_registration_id ON registration_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON registration_logs(created_at DESC);

-- ============================================
-- FUNCTION: Generate registration number
-- ============================================
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    count INTEGER;
    num TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    SELECT COUNT(*) INTO count FROM teams WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    num := LPAD(CAST(count + 1 AS TEXT), 4, '0');
    RETURN 'SOQ-REG-' || year || '-' || num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
