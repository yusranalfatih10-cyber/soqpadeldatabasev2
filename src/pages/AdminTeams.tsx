import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { teamsApi } from '../services/api';
import { Search, Edit, Trash2, Eye, Loader2, Plus, X } from 'lucide-react';

export default function AdminTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editForm, setEditForm] = useState({ team_name: '', captain_name: '', captain_phone: '', city: '', is_active: true });

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => {
    try {
      const response = await teamsApi.getAll();
      if (response.success && response.data) setTeams(response.data as any[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const startEdit = (team: any) => {
    setEditingTeam(team);
    setEditForm({
      team_name: team.team_name || '',
      captain_name: team.captain_name || '',
      captain_phone: team.captain_phone || '',
      city: team.city || '',
      is_active: team.is_active !== false,
    });
  };

  const saveEdit = async () => {
    if (!editingTeam) return;
    try {
      await teamsApi.update(editingTeam.id, editForm);
      setEditingTeam(null);
      loadTeams();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus tim "${name}" beserta semua data pemain?`)) return;
    try {
      await teamsApi.delete(id);
      loadTeams();
    } catch (err) { console.error(err); }
  };

  const filtered = teams.filter(t =>
    t.team_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.captain_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout activePage="Tim">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Manajemen Tim</h1>
        <p className="text-gray-500 text-sm">Kelola data tim yang terdaftar.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" className="input-field pl-10 py-2.5" placeholder="Cari tim..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">Belum ada tim terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(team => (
            <div key={team.id} className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {team.team_logo_url ? (
                    <img src={team.team_logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 font-bold">{team.team_name?.[0]}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{team.team_name}</h3>
                    <p className="text-xs text-gray-500">{team.city}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${team.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {team.is_active !== false ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p>Kapten: <span className="font-medium text-gray-900">{team.captain_name}</span></p>
                <p>WA: {team.captain_phone}</p>
                <p>Pemain: {team.player_count || 0}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(team)} className="flex-1 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(team.id, team.team_name)} className="py-2 px-3 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingTeam(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">Edit Tim</h2>
              <button onClick={() => setEditingTeam(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tim</label>
                <input type="text" className="input-field" value={editForm.team_name} onChange={e => setEditForm({...editForm, team_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kapten</label>
                <input type="text" className="input-field" value={editForm.captain_name} onChange={e => setEditForm({...editForm, captain_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="text" className="input-field" value={editForm.captain_phone} onChange={e => setEditForm({...editForm, captain_phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                <input type="text" className="input-field" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} className="rounded" />
                <label htmlFor="is_active" className="text-sm text-gray-700">Tim Aktif</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingTeam(null)} className="flex-1 btn-secondary">Batal</button>
              <button onClick={saveEdit} className="flex-1 btn-primary">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
