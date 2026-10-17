import { useState } from 'react';
import { Link } from 'react-router-dom';
import { teamsApi } from '../services/api';
import { ArrowLeft, Search, Loader2, AlertCircle, CheckCircle, Clock, XCircle, Edit } from 'lucide-react';

interface StatusData {
  registration_number: string;
  team_name: string;
  captain_name: string;
  player_count: number;
  created_at: string;
  registration_status: string;
  admin_notes: string;
}

export default function CheckStatusPage() {
  const [regNumber, setRegNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<StatusData | null>(null);

  const handleCheck = async () => {
    if (!regNumber.trim() || !phone.trim()) {
      setError('Nomor pendaftaran dan nomor WhatsApp wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await teamsApi.getByRegistrationNumber(regNumber, phone);
      if (response.success && response.data) {
        setResult(response.data as StatusData);
      } else {
        setError(response.error || 'Data tidak ditemukan. Pastikan nomor pendaftaran dan nomor WhatsApp benar.');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'MENUNGGU_VERIFIKASI': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'DIVERIFIKASI': 'bg-green-100 text-green-800 border-green-200',
      'PERLU_PERBAIKAN': 'bg-orange-100 text-orange-800 border-orange-200',
      'DITOLAK': 'bg-red-100 text-red-800 border-red-200',
    };
    const labels: Record<string, string> = {
      'MENUNGGU_VERIFIKASI': 'MENUNGGU VERIFIKASI',
      'DIVERIFIKASI': 'DIVERIFIKASI',
      'PERLU_PERBAIKAN': 'PERLU PERBAIKAN',
      'DITOLAK': 'DITOLAK',
    };
    const icons: Record<string, any> = {
      'MENUNGGU_VERIFIKASI': Clock,
      'DIVERIFIKASI': CheckCircle,
      'PERLU_PERBAIKAN': Edit,
      'DITOLAK': XCircle,
    };
    const Icon = icons[status] || Clock;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${styles[status] || styles['MENUNGGU_VERIFIKASI']}`}>
        <Icon className="w-4 h-4" />
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="glass-card rounded-2xl p-6 sm:p-8 card-shadow">
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Cek Status Pendaftaran</h1>
          <p className="text-gray-500 text-sm mb-6">Masukkan nomor pendaftaran dan nomor WhatsApp kapten untuk melihat status.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Pendaftaran</label>
              <input type="text" className="input-field" placeholder="SOQ-REG-2026-0001" value={regNumber} onChange={e => setRegNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp Kapten</label>
              <input type="tel" className="input-field" placeholder="08xxxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleCheck}
            disabled={loading}
            className="mt-6 w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Mencari...' : 'CEK STATUS'}
          </button>
        </div>

        {result && (
          <div className="mt-6 glass-card rounded-2xl p-6 card-shadow animate-slide-up">
            <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Hasil Pencarian</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">No. Pendaftaran</span>
                <span className="font-mono font-medium text-gray-900">{result.registration_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Nama Tim</span>
                <span className="font-medium text-gray-900">{result.team_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Kapten</span>
                <span className="font-medium text-gray-900">{result.captain_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Jumlah Pemain</span>
                <span className="font-medium text-gray-900">{result.player_count} pemain</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Tanggal Daftar</span>
                <span className="font-medium text-gray-900">{new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                {getStatusBadge(result.registration_status)}
              </div>
              {result.admin_notes && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-600 font-medium mb-1">Catatan Panitia:</p>
                  <p className="text-sm text-blue-800">{result.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
