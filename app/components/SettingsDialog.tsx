import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function SettingsDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(localStorage.getItem('USER_GEMINI_API_KEY') || '');
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('USER_GEMINI_API_KEY', apiKey.trim());
    } else {
      localStorage.removeItem('USER_GEMINI_API_KEY');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zeo-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Pengaturan Sistem</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-zeo-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zeo-muted mb-2">
              Gemini API Key (Opsional)
            </label>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full bg-zeo-input border border-white/10 rounded-xl p-3 text-white focus:border-zeo-primary focus:ring-1 focus:ring-zeo-primary outline-none"
            />
            <p className="text-xs text-zeo-muted mt-2">
              Masukkan API Key Gemini Anda sendiri untuk menghindari limitasi quota dari sistem (opsional).
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-white">Status Quota & Model</h3>
            <div className="flex justify-between items-center text-sm mb-2">
               <span className="text-zeo-muted">Model AI Aktif:</span>
               <span className="text-white font-medium bg-zeo-primary/20 text-zeo-primary px-2 py-0.5 rounded border border-zeo-primary/30 text-xs">
                 {apiKey.trim() ? ((localStorage.getItem('CUSTOM_USER_MODEL') === 'gemini-2.5-flash-lite' || localStorage.getItem('CUSTOM_USER_MODEL') === 'gemini-2.0-flash-lite-preview-02-05' || localStorage.getItem('CUSTOM_USER_MODEL') === 'gemini-2.5-flash' || localStorage.getItem('CUSTOM_USER_MODEL') === 'gemini-flash-latest' || localStorage.getItem('CUSTOM_USER_MODEL') === 'gemini-1.5-flash' ? 'gemini-3.5-flash' : localStorage.getItem('CUSTOM_USER_MODEL')) || 'gemini-3.5-flash') : 'gemini-3.5-flash'}
               </span>
            </div>
            
            <div className="border-t border-white/10 pt-3 flex flex-col gap-1 text-sm mt-2">
               <div className="flex justify-between items-center">
                  <span className="text-zeo-muted">API Terhubung:</span>
                  <span className="text-white font-medium text-xs">
                     {apiKey.trim() ? 'Custom API Key' : 'Default Sistem'}
                  </span>
               </div>
               
               {apiKey.trim() ? (
                 <p className="text-xs text-zeo-muted mt-2 leading-relaxed">
                   <span className="text-zeo-green">●</span> Anda menggunakan API Key sendiri. Quota generation tidak dibatasi oleh Viral Book dan bergantung penuh pada limit GCP Anda.
                 </p>
               ) : (
                 <p className="text-xs text-zeo-muted mt-2 leading-relaxed">
                   <span className="text-yellow-500">●</span> Menggunakan Default Sistem. Quota dibatasi dan di-share bersama. Tambahkan API Key Anda di atas untuk akses tanpa batas.
                 </p>
               )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-zeo-primary hover:bg-zeo-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
