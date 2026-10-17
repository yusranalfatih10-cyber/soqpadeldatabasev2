import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { teamsApi, adminApi } from '../services/api';
import { Search, Filter, Download, Eye, Edit, CheckCircle, AlertTriangle, XCircle, Trash2, Loader2 } from 'lucide-react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => { loadRegistrations(); }, []);

  const loadRegistrations = async () => {
    try {
      const response = await teamsApi.getAll();
      if (response.success && response.data) {
        setRegistrations(response.data as any[]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const notes = status === 'PERLU_PERBAIKAN' ? prompt('Masukkan catatan untuk tim:') ?? undefined : undefined;
    if (status === 'PERLU_PERBAIKAN' && !notes) return;
    
    setActionLoading(id);
    try {
      await teamsApi.updateStatus(id, status, notes);
      loadRegistrations();
    } catch (err) { console.error(err); }
    finally { setActionLoading(''); }
  };

  const handleDelete = async (id: string, teamName: string) => {
    if (!confirm(`Hapus pendaftaran "${teamName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setActionLoading(id);
    try {
      await teamsApi.delete(id);
      loadRegistrations();
    } catch (err) { console.error(err); }
    finally { setActionLoading(''); }
  };

  const filtered = registrations.filter(r => {
    const matchSearch = r.team_name?.toLowerCase().includes(search.toLowerCase()) ||
                       r.captain_name?.toLowerCase().includes(search.toLowerCase()) ||
                       r.registration_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.registration_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'MENUNGGU_VERIFIKASI': 'bg-yellow-100 text-yellow-700',
      'DIVERIFIKASI': 'bg-green-100 text-green-700',
      'PERLU_PERBAIKAN': 'bg-orange-100 text-orange-700',
      'DITOLAK': 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

  const handleExport = () => {
    const url = adminApi.exportCSV();
    window.open(url, '_blank');
  };

  return (
    <AdminLayout activePage="Pendaftaran">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Manajemen Pendaftaran</h1>
          <p className="text-gray-500 text-sm">Kelola semua pendaftaran tim.</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="w-4 h-4" /> Ekspor CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10 py-2.5"
            placeholder="Cari nama tim, kapten, atau no. pendaftaran..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field py-2.5 sm:w-48"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
          <option value="DIVERIFIKASI">Terverifikasi</option>
          <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
          <option value="DITOLAK">Ditolak</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">Tidak ada data pendaftaran.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">No. Pendaftaran</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tim</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Kapten</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">WhatsApp</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Pemain</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(reg => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{reg.registration_number}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {reg.team_logo_url && <img src={reg.team_logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                        <span className="font-medium text-gray-900">{reg.team_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{reg.captain_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{reg.captain_phone}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{reg.player_count || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {new Date(reg.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(reg.registration_status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedTeam(reg)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {reg.registration_status === 'MENUNGGU_VERIFIKASI' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(reg.id, 'DIVERIFIKASI')}
                              disabled={actionLoading === reg.id}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Verifikasi"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(reg.id, 'PERLU_PERBAIKAN')}
                              disabled={actionLoading === reg.id}
                              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Minta Perbaikan"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(reg.id, 'DITOLAK')}
                              disabled={actionLoading === reg.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(reg.id, reg.team_name)}
                          disabled={actionLoading === reg.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTeam(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Detail Pendaftaran</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                {selectedTeam.team_logo_url && <img src={selectedTeam.team_logo_url} alt="" className="w-14 h-14 rounded-xl object-cover border" />}
                <div>
                  <h3 className="font-bold text-lg">{selectedTeam.team_name}</h3>
                  <p className="text-sm text-gray-500">{selectedTeam.registration_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Kapten:</span><p className="font-medium">{selectedTeam.captain_name}</p></div>
                <div><span className="text-gray-500">WhatsApp:</span><p className="font-medium">{selectedTeam.captain_phone}</p></div>
                <div><span className="text-gray-500">Email:</span><p className="font-medium">{selectedTeam.captain_email || '-'}</p></div>
                <div><span className="text-gray-500">Kota:</span><p className="font-medium">{selectedTeam.city}</p></div>
                <div><span className="text-gray-500">Tanggal:</span><p className="font-medium">{new Date(selectedTeam.created_at).toLocaleString('id-ID')}</p></div>
                <div><span className="text-gray-500">Status:</span><div className="mt-1">{getStatusBadge(selectedTeam.registration_status)}</div></div>
              </div>
              {selectedTeam.admin_notes && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 font-medium">Catatan:</p>
                  <p className="text-sm text-blue-800">{selectedTeam.admin_notes}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedTeam(null)} className="mt-6 w-full btn-secondary">Tutup</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
