import React, { useState, useEffect } from 'react';
import { useGenerationStore } from '../../stores/generation.store';
import { orchestrator } from '../../orchestrators/ebook.orchestrator';
import { CATEGORIES, PAGE_RANGES, TARGET_AUDIENCES, TONES } from '../../services/context.service';
import { Book, Wand2, Lightbulb, Loader2, Target, Users, Settings2, Sparkles, ChevronRight, Info } from 'lucide-react';
import { GenerationStatus } from '../../types';
import { auth, subscribeToAuth } from '../../utils/firebase';
import { User } from 'firebase/auth';
import { LoginModal } from '../../components/LoginModal';
import { InformationModal } from '../../components/InformationModal';
import { checkAndResetDailyQuota, incrementDailyQuota } from '../../utils/quota';

export function GeneratorFlow() {
  const store = useGenerationStore();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isUsingCustomKey, setIsUsingCustomKey] = useState(false);
  const [systemTokenUsage, setSystemTokenUsage] = useState(0);
  const [customModel, setCustomModel] = useState('gemini-3.5-flash');

  useEffect(() => {
    const unsub = subscribeToAuth((u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const hasSeenInfo = localStorage.getItem('HAS_SEEN_INFO_MODAL');
    if (!hasSeenInfo) {
      setShowInfoModal(true);
    }
  }, []);

  useEffect(() => {
    const checkSettings = () => {
      setIsUsingCustomKey(!!localStorage.getItem('USER_GEMINI_API_KEY'));
      setSystemTokenUsage(checkAndResetDailyQuota());
      let storedModel = localStorage.getItem('CUSTOM_USER_MODEL');
      if (storedModel === 'gemini-2.5-flash-lite' || storedModel === 'gemini-2.0-flash-lite-preview-02-05' || storedModel === 'gemini-2.5-flash' || storedModel === 'gemini-flash-latest' || storedModel === 'gemini-1.5-flash') {
         storedModel = 'gemini-3.5-flash';
         localStorage.setItem('CUSTOM_USER_MODEL', storedModel);
      }
      setCustomModel(storedModel || 'gemini-3.5-flash');
    };
    checkSettings();
    const interval = setInterval(checkSettings, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    // Ideally orchestrator could handle 'topic suggestion only' but we can do it directly:
    const { StrategistAgent } = await import('../../agents/strategist.agent');
    const strat = new StrategistAgent();
    const result = await strat.execute({
      category: store.params.category,
      targetAudience: store.params.targetAudience,
      tone: store.params.tone,
      topic: store.params.topic,
      includeOutline: store.params.includeOutline,
      pageRange: store.params.pageRange
    });
    
    if (result.success && result.data) {
      store.setParams({ topic: result.data.topic, targetAudience: result.data.targetAudience, tone: result.data.tone });
    }
    setIsSuggesting(false);
  };

  const generateOutlines = () => {
    try {
      if (!currentUser) {
        setShowLoginModal(true);
        return;
      }
      
      const customKey = !!localStorage.getItem('USER_GEMINI_API_KEY');
      if (!customKey) {
        const usage = checkAndResetDailyQuota();
        if (usage >= 3) {
           store.showErrorModal('Batas Kuota Sistem Habis', 'Anda telah mencapai batas 3 kali generasi gratis. Silakan masuk ke Pengaturan dan tambahkan Custom API Key Gemini milik Anda untuk generasi tanpa batas.');
           return;
        }
      }
      
      orchestrator.generateOutlines();
    } catch (e) {
      console.error(e);
    }
  };

  if (store.status === GenerationStatus.LOADING && store.options.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <Loader2 className="w-12 h-12 text-zeo-primary animate-spin" />
        <h2 className="text-xl font-medium text-white">Menyusun Ide & Kerangka...</h2>
        <p className="text-zeo-muted">AI sedang melalukan riset untuk buku Anda.</p>
        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 mt-4">
          <p className="text-sm font-medium text-zeo-secondary">Estimasi waktu: ~15-30 detik</p>
        </div>
      </div>
    );
  }

  if (store.status === GenerationStatus.GENERATING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-zeo-primary animate-spin" />
          <Sparkles className="w-6 h-6 text-zeo-secondary absolute -top-2 -right-2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Sedang Menulis Buku Anda...</h2>
          <p className="text-zeo-muted">Agen AI sedang menyusun draf, mereview konten, dan merancang visual.</p>
        </div>
        {store.bookNode && (
          <div className="mt-8 text-sm text-zeo-secondary flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-zeo-secondary animate-ping" />
             Menulis bab {store.bookNode.pages.length} dari estimasi...
          </div>
        )}
      </div>
    );
  }

  if (store.options.length > 0) {
    // Show table of contents options
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
        <div className="text-center space-y-2">
           <h2 className="text-2xl font-bold text-white">Pilih Kerangka Buku</h2>
           <p className="text-zeo-muted">Pilih satu kerangka yang paling sesuai dengan visi Anda.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {store.options.map((option, idx) => (
            <div 
              key={option.id}
              className={`bg-zeo-card rounded-2xl border transition-all duration-300 flex flex-col cursor-pointer overflow-hidden ${store.selectedOption?.id === option.id ? 'border-zeo-primary ring-1 ring-zeo-primary shadow-lg shadow-zeo-primary/10 scale-[1.02] bg-zeo-primary/5' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]'}`}
              onClick={() => store.setSelectedOption(option)}
            >
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                 <div className="w-8 h-8 rounded-full bg-zeo-primary/10 flex items-center justify-center mb-4 border border-zeo-primary/20">
                    <span className="text-zeo-primary font-bold text-sm">{idx + 1}</span>
                 </div>
                 <h3 className="font-bold text-lg text-white leading-tight">{option.title}</h3>
              </div>
              <div className="p-6 flex-1 space-y-3">
                 <h4 className="text-xs font-semibold text-zeo-muted uppercase tracking-wider">Daftar Bab</h4>
                 {option.chapters.map((ch, i) => (
                   <div key={i} className="flex gap-3 text-sm text-zeo-text items-start">
                     <span className="text-zeo-secondary/70 shrink-0 font-medium">{i+1}.</span>
                     <span>{typeof ch === 'string' ? ch : ch.title}</span>
                   </div>
                 ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
           <button 
              onClick={() => {
                if (!currentUser) {
                  setShowLoginModal(true);
                  return;
                }
                const customKey = !!localStorage.getItem('USER_GEMINI_API_KEY');
                if (!customKey) {
                   incrementDailyQuota();
                }
                if (store.selectedOption) {
                  orchestrator.generateFullBook(store.selectedOption);
                }
              }}
              disabled={!store.selectedOption || store.status === GenerationStatus.LOADING}
              className="bg-zeo-primary hover:bg-zeo-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-zeo-primary/20 hover:-translate-y-1 disabled:opacity-50 flex items-center gap-2"
           >
              Mulai Tulis Buku
              <Wand2 className="w-5 h-5 ml-2" />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500 mt-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Buku yang Siap Jual dalam Hitungan Menit.
        </h1>
        <p className="text-lg text-zeo-muted max-w-2xl mx-auto">
          Arsitektur agen kami akan membuat riset, merancang kerangka, dan menulis buku secara otonom.
        </p>
        <button
          onClick={() => setShowInfoModal(true)}
          className="inline-flex items-center gap-2 text-sm text-zeo-secondary hover:text-white bg-zeo-secondary/10 hover:bg-zeo-secondary/20 px-4 py-2 rounded-full transition-colors mx-auto mt-2"
        >
          <Info className="w-4 h-4" />
          Cara Penggunaan & Batasan Sistem
        </button>
      </div>

      <div className="bg-zeo-card rounded-2xl border border-white/10 p-8 shadow-xl mt-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <Target className="w-5 h-5 text-zeo-primary" /> Target
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zeo-muted tracking-wider uppercase mb-2 block">Niche / Kategori</label>
                <select value={store.params.category} onChange={e => store.setParams({ category: e.target.value })} className="w-full bg-zeo-input border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-zeo-primary transition-colors">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zeo-muted tracking-wider uppercase mb-2 block">Target Pembaca</label>
                <select value={store.params.targetAudience} onChange={e => store.setParams({ targetAudience: e.target.value })} className="w-full bg-zeo-input border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-zeo-primary transition-colors">
                  {TARGET_AUDIENCES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <Settings2 className="w-5 h-5 text-zeo-secondary" /> Konfigurasi
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zeo-muted tracking-wider uppercase mb-2 block">Cakupan Halaman</label>
                <select value={store.params.pageRange} onChange={e => store.setParams({ pageRange: e.target.value })} className="w-full bg-zeo-input border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-zeo-primary transition-colors">
                  {PAGE_RANGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zeo-muted tracking-wider uppercase mb-2 block">Gaya Bahasa (Tone)</label>
                <select value={store.params.tone} onChange={e => store.setParams({ tone: e.target.value })} className="w-full bg-zeo-input border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-zeo-primary transition-colors">
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              {isUsingCustomKey && (
                <div className="border-t border-white/10 pt-4 mt-2">
                  <label className="text-xs font-semibold text-zeo-muted tracking-wider uppercase mb-2 block">Pilih Model AI Utama</label>
                  <select 
                    value={customModel} 
                    onChange={e => {
                       localStorage.setItem('CUSTOM_USER_MODEL', e.target.value);
                       setCustomModel(e.target.value);
                    }} 
                    className="w-full bg-zeo-input border border-zeo-primary/30 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-zeo-primary transition-colors">
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Lebih Berkualitas)</option>
                  </select>
                  <p className="text-xs text-zeo-secondary/80 mt-2">
                    <Sparkles className="w-3 h-3 inline-block mr-1" /> Custom model diaktifkan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
           <div className="flex gap-4">
              <div className="flex-1 relative">
                <input 
                  value={store.params.topic} 
                  onChange={e => store.setParams({ topic: e.target.value })} 
                  placeholder="Ketik topik spesifik... (Kosongkan jika ingin saran otomatis)" 
                  className="w-full bg-zeo-input border border-white/10 rounded-xl px-4 py-4 pr-12 text-white outline-none focus:border-zeo-primary transition-colors text-lg" 
                />
                {!store.params.topic && (
                  <button onClick={handleSuggest} disabled={isSuggesting} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg text-zeo-muted hover:text-zeo-primary transition-colors" title="Beri Saran Topik">
                     {isSuggesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
                  </button>
                )}
              </div>
              <button onClick={generateOutlines} className="bg-zeo-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-zeo-primary/90 flex items-center justify-center gap-2 shrink-0 transition-transform hover:-translate-y-0.5">
                <Sparkles className="w-5 h-5" />
                Rancang Buku
              </button>
           </div>
        </div>
      </div>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={() => generateOutlines()} 
      />
      <InformationModal
        isOpen={showInfoModal}
        onClose={() => {
          localStorage.setItem('HAS_SEEN_INFO_MODAL', 'true');
          setShowInfoModal(false);
        }}
      />
    </div>
  );
}
