import { Link } from 'react-router-dom';
import { useAppContext, APP_LOGO_URL, CONTACT_WHATSAPP, CONTACT_WHATSAPP_LINK } from '../App';
import { Trophy, Users, Calendar, Phone, CheckCircle, XCircle, ArrowRight, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const { settings } = useAppContext();

  const logoSrc = settings.league_logo || APP_LOGO_URL;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoSrc} 
              alt="SOQ.COMM Padel League" 
              className="w-10 h-10 rounded-xl object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-gray-900">SOQ.COMM</h1>
              <p className="text-xs text-gray-500">PADEL LEAGUE</p>
            </div>
          </div>
          <Link to="/admin/login" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
            Admin
          </Link>
        </div>
      </header>

      {/* Database Connected Banner */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 justify-center">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700">
            <strong>Terhubung ke Database:</strong> Data tersimpan permanen di Neon PostgreSQL
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center animate-fade-in">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 mb-8">
              {settings.registration_open ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">PENDAFTARAN DIBUKA</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">PENDAFTARAN DITUTUP</span>
                </>
              )}
            </div>

            {/* Logo */}
            <div className="mb-8">
              <img 
                src={logoSrc} 
                alt="SOQ.COMM Padel League" 
                className="w-28 h-28 mx-auto object-contain drop-shadow-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden w-28 h-28 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl items-center justify-center shadow-xl shadow-green-200/50">
                <Trophy className="w-14 h-14 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              PENDAFTARAN TIM
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                LIGA PADEL
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              {settings.competition_name}
            </p>

            <p className="text-base text-gray-500 max-w-xl mx-auto mb-10">
              {settings.registration_info}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={settings.registration_open ? '/register' : '#'}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transform transition-all duration-200 ${
                  settings.registration_open
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:-translate-y-1'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Users className="w-5 h-5" />
                MULAI PENDAFTARAN
              </Link>
              
              <Link
                to="/check-status"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400 hover:text-green-600 transition-all duration-200"
              >
                <Calendar className="w-5 h-5" />
                CEK STATUS PENDAFTARAN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 card-shadow animate-slide-up">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-2">
              {settings.min_players} - {settings.max_players} Pemain
            </h3>
            <p className="text-gray-500 text-sm">
              Setiap tim dapat mendaftarkan minimal {settings.min_players} dan maksimal {settings.max_players} pemain.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-shadow animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-2">Kompetisi Resmi</h3>
            <p className="text-gray-500 text-sm">
              Ikuti kompetisi padel resmi dengan sistem liga yang profesional dan terorganisir.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-shadow animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-2">Pendaftaran Mudah</h3>
            <p className="text-gray-500 text-sm">
              Proses pendaftaran online yang cepat dan mudah. Cek status kapan saja.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="glass-card rounded-2xl p-8 card-shadow">
          <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Informasi Kontak Panitia</h2>
          <div className="flex flex-wrap gap-6">
            <a 
              href={`https://wa.me/${CONTACT_WHATSAPP_LINK}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="font-medium text-gray-900">{CONTACT_WHATSAPP}</p>
              </div>
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">{settings.contact_info}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/60 border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2026 SOQ.COMM PADEL LEAGUE. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Kontak Panitia: <a href={`https://wa.me/${CONTACT_WHATSAPP_LINK}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{CONTACT_WHATSAPP}</a>
          </p>
          <Link to="/admin/login" className="inline-flex items-center gap-1 mt-2 text-xs text-gray-400 hover:text-green-600 transition-colors">
            Admin Panel <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
