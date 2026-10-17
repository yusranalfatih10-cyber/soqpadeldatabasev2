import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useAppContext } from '../App';
import { adminApi } from '../services/api';
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const { settings, setSettings } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    registration_open: settings.registration_open,
    competition_name: settings.competition_name,
    min_players: settings.min_players,
    max_players: settings.max_players,
    max_photo_size: settings.max_photo_size,
    max_logo_size: settings.max_logo_size,
    contact_info: settings.contact_info,
    league_logo: settings.league_logo,
    registration_info: settings.registration_info,
  });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSettings();
      if (response.success && response.data) {
        const data = response.data as any;
        const newForm = { ...form };
        Object.entries(data).forEach(([key, value]) => {
          if (key in newForm) {
            if (key === 'registration_open') {
              (newForm as any)[key] = value === 'true' || value === true;
            } else if (['min_players', 'max_players', 'max_photo_size', 'max_logo_size'].includes(key)) {
              (newForm as any)[key] = Number(value);
            } else {
              (newForm as any)[key] = String(value);
            }
          }
        });
        setForm(newForm);
        setSettings({ ...settings, ...newForm });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await adminApi.updateSettings(form as any);
      if (response.success) {
        setSettings({ ...settings, ...form });
        setMessage('Pengaturan berhasil disimpan.');
      } else {
        setMessage('Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout activePage="Pengaturan">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="Pengaturan">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Pengaturan Aplikasi</h1>
        <p className="text-gray-500 text-sm">Konfigurasi pendaftaran dan tampilan aplikasi.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.includes('berhasil') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {message.includes('berhasil') ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
          <p className={`text-sm ${message.includes('berhasil') ? 'text-green-700' : 'text-red-700'}`}>{message}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Registration Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 card-shadow">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Pengaturan Pendaftaran</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Status Pendaftaran</p>
                <p className="text-sm text-gray-500">Buka atau tutup pendaftaran untuk peserta baru.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.registration_open} onChange={e => setForm({...form, registration_open: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kompetisi</label>
              <input type="text" className="input-field" value={form.competition_name} onChange={e => setForm({...form, competition_name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Pemain per Tim</label>
                <input type="number" min="1" className="input-field" value={form.min_players} onChange={e => setForm({...form, min_players: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Pemain per Tim</label>
                <input type="number" min="1" className="input-field" value={form.max_players} onChange={e => setForm({...form, max_players: Number(e.target.value)})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Ukuran Foto (MB)</label>
                <input type="number" min="1" className="input-field" value={form.max_photo_size} onChange={e => setForm({...form, max_photo_size: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Ukuran Logo (MB)</label>
                <input type="number" min="1" className="input-field" value={form.max_logo_size} onChange={e => setForm({...form, max_logo_size: Number(e.target.value)})} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 card-shadow">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Informasi & Kontak</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Informasi Kontak Panitia</label>
              <input type="text" className="input-field" value={form.contact_info} onChange={e => setForm({...form, contact_info: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Informasi Pendaftaran</label>
              <textarea className="input-field" rows={3} value={form.registration_info} onChange={e => setForm({...form, registration_info: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo Liga</label>
              <input type="text" className="input-field" placeholder="https://..." value={form.league_logo} onChange={e => setForm({...form, league_logo: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </AdminLayout>
  );
}
