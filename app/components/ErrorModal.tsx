import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useGenerationStore } from '../stores/generation.store';

export function ErrorModal() {
  const { errorModal, closeErrorModal } = useGenerationStore();

  if (!errorModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zeo-card border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-red-500/10 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">{errorModal.title}</h2>
          </div>
          <button onClick={closeErrorModal} className="p-2 hover:bg-white/10 rounded-lg text-zeo-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-zeo-muted text-sm leading-relaxed">
            {errorModal.message}
          </p>
          <div className="flex flex-col items-end pt-2">
            <button 
              onClick={closeErrorModal}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
