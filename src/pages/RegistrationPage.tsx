import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { teamsApi, API_CONFIG } from '../services/api';
import { ArrowLeft, ArrowRight, Trophy, User, Users, Plus, X, Camera, Upload, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface PlayerData {
  id: string;
  full_name: string;
  nickname: string;
  phone: string;
  gender: string;
  playing_position: string;
  photo_url: string;
  photo_file: File | null;
  player_strength: string;
}

const createEmptyPlayer = (): PlayerData => ({
  id: crypto.randomUUID(),
  full_name: '',
  nickname: '',
  phone: '',
  gender: '',
  playing_position: '',
  photo_url: '',
  photo_file: null,
  player_strength: '',
});

export default function RegistrationPage() {
  const { settings } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Team data
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [city, setCity] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Players data
  const [players, setPlayers] = useState<PlayerData[]>([createEmptyPlayer()]);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);

  // Photo upload refs
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const totalSteps = 3;

  if (!settings.registration_open) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Pendaftaran Ditutup</h2>
          <p className="text-gray-500 mb-6">Maaf, pendaftaran saat ini sedang ditutup. Silakan hubungi panitia untuk informasi lebih lanjut.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </div>
    );
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = settings.max_logo_size * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Ukuran file melebihi ${settings.max_logo_size} MB`);
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }
    
    setError('');
    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  };

  const handlePhotoUpload = (playerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = settings.max_photo_size * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Ukuran file melebihi ${settings.max_photo_size} MB`);
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }
    
    setError('');
    setPlayers(prev => prev.map(p => 
      p.id === playerId 
        ? { ...p, photo_url: URL.createObjectURL(file), photo_file: file }
        : p
    ));
  };

  const addPlayer = () => {
    if (players.length >= settings.max_players) {
      setError(`Maksimal ${settings.max_players} pemain per tim.`);
      return;
    }
    setPlayers([...players, createEmptyPlayer()]);
    setEditingPlayer(players[players.length - 1]?.id || null);
    setError('');
  };

  const removePlayer = (id: string) => {
    if (players.length <= settings.min_players) {
      setError(`Minimal ${settings.min_players} pemain per tim.`);
      return;
    }
    setPlayers(players.filter(p => p.id !== id));
    setError('');
  };

  const updatePlayer = (id: string, field: keyof PlayerData, value: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const validateStep1 = () => {
    if (!teamName.trim()) { setError('Nama tim wajib diisi'); return false; }
    if (!captainName.trim()) { setError('Nama kapten wajib diisi'); return false; }
    if (!captainPhone.trim()) { setError('Nomor WhatsApp kapten wajib diisi'); return false; }
    if (!city.trim()) { setError('Kota/asal tim wajib diisi'); return false; }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (players.length < settings.min_players) {
      setError(`Minimal ${settings.min_players} pemain harus ditambahkan.`);
      return false;
    }
    for (const p of players) {
      if (!p.full_name.trim()) { setError(`Nama lengkap pemain harus diisi.`); return false; }
      if (!p.gender) { setError(`Jenis kelamin pemain harus dipilih.`); return false; }
      if (!p.playing_position) { setError(`Posisi bermain pemain harus dipilih.`); return false; }
      if (!p.photo_file && !p.photo_url) { setError(`Foto pemain "${p.full_name}" wajib diunggah.`); return false; }
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('team_name', teamName);
      formData.append('captain_name', captainName);
      formData.append('captain_phone', captainPhone);
      formData.append('captain_email', captainEmail);
      formData.append('city', city);
      if (logoFile) formData.append('team_logo', logoFile);
      
      players.forEach((player, index) => {
        formData.append(`players[${index}][full_name]`, player.full_name);
        formData.append(`players[${index}][nickname]`, player.nickname);
        formData.append(`players[${index}][phone]`, player.phone);
        formData.append(`players[${index}][gender]`, player.gender);
        formData.append(`players[${index}][playing_position]`, player.playing_position);
        formData.append(`players[${index}][player_strength]`, player.player_strength);
        if (player.photo_file) {
          formData.append(`players[${index}][photo]`, player.photo_file);
        }
      });

      const response = await teamsApi.register(formData);
      
      if (response.success && response.data) {
        const regNumber = (response.data as any).registration_number;
        navigate(`/success/${regNumber}`);
      } else {
        setError(response.error || 'Gagal mengirim pendaftaran. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              s <= step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s < step ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className={`w-16 sm:w-32 h-1 mx-2 rounded ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Info Tim</span>
        <span>Data Pemain</span>
        <span>Konfirmasi</span>
      </div>
    </div>
  );

  // Step 1: Team Info
  const renderStep1 = () => (
    <div className="animate-fade-in">
      <h2 className="font-display font-bold text-2xl text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-green-600" />
        </div>
        Informasi Tim
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tim *</label>
          <input type="text" className="input-field" placeholder="Masukkan nama tim" value={teamName} onChange={e => setTeamName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kapten Tim *</label>
          <input type="text" className="input-field" placeholder="Nama lengkap kapten" value={captainName} onChange={e => setCaptainName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp Kapten *</label>
          <input type="tel" className="input-field" placeholder="08xxxxxxxxxx" value={captainPhone} onChange={e => setCaptainPhone(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Kapten (Opsional)</label>
          <input type="email" className="input-field" placeholder="email@example.com" value={captainEmail} onChange={e => setCaptainEmail(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Asal Tim *</label>
          <input type="text" className="input-field" placeholder="Kota asal tim" value={city} onChange={e => setCity(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo Tim</label>
          <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
          
          {logoUrl ? (
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Logo" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" />
              <div className="flex gap-2">
                <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  GANTI LOGO
                </button>
                <button onClick={() => { setLogoUrl(''); setLogoFile(null); }} className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  HAPUS LOGO
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => logoInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors flex flex-col items-center gap-2">
              <Upload className="w-8 h-8" />
              <span className="text-sm">Klik untuk upload logo tim</span>
              <span className="text-xs text-gray-400">JPG, PNG, WEBP (Maks {settings.max_logo_size} MB)</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={() => validateStep1() && setStep(2)} className="btn-primary inline-flex items-center gap-2">
          Selanjutnya <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Step 2: Players
  const renderStep2 = () => (
    <div className="animate-fade-in">
      <h2 className="font-display font-bold text-2xl text-gray-900 mb-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        Data Pemain
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Tambahkan {settings.min_players} - {settings.max_players} pemain. Saat ini: {players.length} pemain.
      </p>

      <div className="space-y-4">
        {players.map((player, index) => (
          <div key={player.id} className="glass-card rounded-2xl p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900">
                  {player.full_name || `Pemain ${index + 1}`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingPlayer(editingPlayer === player.id ? null : player.id)}
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  {editingPlayer === player.id ? 'Tutup' : 'Edit'}
                </button>
                {players.length > settings.min_players && (
                  <button onClick={() => removePlayer(player.id)} className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {editingPlayer === player.id ? (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                    <input type="text" className="input-field" placeholder="Nama lengkap" value={player.full_name} onChange={e => updatePlayer(player.id, 'full_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan</label>
                    <input type="text" className="input-field" placeholder="Panggilan" value={player.nickname} onChange={e => updatePlayer(player.id, 'nickname', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                    <input type="tel" className="input-field" placeholder="08xxxxxxxxxx" value={player.phone} onChange={e => updatePlayer(player.id, 'phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin *</label>
                    <select className="input-field" value={player.gender} onChange={e => updatePlayer(player.id, 'gender', e.target.value)}>
                      <option value="">Pilih</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posisi Bermain *</label>
                    <select className="input-field" value={player.playing_position} onChange={e => updatePlayer(player.id, 'playing_position', e.target.value)}>
                      <option value="">Pilih posisi</option>
                      <option value="Kiri">Kiri</option>
                      <option value="Kanan">Kanan</option>
                      <option value="Kiri & Kanan">Kiri & Kanan</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Keunggulan</label>
                  <textarea className="input-field" rows={2} placeholder="Keunggulan atau catatan pemain" value={player.player_strength} onChange={e => updatePlayer(player.id, 'player_strength', e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto Pemain *</label>
                  <input
                    ref={el => { photoInputRefs.current[player.id] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={e => handlePhotoUpload(player.id, e)}
                  />
                  {player.photo_url ? (
                    <div className="flex items-center gap-4">
                      <img src={player.photo_url} alt="Player" className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200" />
                      <button onClick={() => photoInputRefs.current[player.id]?.click()} className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        GANTI FOTO
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => photoInputRefs.current[player.id]?.click()} className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors flex flex-col items-center gap-2">
                      <Camera className="w-6 h-6" />
                      <span className="text-sm">Upload foto pemain</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {player.photo_url ? (
                  <img src={player.photo_url} alt="Player" className="w-14 h-14 object-cover rounded-xl border" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{player.full_name || 'Belum diisi'}</p>
                  <p className="text-sm text-gray-500">{player.playing_position || '-'} • {player.gender || '-'}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {players.length < settings.max_players && (
        <button onClick={addPlayer} className="mt-4 w-full py-4 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> TAMBAH PEMAIN LAGI
        </button>
      )}

      <div className="mt-8 flex justify-between">
        <button onClick={() => setStep(1)} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <button onClick={() => validateStep2() && setStep(3)} className="btn-primary inline-flex items-center gap-2">
          Preview <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Step 3: Preview
  const renderStep3 = () => (
    <div className="animate-fade-in">
      <h2 className="font-display font-bold text-2xl text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-purple-600" />
        </div>
        Konfirmasi Pendaftaran
      </h2>

      <div className="glass-card rounded-2xl p-6 card-shadow mb-6">
        <div className="flex items-center gap-4 mb-6">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200" />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-display font-bold text-xl text-gray-900">{teamName}</h3>
            <p className="text-sm text-gray-500">{city}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase">Kapten</p>
            <p className="font-medium text-gray-900">{captainName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">WhatsApp</p>
            <p className="font-medium text-gray-900">{captainPhone}</p>
          </div>
          {captainEmail && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Email</p>
              <p className="font-medium text-gray-900">{captainEmail}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase">Jumlah Pemain</p>
            <p className="font-medium text-gray-900">{players.length} pemain</p>
          </div>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">Daftar Pemain:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((player, i) => (
            <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              {player.photo_url ? (
                <img src={player.photo_url} alt="" className="w-12 h-12 object-cover rounded-lg" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm text-gray-900">{player.full_name}</p>
                <p className="text-xs text-gray-500">{player.playing_position} • {player.gender}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-800">
          ⚠️ Pastikan semua data sudah benar sebelum mengirim. Data yang telah dikirim tidak dapat diubah sendiri.
        </p>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(2)} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali Edit
        </button>
        <button
          onClick={() => {
            if (window.confirm('Apakah Anda yakin ingin mengirimkan formulir pendaftaran ini? Pastikan semua data tim dan pemain sudah benar.')) {
              handleSubmit();
            }
          }}
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {loading ? 'Mengirim...' : 'KIRIM PENDAFTARAN'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Utama
        </Link>

        {renderProgressBar()}

        {/* Error/Success messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Form content */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 card-shadow">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
}
