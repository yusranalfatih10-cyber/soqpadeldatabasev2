import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { playersApi, teamsApi } from '../services/api';
import { Search, Edit, Trash2, Loader2, X, User } from 'lucide-react';

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editForm, setEditForm] = useState({ full_name: '', nickname: '', phone: '', gender: '', playing_position: '', player_strength: '', team_id: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([playersApi.getAll(), teamsApi.getAll()]);
      if (playersRes.success && playersRes.data) setPlayers(playersRes.data as any[]);
      if (teamsRes.success && teamsRes.data) setTeams(teamsRes.data as any[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const startEdit = (player: any) => {
    setEditingPlayer(player);
    setEditForm({
      full_name: player.full_name || '',
      nickname: player.nickname || '',
      phone: player.phone || '',
      gender: player.gender || '',
      playing_position: player.playing_position || '',
      player_strength: player.player_strength || '',
      team_id: player.team_id || '',
    });
  };

  const saveEdit = async () => {
    if (!editingPlayer) return;
    try {
      if (editForm.team_id !== editingPlayer.team_id) {
        await playersApi.transfer(editingPlayer.id, editForm.team_id);
      }
      await playersApi.update(editingPlayer.id, {
        full_name: editForm.full_name,
        nickname: editForm.nickname,
        phone: editForm.phone,
        gender: editForm.gender,
        playing_position: editForm.playing_position,
        player_strength: editForm.player_strength,
      });
      setEditingPlayer(null);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus pemain "${name}"?`)) return;
    try {
      await playersApi.delete(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.team_name || '-';

  const filtered = players.filter(p => {
    const matchSearch = p.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchTeam = !teamFilter || p.team_id === teamFilter;
    return matchSearch && matchTeam;
  });

  return (
    <AdminLayout activePage="Pemain">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Manajemen Pemain</h1>
        <p className="text-gray-500 text-sm">Kelola data pemain dari semua tim.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" className="input-field pl-10 py-2.5" placeholder="Cari pemain..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field py-2.5 sm:w-48" value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
          <option value="">Semua Tim</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">Belum ada pemain terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(player => (
            <div key={player.id} className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow">
              <div className="flex items-start gap-3 mb-3">
                {player.player_photo_url ? (
                  <img src={player.player_photo_url} alt="" className="w-14 h-14 rounded-xl object-cover border" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{player.full_name}</h3>
                  <p className="text-xs text-gray-500">{player.playing_position} • {player.gender}</p>
                  <p className="text-xs text-green-600 mt-0.5">{getTeamName(player.team_id)}</p>
                </div>
              </div>
              {player.player_strength && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{player.player_strength}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => startEdit(player)} className="flex-1 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(player.id, player.full_name)} className="py-2 px-3 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingPlayer(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">Edit Pemain</h2>
              <button onClick={() => setEditingPlayer(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" className="input-field" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan</label>
                <input type="text" className="input-field" value={editForm.nickname} onChange={e => setEditForm({...editForm, nickname: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="text" className="input-field" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select className="input-field" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                    <option value="">Pilih</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posisi</label>
                  <select className="input-field" value={editForm.playing_position} onChange={e => setEditForm({...editForm, playing_position: e.target.value})}>
                    <option value="">Pilih</option>
                    <option value="Kiri">Kiri</option>
                    <option value="Kanan">Kanan</option>
                    <option value="Kiri & Kanan">Kiri & Kanan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tim</label>
                <select className="input-field" value={editForm.team_id} onChange={e => setEditForm({...editForm, team_id: e.target.value})}>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea className="input-field" rows={2} value={editForm.player_strength} onChange={e => setEditForm({...editForm, player_strength: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingPlayer(null)} className="flex-1 btn-secondary">Batal</button>
              <button onClick={saveEdit} className="flex-1 btn-primary">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
