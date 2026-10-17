import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext, APP_LOGO_URL } from '../App';
import { adminApi } from '../services/api';
import { Lock, User, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const { setIsAdmin, setAdminToken } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await adminApi.login(username, password);
      if (response.success && response.data) {
        const data = response.data as any;
        setAdminToken(data.token);
        setIsAdmin(true);
        navigate('/admin');
      } else {
        setError(response.error || 'Login gagal. Periksa username dan password.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="glass-card rounded-2xl p-8 card-shadow">
          <div className="text-center mb-8">
            <img 
              src={APP_LOGO_URL} 
              alt="SOQ.COMM Padel League" 
              className="w-16 h-16 mx-auto object-contain mb-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <h1 className="font-display font-bold text-2xl text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">SOQ.COMM PADEL LEAGUE</p>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700 font-medium">Kredensial Default:</p>
            <p className="text-xs text-blue-600">Username: <code className="bg-blue-100 px-1 rounded">admin</code> | Password: <code className="bg-blue-100 px-1 rounded">admin123</code></p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  className="input-field pl-10"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Memproses...' : 'MASUK'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
