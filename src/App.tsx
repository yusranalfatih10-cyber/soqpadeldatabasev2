import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext, useEffect } from 'react';
import HomePage from './pages/HomePage';
import RegistrationPage from './pages/RegistrationPage';
import CheckStatusPage from './pages/CheckStatusPage';
import SuccessPage from './pages/SuccessPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminTeams from './pages/AdminTeams';
import AdminPlayers from './pages/AdminPlayers';
import AdminSettings from './pages/AdminSettings';
import { initializeApp } from './services/api';

// App logo URL
export const APP_LOGO_URL = 'https://img.sanishtech.com/u/4139abe5f1ad93ba9a1f348e5b1a34da.jpg';
export const CONTACT_WHATSAPP = '+62 814-1227-4044';
export const CONTACT_WHATSAPP_LINK = '6281412274044';

interface AppSettings {
  registration_open: boolean;
  competition_name: string;
  min_players: number;
  max_players: number;
  max_photo_size: number;
  max_logo_size: number;
  contact_info: string;
  league_logo: string;
  registration_info: string;
}

interface AppContextType {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  adminToken: string;
  setAdminToken: (t: string) => void;
}

const defaultSettings: AppSettings = {
  registration_open: true,
  competition_name: 'SOQ.COMM PADEL LEAGUE 2026',
  min_players: 1,
  max_players: 20,
  max_photo_size: 5,
  max_logo_size: 5,
  contact_info: 'WhatsApp: +62 814-1227-4044',
  league_logo: APP_LOGO_URL,
  registration_info: 'Daftarkan tim Anda dan jadilah bagian dari kompetisi padel. Lengkapi informasi tim dan pemain dengan benar sebelum mengirimkan formulir pendaftaran.',
};

export const AppContext = createContext<AppContextType>({
  settings: defaultSettings,
  setSettings: () => {},
  isAdmin: false,
  setIsAdmin: () => {},
  adminToken: '',
  setAdminToken: () => {},
});

export const useAppContext = () => useContext(AppContext);

function App() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Initialize database on first load
  useEffect(() => {
    initializeApp().then(result => {
      if (result.success) {
        setDbReady(true);
      } else {
        setDbError(result.error || 'Gagal menghubungkan ke database');
      }
    });
  }, []);

  // Show loading while database is initializing
  if (!dbReady && !dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Menghubungkan ke Database...</h2>
          <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // Show error if database connection failed
  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-4">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center card-shadow">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Gagal Menghubungkan ke Database</h2>
          <p className="text-gray-500 text-sm mb-4">{dbError}</p>
          <p className="text-xs text-gray-400 mb-6">Pastikan koneksi internet stabil dan database Neon dapat diakses.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary inline-flex items-center gap-2"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ settings, setSettings, isAdmin, setIsAdmin, adminToken, setAdminToken }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/check-status" element={<CheckStatusPage />} />
          <Route path="/success/:registrationNumber" element={<SuccessPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/registrations" element={isAdmin ? <AdminRegistrations /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/teams" element={isAdmin ? <AdminTeams /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/players" element={isAdmin ? <AdminPlayers /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/settings" element={isAdmin ? <AdminSettings /> : <Navigate to="/admin/login" />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
