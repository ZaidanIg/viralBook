import React from 'react';
import { AlertCircle, Lightbulb, X, Info, BookOpen } from 'lucide-react';

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InformationModal({ isOpen, onClose }: InformationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zeo-card border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden shadow-black/50">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-zeo-primary" />
            Panduan & Informasi Sistem
          </h2>
          <button 
            onClick={onClose}
            className="text-zeo-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

          <div className="space-y-3 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
            <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Product Knowledge (Fitur Utama)
            </h3>
            <ul className="text-sm text-emerald-200/90 space-y-3 list-disc pl-5">
              <li><strong className="text-white">AI E-Book Generator:</strong> Ciptakan draf buku secara otomatis dari topik sederhana menggunakan agen AI cerdas kami yang menyusun mulai dari outline hingga seluruh bab dan konten halamannya.</li>
              <li><strong className="text-white">AI Image Generator:</strong> Menyisipkan gambar ilustrasi keren (sampul, latar belakang bab, dan di dalam isi teks) secara otomatis melalui model generator visual yang otomatis menganalisis paragraf Anda.</li>
              <li><strong className="text-white">Rich Text Editor:</strong> Anda dapat dengan mudah melakukan revisi format, merubah warna, mengubah alignment atau mengedit kesalahan kalimat dari teks yang dihasilkan AI.</li>
              <li><strong className="text-white">Ekspor Fleksibel (PDF & DOCX):</strong> Unduh e-book lengkap Anda dalam format standar publikasi (PDF) maupun format draf dokumen Microsoft Word / Google Docs (DOCX).</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-amber-500" /> Tips Penggunaan (Insight)
            </h3>
            <ul className="text-sm text-zeo-muted space-y-3 list-disc pl-5">
              <li><strong className="text-white">Gunakan Topik Spesifik:</strong> Hasil buku akan jauh lebih bagus dan tertarget jika topik spesifik (misal: "Cara Diet Sehat Untuk Ibu Hamil") dibandingkan dengan topik terlalu luas (misal: "Kesehatan").</li>
              <li><strong className="text-white">Panjang Halaman:</strong> Untuk versi gratis / awal, sangat direkomendasikan memilih "Micro-Book (10-20 Halaman)" agar proses berjalan cepat dan stabil.</li>
              <li><strong className="text-white">Gaya Bahasa:</strong> Sesuaikan gaya bahasa dan target pembaca. AI akan menyesuaikan cara penulisan agar cocok dengan audience Anda.</li>
            </ul>
          </div>

          <div className="space-y-3 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <h3 className="font-semibold text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Batasan Sistem (Warning)
            </h3>
            <ul className="text-sm text-red-200/80 space-y-3 list-disc pl-5">
              <li>Sistem ini menggunakan kecerdasan buatan (AI). Hasil tulisan mungkin tidak 100% sempurna dan sewaktu-waktu bisa saja melenceng dari konteks. <strong>Sangat direkomendasikan untuk membaca dan menyunting kembali</strong> buku sebelum diedarkan.</li>
              <li>Sistem membatasi penggunaan model maksimal 3 kali pembuatan e-book bagi pengguna gratis. Jika habis, Anda harus mengatur Custom API Key di Pengaturan.</li>
              <li>Waktu pembuatan sangat bergantung pada panjang buku yang diminta. Semakin panjang buku, semakin lama prosesnya. Mohon tidak menutup tab atau merefresh browser selama proses pembuatan (Loading).</li>
            </ul>
          </div>

          <div className="space-y-3 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mt-4">
            <h3 className="font-semibold text-blue-400 flex items-center gap-2">
              <Info className="w-5 h-5" /> Penggunaan Custom API Key (Pro)
            </h3>
            <ul className="text-sm text-blue-200/80 space-y-3 list-disc pl-5">
              <li>Jika Anda mengalami error atau limit penggunaan (kuota) telah habis, Anda dapat menggunakan API Key Gemini milik Anda sendiri.</li>
              <li>Buka menu <strong className="text-white">Pengaturan (Settings)</strong> dengan mengklik tombol ikon gerigi, kemudian masukkan API Key Gemini Anda pada kolom yang disediakan.</li>
              <li>Untuk mendapatkan API Key secara gratis, Anda bisa mendapatkannya melalui website resmi <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>.</li>
              <li><strong className="text-white">Keamanan Terjamin:</strong> API Key Anda tidak disimpan di server kami, melainkan hanya disimpan secara lokal di browser (Local Storage) perangkat Anda.</li>
            </ul>
          </div>

        </div>

        <div className="p-4 border-t border-white/10 flex justify-end bg-black/20">
          <button 
            onClick={onClose}
            className="bg-zeo-primary hover:bg-zeo-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Mengerti & Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
