import React, { useState } from 'react';
import { LogIn, X, Loader2 } from 'lucide-react';
import { loginWithGoogle } from '../utils/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess(); // You might want to delay this slightly to let auth state sync, but we use observer usually
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zeo-card border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Login Diperlukan</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-zeo-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-zeo-muted text-sm text-center">
            Anda harus masuk menggunakan akun Google untuk dapat melakukan AI Book Generation. Silahkan login terlebih dahulu.
          </p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center pt-2">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              Masuk dengan Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
