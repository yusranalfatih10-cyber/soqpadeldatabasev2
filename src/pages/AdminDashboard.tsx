import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminApi } from '../services/api';
import { Users, Clock, CheckCircle, AlertTriangle, UserPlus, Trophy, TrendingUp } from 'lucide-react';

interface DashboardData {
  total_registrations: number;
  pending_verification: number;
  verified: number;
  needs_revision: number;
  total_players: number;
  recent_registrations: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminApi.getDashboard();
      if (response.success && response.data) {
        setData(response.data as DashboardData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Pendaftaran', value: data?.total_registrations || 0, icon: Trophy, color: 'bg-blue-50 text-blue-600' },
    { label: 'Menunggu Verifikasi', value: data?.pending_verification || 0, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Terverifikasi', value: data?.verified || 0, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Perlu Perbaikan', value: data?.needs_revision || 0, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Pemain', value: data?.total_players || 0, icon: UserPlus, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <AdminLayout activePage="Dashboard">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Ringkasan data pendaftaran liga padel.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-2xl border border-gray-100 card-shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Pendaftaran Terbaru
              </h2>
            </div>
            <div className="p-6">
              {data?.recent_registrations && data.recent_registrations.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_registrations.map((reg: any) => (
                    <div key={reg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{reg.team_name}</p>
                          <p className="text-xs text-gray-500">{reg.registration_number} • {reg.captain_name}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reg.registration_status === 'DIVERIFIKASI' ? 'bg-green-100 text-green-700' :
                        reg.registration_status === 'MENUNGGU_VERIFIKASI' ? 'bg-yellow-100 text-yellow-700' :
                        reg.registration_status === 'PERLU_PERBAIKAN' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {reg.registration_status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Belum ada pendaftaran.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
