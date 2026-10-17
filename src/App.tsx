import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
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
