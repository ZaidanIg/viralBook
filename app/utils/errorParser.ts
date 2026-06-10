export function parseErrorMessage(error: any): string {
  let msg = error?.message || error?.toString() || '';
  
  if (typeof msg === 'string') {
    try {
      const match = msg.match(/\{.*\}/s);
      if (match) {
        const json = JSON.parse(match[0]);
        if (json.error && json.error.message) {
          msg = json.error.message;
        } else if (json.message) {
          msg = json.message;
        }
      }
    } catch(e) {
      // Ignore parse error
    }
  }

  if (msg.includes('PERMISSION_DENIED') || msg.includes('403') || msg.includes('The caller does not have permission')) {
    return 'Akses ditolak (Permission Denied). Jika Anda menggunakan API Key sendiri, pastikan sudah dimasukkan dengan benar.';
  }
  
  if (msg.includes('NOT_FOUND') || msg.includes('404') || msg.includes('Requested entity was not found')) {
    return 'Model AI tidak ditemukan. Silakan cek kembali pilihan model di Pengaturan atau gunakan tipe model default (Gemini Flash).';
  }

  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exhaust')) {
    return 'Batas kuota API telah habis. Silakan gunakan Custom API Key di Pengaturan untuk akses tanpa batas.';
  }
  
  if (msg.includes('500') || msg.includes('INTERNAL')) {
    return 'Terjadi kesalahan sistem internal. Silakan coba lagi.';
  }

  if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
    return 'Layanan AI sedang sibuk atau tidak tersedia. Silakan coba lagi.';
  }

  if (msg.includes('block') || msg.includes('safety') || msg.includes('FinishReason.SAFETY')) {
    return 'Konten diblokir karena melanggar kebijakan keamanan.';
  }

  if (msg === 'Failed to fetch') {
    return 'Gagal tersambung. Periksa koneksi internet Anda.';
  }

  return msg || 'Terjadi kesalahan tidak diketahui.';
}
