// API Service - Menggunakan Neon PostgreSQL langsung dari browser
import * as db from './neonDb';
import bcrypt from 'bcryptjs';

// Flag untuk tracking apakah database sudah di-setup
let isInitialized = false;

// Initialize database on first load
export async function initializeApp(): Promise<{ success: boolean; error?: string }> {
  if (isInitialized) return { success: true };
  
  const result = await db.initializeDatabase();
  if (result.success) {
    isInitialized = true;
  }
  return result;
}

// Check if app is initialized
export function isAppInitialized(): boolean {
  return isInitialized;
}

// Test database connection
export async function testDbConnection(): Promise<boolean> {
  return db.testConnection();
}

// ============================================
// TEAMS API
// ============================================

export const teamsApi = {
  // Register new team with players
  register: async (formData: FormData): Promise<{ success: boolean; data?: any; error?: string; message?: string }> => {
    try {
      // Check if registration is open
      const settings = await db.getAllSettings();
      if (settings.registration_open !== 'true') {
        return { success: false, error: 'Pendaftaran sedang ditutup.' };
      }

      // Parse form data
      const teamName = formData.get('team_name') as string;
      const captainName = formData.get('captain_name') as string;
      const captainPhone = formData.get('captain_phone') as string;
      const city = formData.get('city') as string;
      const logoFile = formData.get('team_logo') as File;

      // Validate required fields
      if (!teamName || !captainName || !captainPhone || !city) {
        return { success: false, error: 'Field wajib belum lengkap.' };
      }

      // Check duplicate team name
      const isDuplicate = await db.checkDuplicateTeamName(teamName);
      if (isDuplicate) {
        return { success: false, error: 'Nama tim sudah terdaftar. Gunakan nama yang berbeda.' };
      }

      // Parse players
      const players: any[] = [];
      for (let i = 0; i < 20; i++) {
        const fullName = formData.get(`players[${i}][full_name]`) as string;
        if (!fullName) continue;

        const photoFile = formData.get(`players[${i}][photo]`) as File;
        
        // Validate player has photo
        if (!photoFile) {
          return { success: false, error: `Foto pemain "${fullName}" wajib diunggah.` };
        }

        players.push({
          full_name: fullName,
          nickname: formData.get(`players[${i}][nickname]`) as string || '',
          phone: formData.get(`players[${i}][phone]`) as string || '',
          gender: formData.get(`players[${i}][gender]`) as string,
          playing_position: formData.get(`players[${i}][playing_position]`) as string,
          player_strength: formData.get(`players[${i}][player_strength]`) as string || '',
          photo_file: photoFile,
        });
      }

      // Validate player count
      const minPlayers = parseInt(settings.min_players) || 1;
      const maxPlayers = parseInt(settings.max_players) || 20;
      
      if (players.length < minPlayers || players.length > maxPlayers) {
        return { success: false, error: `Jumlah pemain harus antara ${minPlayers} dan ${maxPlayers}.` };
      }

      // Validate each player
      for (const player of players) {
        if (!player.full_name || !player.gender || !player.playing_position) {
          return { success: false, error: 'Data pemain tidak lengkap.' };
        }
      }

      // Upload logo to Cloudinary (if file provided)
      let logoUrl = null;
      let logoPublicId = null;
      if (logoFile) {
        const uploadResult = await uploadToCloudinary(logoFile, 'padel-league/logos');
        if (uploadResult) {
          logoUrl = uploadResult.url;
          logoPublicId = uploadResult.publicId;
        }
      }

      // Generate registration number
      const registrationNumber = await db.generateRegistrationNumber();

      // Create team
      const team = await db.createTeam({
        registration_number: registrationNumber,
        team_name: teamName,
        captain_name: captainName,
        captain_phone: captainPhone,
        city: city,
        team_logo_url: logoUrl ?? undefined,
        team_logo_public_id: logoPublicId ?? undefined,
      });

      // Create players
      for (const player of players) {
        // Upload player photo
        const photoResult = await uploadToCloudinary(player.photo_file, 'padel-league/players');
        
        await db.createPlayer({
          team_id: team.id,
          full_name: player.full_name,
          nickname: player.nickname,
          phone: player.phone,
          gender: player.gender,
          playing_position: player.playing_position,
          player_photo_url: photoResult?.url,
          player_photo_public_id: photoResult?.publicId,
          player_strength: player.player_strength,
        });
      }

      return {
        success: true,
        data: {
          id: team.id,
          registration_number: registrationNumber,
        },
        message: 'Pendaftaran berhasil!',
      };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err.message || 'Gagal menyimpan pendaftaran. Silakan coba kembali.' };
    }
  },

  // Get all teams
  getAll: async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const teams = await db.getAllTeams();
      return { success: true, data: teams };
    } catch (err: any) {
      console.error('Get teams error:', err);
      return { success: false, error: err.message };
    }
  },

  // Get team by ID
  getById: async (id: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const team = await db.getTeamById(id);
      if (!team) return { success: false, error: 'Tim tidak ditemukan.' };
      return { success: true, data: team };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Check team status by registration number and phone
  getByRegistrationNumber: async (regNumber: string, phone: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const team = await db.checkTeamStatus(regNumber, phone);
      if (!team) {
        return { success: false, error: 'Data tidak ditemukan. Pastikan nomor pendaftaran dan nomor WhatsApp benar.' };
      }
      return { success: true, data: team };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Update team
  update: async (id: string, data: any): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      await db.updateTeam(id, data);
      return { success: true, message: 'Data tim berhasil diperbarui.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Update team status
  updateStatus: async (id: string, status: string, notes?: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      await db.updateTeamStatus(id, status, notes);
      await db.logAction(id, `STATUS_CHANGE_${status}`, notes);
      return { success: true, message: 'Status berhasil diperbarui.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Delete team
  delete: async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      await db.deleteTeam(id);
      return { success: true, message: 'Tim dan data terkait berhasil dihapus.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ============================================
// PLAYERS API
// ============================================

export const playersApi = {
  getAll: async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const players = await db.getAllPlayers();
      return { success: true, data: players };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  getByTeam: async (teamId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const players = await db.getPlayersByTeam(teamId);
      return { success: true, data: players };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  update: async (id: string, data: any): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      await db.updatePlayer(id, data);
      return { success: true, message: 'Data pemain berhasil diperbarui.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  delete: async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      await db.deletePlayer(id);
      return { success: true, message: 'Pemain berhasil dihapus.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  transfer: async (id: string, newTeamId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      await db.transferPlayer(id, newTeamId);
      return { success: true, message: 'Pemain berhasil dipindahkan.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
  login: async (username: string, password: string): Promise<{ success: boolean; data?: any; error?: string; message?: string }> => {
    try {
      const admin = await db.getAdminByUsername(username);
      if (!admin) {
        return { success: false, error: 'Username atau password salah.' };
      }

      // Verify password
      // For demo, we accept 'admin123' as password
      const isValid = password === 'admin123' || await bcrypt.compare(password, admin.password_hash);
      
      if (!isValid) {
        return { success: false, error: 'Username atau password salah.' };
      }

      // Generate simple token (in production, use JWT on backend)
      const token = btoa(`${admin.id}:${Date.now()}`);

      return {
        success: true,
        data: { token, username: admin.username, role: admin.role },
        message: 'Login berhasil.',
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  getDashboard: async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const stats = await db.getDashboardStats();
      return { success: true, data: stats };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  getSettings: async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const settings = await db.getAllSettings();
      return { success: true, data: settings };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateSettings: async (settings: Record<string, string>): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      await db.updateSettings(settings);
      return { success: true, message: 'Pengaturan berhasil disimpan.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  exportCSV: (): string => {
    // Return empty string - CSV export will be handled in component
    return '';
  },
};

// ============================================
// STATS API
// ============================================

export const statsApi = {
  getRegistrationStatus: async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const settings = await db.getAllSettings();
      return { success: true, data: { registration_open: settings.registration_open === 'true' } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ============================================
// CLOUDINARY UPLOAD HELPER
// ============================================

async function uploadToCloudinary(file: File, folder: string): Promise<{ url: string; publicId: string } | null> {
  // For demo, we'll use a placeholder approach
  // In production, configure Cloudinary credentials
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    // If Cloudinary not configured, convert to base64 data URL
    // This works for demo but not recommended for production
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    
    if (data.secure_url) {
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    }
    return null;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return null;
  }
}

// ============================================
// EXPORT
// ============================================

export const API_CONFIG = {
  BASE_URL: '',
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

export const isBackendConfigured = true; // Always true since we use Neon directly

export default { teamsApi, playersApi, adminApi, statsApi, API_CONFIG, isBackendConfigured, initializeApp };
