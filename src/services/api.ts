// API Configuration
// This points to the backend API server
// In production, set this to your deployed backend URL (e.g., Render, Railway)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Flag to check if backend is configured
export const isBackendConfigured = !!API_BASE_URL;

// Import demo API for fallback
import { demoApi } from './demoApi';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  if (!isBackendConfigured) {
    return { success: false, error: 'Backend not configured' };
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || data.message || 'Request failed' };
    }
    
    return { success: true, data: data.data || data, message: data.message };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

// Teams API
export const teamsApi = {
  register: async (data: FormData): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.registerTeam(data);
    
    const url = `${API_BASE_URL}/teams/register`;
    try {
      const response = await fetch(url, { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error || 'Gagal mengirim pendaftaran.' };
      return { success: true, data: result.data, message: result.message };
    } catch {
      return { success: false, error: 'Gagal koneksi ke server.' };
    }
  },
  
  getAll: async (): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.getAllTeams();
    return request('/teams');
  },
  
  getById: async (id: string): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.getTeamById(id);
    return request(`/teams/${id}`);
  },
  
  getByRegistrationNumber: async (regNumber: string, phone: string): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.checkStatus(regNumber, phone);
    return request(`/teams/check-status?registration_number=${encodeURIComponent(regNumber)}&phone=${encodeURIComponent(phone)}`);
  },
  
  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.updateTeam(id, data);
    return request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  
  updateStatus: async (id: string, status: string, notes?: string): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.updateTeamStatus(id, status, notes);
    return request(`/teams/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) });
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.deleteTeam(id);
    return request(`/teams/${id}`, { method: 'DELETE' });
  },
};

// Players API
export const playersApi = {
  getByTeam: async (teamId: string): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return { success: true, data: [] };
    return request(`/players/team/${teamId}`);
  },
  
  getAll: async (): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.getAllPlayers();
    return request('/players');
  },
  
  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.updatePlayer(id, data);
    return request(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.deletePlayer(id);
    return request(`/players/${id}`, { method: 'DELETE' });
  },
  
  transfer: async (id: string, newTeamId: string): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.transferPlayer(id, newTeamId);
    return request(`/players/${id}/transfer`, { method: 'PATCH', body: JSON.stringify({ new_team_id: newTeamId }) });
  },
};

// Admin API
export const adminApi = {
  login: async (username: string, password: string): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.login(username, password);
    return request('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  },
  
  logout: async (): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return { success: true };
    return request('/admin/logout', { method: 'POST' });
  },
  
  getDashboard: async (): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.getDashboard();
    return request('/admin/dashboard');
  },
  
  getSettings: async (): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.getSettings();
    return request('/admin/settings');
  },
  
  updateSettings: async (settings: Record<string, string>): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return demoApi.updateSettings(settings);
    return request('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
  },
  
  exportCSV: (): string => {
    if (!isBackendConfigured) return demoApi.exportCSV();
    return `${API_BASE_URL}/admin/export/csv`;
  },
};

// Stats API
export const statsApi = {
  getRegistrationStatus: async (): Promise<ApiResponse<any>> => {
    if (!isBackendConfigured) return { success: true, data: { registration_open: true } };
    return request('/stats/registration-status');
  },
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

export default { teamsApi, playersApi, adminApi, statsApi, API_CONFIG, isBackendConfigured };
