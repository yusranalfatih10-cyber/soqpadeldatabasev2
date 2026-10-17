// Demo mode - used when backend is not configured
// This provides a fully functional UI for demonstration purposes
// In production, all data goes through the backend API

interface DemoTeam {
  id: string;
  registration_number: string;
  team_name: string;
  captain_name: string;
  captain_phone: string;
  captain_email: string;
  city: string;
  team_logo_url: string;
  registration_status: string;
  admin_notes: string;
  is_active: boolean;
  created_at: string;
  players: DemoPlayer[];
}

interface DemoPlayer {
  id: string;
  team_id: string;
  full_name: string;
  nickname: string;
  phone: string;
  gender: string;
  playing_position: string;
  player_photo_url: string;
  player_strength: string;
}

let demoTeams: DemoTeam[] = [];
let demoCounter = 0;
let demoAdminLoggedIn = false;

function generateRegNumber(): string {
  demoCounter++;
  const year = new Date().getFullYear();
  return `SOQ-REG-${year}-${String(demoCounter).padStart(4, '0')}`;
}

export const demoApi = {
  // Teams
  registerTeam: async (formData: FormData) => {
    const teamName = formData.get('team_name') as string;
    const captainName = formData.get('captain_name') as string;
    const captainPhone = formData.get('captain_phone') as string;
    const city = formData.get('city') as string;
    const logoFile = formData.get('team_logo') as File;

    const players: DemoPlayer[] = [];
    // Support up to 20 players
    for (let i = 0; i < 20; i++) {
      const fullName = formData.get(`players[${i}][full_name]`) as string;
      if (!fullName) continue;
      
      const photoFile = formData.get(`players[${i}][photo]`) as File;
      players.push({
        id: crypto.randomUUID(),
        team_id: '',
        full_name: fullName,
        nickname: formData.get(`players[${i}][nickname]`) as string || '',
        phone: formData.get(`players[${i}][phone]`) as string || '',
        gender: formData.get(`players[${i}][gender]`) as string || '',
        playing_position: formData.get(`players[${i}][playing_position]`) as string || '',
        player_photo_url: photoFile ? URL.createObjectURL(photoFile) : '',
        player_strength: formData.get(`players[${i}][player_strength]`) as string || '',
      });
    }

    const teamId = crypto.randomUUID();
    const regNumber = generateRegNumber();
    
    const team: DemoTeam = {
      id: teamId,
      registration_number: regNumber,
      team_name: teamName,
      captain_name: captainName,
      captain_phone: captainPhone,
      captain_email: '',
      city: city,
      team_logo_url: logoFile ? URL.createObjectURL(logoFile) : '',
      registration_status: 'MENUNGGU_VERIFIKASI',
      admin_notes: '',
      is_active: true,
      created_at: new Date().toISOString(),
      players: players.map(p => ({ ...p, team_id: teamId })),
    };

    demoTeams.push(team);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: { id: teamId, registration_number: regNumber },
      message: 'Pendaftaran berhasil!',
    };
  },

  getAllTeams: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      data: demoTeams.map(t => ({
        ...t,
        player_count: t.players.length,
      })),
    };
  },

  getTeamById: async (id: string) => {
    const team = demoTeams.find(t => t.id === id);
    if (!team) return { success: false, error: 'Tim tidak ditemukan.' };
    return { success: true, data: team };
  },

  checkStatus: async (regNumber: string, phone: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const team = demoTeams.find(
      t => t.registration_number === regNumber && t.captain_phone === phone
    );
    if (!team) return { success: false, error: 'Data tidak ditemukan.' };
    return {
      success: true,
      data: {
        registration_number: team.registration_number,
        team_name: team.team_name,
        captain_name: team.captain_name,
        player_count: team.players.length,
        created_at: team.created_at,
        registration_status: team.registration_status,
        admin_notes: team.admin_notes,
      },
    };
  },

  updateTeamStatus: async (id: string, status: string, notes?: string) => {
    const team = demoTeams.find(t => t.id === id);
    if (!team) return { success: false, error: 'Tim tidak ditemukan.' };
    team.registration_status = status;
    team.admin_notes = notes || '';
    return { success: true, message: 'Status berhasil diperbarui.' };
  },

  updateTeam: async (id: string, data: any) => {
    const team = demoTeams.find(t => t.id === id);
    if (!team) return { success: false, error: 'Tim tidak ditemukan.' };
    Object.assign(team, data);
    return { success: true, message: 'Data berhasil diperbarui.' };
  },

  deleteTeam: async (id: string) => {
    demoTeams = demoTeams.filter(t => t.id !== id);
    return { success: true, message: 'Tim berhasil dihapus.' };
  },

  // Players
  getAllPlayers: async () => {
    const allPlayers = demoTeams.flatMap(t => t.players);
    return { success: true, data: allPlayers };
  },

  updatePlayer: async (id: string, data: any) => {
    for (const team of demoTeams) {
      const player = team.players.find(p => p.id === id);
      if (player) {
        Object.assign(player, data);
        return { success: true, message: 'Data pemain berhasil diperbarui.' };
      }
    }
    return { success: false, error: 'Pemain tidak ditemukan.' };
  },

  deletePlayer: async (id: string) => {
    for (const team of demoTeams) {
      const idx = team.players.findIndex(p => p.id === id);
      if (idx !== -1) {
        team.players.splice(idx, 1);
        return { success: true, message: 'Pemain berhasil dihapus.' };
      }
    }
    return { success: false, error: 'Pemain tidak ditemukan.' };
  },

  transferPlayer: async (id: string, newTeamId: string) => {
    let player: DemoPlayer | null = null;
    let sourceTeam: DemoTeam | null = null;
    
    for (const team of demoTeams) {
      const idx = team.players.findIndex(p => p.id === id);
      if (idx !== -1) {
        player = team.players[idx];
        sourceTeam = team;
        break;
      }
    }
    
    if (!player || !sourceTeam) return { success: false, error: 'Pemain tidak ditemukan.' };
    
    const targetTeam = demoTeams.find(t => t.id === newTeamId);
    if (!targetTeam) return { success: false, error: 'Tim tujuan tidak ditemukan.' };
    
    sourceTeam.players = sourceTeam.players.filter(p => p.id !== id);
    player.team_id = newTeamId;
    targetTeam.players.push(player);
    
    return { success: true, message: 'Pemain berhasil dipindahkan.' };
  },

  // Admin
  login: async (username: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (username === 'admin' && password === 'admin123') {
      demoAdminLoggedIn = true;
      return {
        success: true,
        data: { token: 'demo-token', username: 'admin', role: 'superadmin' },
        message: 'Login berhasil.',
      };
    }
    return { success: false, error: 'Username atau password salah.' };
  },

  getDashboard: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const totalPlayers = demoTeams.reduce((sum, t) => sum + t.players.length, 0);
    return {
      success: true,
      data: {
        total_registrations: demoTeams.length,
        pending_verification: demoTeams.filter(t => t.registration_status === 'MENUNGGU_VERIFIKASI').length,
        verified: demoTeams.filter(t => t.registration_status === 'DIVERIFIKASI').length,
        needs_revision: demoTeams.filter(t => t.registration_status === 'PERLU_PERBAIKAN').length,
        total_players: totalPlayers,
        recent_registrations: demoTeams.slice(-5).reverse(),
      },
    };
  },

  getSettings: async () => {
    return {
      success: true,
      data: {
        registration_open: 'true',
        competition_name: 'SOQ.COMM PADEL LEAGUE 2026',
        min_players: '1',
        max_players: '20',
        max_photo_size: '5',
        max_logo_size: '5',
        contact_info: 'WhatsApp: +62 814-1227-4044',
        league_logo: 'https://img.sanishtech.com/u/4139abe5f1ad93ba9a1f348e5b1a34da.jpg',
        registration_info: 'Daftarkan tim Anda dan jadilah bagian dari kompetisi padel. Lengkapi informasi tim dan pemain dengan benar sebelum mengirimkan formulir pendaftaran.',
      },
    };
  },

  updateSettings: async (settings: Record<string, string>) => {
    return { success: true, message: 'Pengaturan berhasil disimpan.' };
  },

  exportCSV: () => {
    const fields = ['registration_number', 'team_name', 'captain_name', 'captain_phone', 'city', 'registration_status', 'player_count'];
    const header = fields.join(',');
    const rows = demoTeams.map(t => 
      [t.registration_number, t.team_name, t.captain_name, t.captain_phone, t.city, t.registration_status, t.players.length].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    return URL.createObjectURL(blob);
  },
};
