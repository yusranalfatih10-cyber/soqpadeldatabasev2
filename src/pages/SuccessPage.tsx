import { useParams, Link } from 'react-router-dom';
import { APP_LOGO_URL, CONTACT_WHATSAPP, CONTACT_WHATSAPP_LINK } from '../App';
import { CheckCircle, Printer, ArrowLeft, Trophy, Users, Calendar } from 'lucide-react';

export default function SuccessPage() {
  const { registrationNumber } = useParams();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="glass-card rounded-2xl p-8 card-shadow text-center animate-slide-up">
          {/* App Logo */}
          <div className="mb-4">
            <img 
              src={APP_LOGO_URL} 
              alt="SOQ.COMM Padel League" 
              className="w-16 h-16 mx-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">
            PENDAFTARAN BERHASIL!
          </h1>

          <p className="text-gray-600 mb-8">
            Terima kasih telah mendaftarkan tim Anda di SOQ.COMM PADEL LEAGUE. Data pendaftaran telah diterima dan sedang menunggu verifikasi panitia.
          </p>

          {/* Registration Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nomor Pendaftaran</p>
                  <p className="font-mono font-bold text-lg text-gray-900">{registrationNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Waktu Pendaftaran</p>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium text-yellow-700">Menunggu Verifikasi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-blue-800">
              💡 Simpan nomor pendaftaran Anda. Gunakan untuk mengecek status pendaftaran kapan saja.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 no-print">
            <button onClick={handlePrint} className="w-full btn-primary inline-flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" /> CETAK BUKTI PENDAFTARAN
            </button>
            <Link to="/check-status" className="w-full btn-secondary inline-flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" /> LIHAT DETAIL PENDAFTARAN
            </Link>
            <Link to="/" className="w-full inline-flex items-center justify-center gap-2 text-gray-500 hover:text-green-600 py-3 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Utama
            </Link>
          </div>
        </div>

        {/* Print-only section */}
        <div className="hidden print:block mt-8 p-8 border-2 border-gray-300 rounded-xl">
          <div className="text-center mb-4">
            <img 
              src={APP_LOGO_URL} 
              alt="SOQ.COMM Padel League" 
              className="w-20 h-20 mx-auto object-contain mb-2"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <h2 className="font-display font-bold text-xl text-center mb-2">BUKTI PENDAFTARAN</h2>
          <h3 className="font-bold text-center mb-2">SOQ.COMM PADEL LEAGUE 2026</h3>
          <hr className="my-4" />
          <div className="space-y-2">
            <p><strong>Nomor Pendaftaran:</strong> {registrationNumber}</p>
            <p><strong>Tanggal:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Status:</strong> Menunggu Verifikasi</p>
          </div>
          <hr className="my-4" />
          <p className="text-sm text-gray-600 text-center mt-4">
            Dokumen ini adalah bukti pendaftaran resmi. Simpan dengan baik.
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            Kontak Panitia: {CONTACT_WHATSAPP}
          </p>
        </div>
      </div>
    </div>
  );
}
