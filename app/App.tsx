import React, { useState, useEffect } from 'react';
import { useGenerationStore } from './stores/generation.store';
import { GenerationStatus } from './types';
import { GeneratorFlow } from './features/ebook-generator/GeneratorFlow';
import { EditorLayout } from './features/editor/EditorLayout';
import { Wand2, ArrowLeft, Settings, LogIn, LogOut } from 'lucide-react';
import { ViralBookLogo } from './components/ViralBookLogo';
import { SettingsDialog } from './components/SettingsDialog';
import { ErrorModal } from './components/ErrorModal';
import { auth, loginWithGoogle, logout, subscribeToAuth } from './utils/firebase';
import { checkAndResetDailyQuota } from './utils/quota';
import type { User } from 'firebase/auth';

export default function App() {
  const store = useGenerationStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isUsingCustomKey, setIsUsingCustomKey] = useState(false);
  const [systemTokenUsage, setSystemTokenUsage] = useState(0);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      if (u) {
        const sessionStart = localStorage.getItem('user_session_start');
        const now = Date.now();
        if (sessionStart && now - parseInt(sessionStart, 10) > 24 * 60 * 60 * 1000) {
          logout();
          setShowSessionExpired(true);
          setUser(null);
        } else {
          if (!sessionStart) {
            localStorage.setItem('user_session_start', now.toString());
          }
          setUser(u);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const checkQuota = () => {
      setIsUsingCustomKey(!!localStorage.getItem('USER_GEMINI_API_KEY'));
      setSystemTokenUsage(checkAndResetDailyQuota());
    };
    checkQuota();
    window.addEventListener('storage', checkQuota);
    return () => window.removeEventListener('storage', checkQuota);
  }, [showSettings, store.status]);

  return (
    <div className="h-screen bg-zeo-bg text-zeo-text flex flex-col font-sans overflow-hidden">
      <header className="h-16 border-b border-white/5 bg-zeo-card/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {(store.bookNode || store.status !== GenerationStatus.IDLE) && (
            <button onClick={() => store.reset()} className="p-2 mr-2 hover:bg-white/10 rounded-lg text-white transition-colors" title="Kembali ke Awal">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
            <ViralBookLogo className="w-8 h-8" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 hidden sm:inline-block">
            Viral Book
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {!isUsingCustomKey ? (
            <span className="text-xs sm:text-sm hidden md:flex px-3 py-1 bg-white/5 text-zeo-muted rounded-full font-medium border border-white/10 items-center">
               Sisa Kuota: <span className="text-white ml-2">{Math.max(0, 3 - systemTokenUsage)}/3</span>
            </span>
          ) : (
            <span className="text-xs sm:text-sm hidden md:flex px-3 py-1 bg-zeo-primary/10 text-zeo-primary rounded-full font-medium border border-zeo-primary/20 items-center">
               API Key Aktif
            </span>
          )}
          <span className="text-xs sm:text-sm hidden md:flex px-3 py-1 bg-zeo-primary/10 text-zeo-primary rounded-full font-medium border border-zeo-primary/20 items-center">
             v1.0.0
          </span>
          {user ? (
            <div className="flex items-center gap-2 bg-white/5 pr-3 rounded-full border border-white/10">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium hidden sm:inline-block truncate max-w-[120px]">{user.displayName || user.email}</span>
              <button onClick={logout} className="ml-2 text-zeo-muted hover:text-white transition-colors" title="Logout">
                 <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
               onClick={loginWithGoogle} 
               className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/15 rounded-full text-sm font-medium transition-colors"
            >
              <LogIn className="w-4 h-4" /> <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
          
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded-lg text-zeo-muted hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col min-h-0 min-w-0">
          {store.bookNode ? (
            <EditorLayout />
          ) : (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col">
               <GeneratorFlow />
            </div>
          )}

          {store.status === GenerationStatus.GENERATING && (
             <div className="fixed inset-0 z-50 bg-zeo-bg/95 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
               <div className="max-w-md w-full space-y-6 text-center p-6">
                 <div className="w-20 h-20 bg-zeo-card rounded-2xl border border-white/10 mx-auto flex items-center justify-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 bg-zeo-primary/20" style={{ height: `${store.progress}%`, transition: 'height 0.5s ease' }} />
                    <Wand2 className="w-8 h-8 text-zeo-primary relative z-10 animate-pulse" />
                 </div>
                 
                 <h2 className="text-2xl font-bold text-white tracking-tight">Memproses Buku</h2>
                 <p className="text-zeo-muted text-sm">{store.currentStep || 'Sedang menulis bab pertama...'}</p>
                 
                 <div className="space-y-2 mt-8">
                    <div className="h-2 w-full bg-zeo-input rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-zeo-primary to-zeo-secondary transition-all duration-300 ease-out relative"
                         style={{ width: `${store.progress}%` }}
                       >
                         <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]" />
                       </div>
                    </div>
                    <div className="text-right text-xs font-medium text-zeo-muted">{Math.round(store.progress)}% Selesai</div>
                 </div>

                 {store.bookNode && store.bookNode.pages && (
                    <div className="text-xs text-zeo-muted mt-4 bg-white/5 py-2 px-4 rounded-full inline-flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-zeo-secondary animate-ping"></span>
                       Menulis halaman {store.bookNode.pages.length} dari estimasi...
                    </div>
                 )}
               </div>
             </div>
          )}
      </main>
      
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <ErrorModal />

      {showSessionExpired && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
           <div className="bg-zeo-card border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center">
              <h3 className="text-xl font-bold text-white mb-2">Sesi Telah Habis</h3>
              <p className="text-zeo-muted text-sm mb-6">Mohon maaf, sesi Anda telah habis karena lebih dari 24 jam. Silakan login kembali.</p>
              <button 
                 onClick={() => { setShowSessionExpired(false); loginWithGoogle(); }}
                 className="w-full bg-zeo-primary hover:bg-zeo-primary/90 text-white font-medium py-2 rounded-xl transition-colors"
               >
                 Login Kembali
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
