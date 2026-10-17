import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { Trophy, Users, Clock, CheckCircle, AlertTriangle, LayoutDashboard, FileText, UserCog, Settings, LogOut, ClipboardList } from 'lucide-react';

export default function AdminLayout({ children, activePage }: { children: React.ReactNode; activePage: string }) {
  const { setIsAdmin, setAdminToken } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminToken('');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/registrations', label: 'Pendaftaran', icon: ClipboardList },
    { path: '/admin/teams', label: 'Tim', icon: Users },
    { path: '/admin/players', label: 'Pemain', icon: UserCog },
    { path: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm text-gray-900">SOQ.COMM</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activePage === item.label
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 mb-1">
            <FileText className="w-5 h-5" /> Lihat Website
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 w-full text-left">
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">Admin Panel</span>
          </div>
          <button onClick={handleLogout} className="text-red-500 p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        {/* Mobile nav */}
        <div className="flex overflow-x-auto px-4 pb-3 gap-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                activePage === item.label
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-500 bg-gray-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
