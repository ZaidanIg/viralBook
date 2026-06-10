import React, { useState } from 'react';
import { useGenerationStore } from '../../stores/generation.store';
import { PageCardFull } from './PageCard';
import { PublisherAgent } from '../../agents/publisher.agent';
import { ChevronLeft, ChevronRight, FileText, Download, Check, Type, Move, ZoomIn, CheckCircle2 } from 'lucide-react';
import { orchestrator } from '../../orchestrators/ebook.orchestrator';
import { GenerationStatus } from '../../types';

export function EditorLayout() {
  const store = useGenerationStore();
  const book = store.bookNode;
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!book || book.pages.length === 0) return null;

  const currentPage = book.pages[selectedPageIndex];

  const handleUpdatePage = (updates: any) => {
    const newPages = [...book.pages];
    newPages[selectedPageIndex] = { ...currentPage, ...updates };
    store.updateBookConfig({ pages: newPages });
  };

  const handleGenerateImage = () => {
    orchestrator.generateImageForPage(currentPage.id);
  };

  const handleEditImage = (instruction: string) => {
    orchestrator.editImageForPage(currentPage.id, instruction);
  };

  const publish = async (format: 'PDF' | 'DOCX') => {
    setIsExporting(true);
    const publisher = new PublisherAgent();
    // Wait for DOM to settle if PDF
    await new Promise(r => setTimeout(r, 500));
    const result = await publisher.execute({ book, format });
    if (result.success) {
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } else {
      store.setError(result.error || `Failed to export ${format}`);
    }
    setIsExporting(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 min-h-0 min-w-0">
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.4);
            border-radius: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.6);
          }
        `}} />
        <div className="p-4 border-b border-white/5 bg-zeo-card flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white truncate max-w-[400px]">{book.title}</h2>
              <div className="h-4 w-px bg-white/20 mx-2" />
              <span className="text-sm font-medium text-zeo-muted whitespace-nowrap">{book.pages.length} Halaman Total</span>
           </div>
           
           <div className="flex gap-2 shrink-0">
             <button 
               onClick={() => publish('DOCX')} 
               disabled={isExporting}
               className="flex items-center gap-2 px-4 py-2 bg-zeo-input border border-white/10 hover:border-white/30 text-white rounded-lg transition-colors font-medium text-sm"
             >
               <FileText className="w-4 h-4 text-[#2563eb]" /> {isExporting ? 'Proses...' : 'Export DOCX'}
             </button>
             <button 
               onClick={() => publish('PDF')} 
               disabled={isExporting}
               className="flex items-center gap-2 px-4 py-2 bg-zeo-primary hover:bg-zeo-primary/90 text-white rounded-lg transition-colors font-medium shadow-lg shadow-zeo-primary/20 text-sm"
             >
               {exportComplete ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
               {exportComplete ? 'Berhasil' : (isExporting ? 'Proses PDF...' : 'Kompilasi PDF')}
             </button>
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
           {/* Sidebar Grid */}
           <div className="w-[120px] bg-zeo-card/50 border-r border-white/5 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4 shrink-0 overflow-x-hidden">
              {book.pages.map((p, idx) => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`
                    relative group cursor-pointer rounded-lg overflow-hidden shrink-0 border-2 transition-all 
                    ${selectedPageIndex === idx ? 'border-zeo-primary ring-2 ring-zeo-primary/20' : 'border-transparent hover:border-white/20'}
                  `}
                  style={{ aspectRatio: '9/16' }}
                >
                   <div className="absolute inset-0 bg-zeo-input flex items-center justify-center">
                     <span className="text-xl font-bold text-white/5 uppercase select-none">{p.type === 'cover_front' ? 'COV' : p.type === 'toc' ? 'TOC' : idx + 1}</span>
                   </div>
                   {p.imageUrl && <img src={p.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt={`Page ${idx}`} />}
                   <div className="absolute top-1 left-1 bg-black/60 px-1.5 rounded text-[9px] font-bold text-white backdrop-blur-sm shadow-sm">{idx + 1}</div>
                   {p.isFactChecked && <div className="absolute bottom-1 right-1 bg-green-500/80 p-0.5 rounded backdrop-blur-sm"><Check className="w-2.5 h-2.5 text-white" /></div>}
                </div>
              ))}
           </div>

           {/* Main Editor Canvas */}
           <PageCardFull 
              page={currentPage} 
              index={selectedPageIndex} 
              total={book.pages.length}
              onUpdatePage={handleUpdatePage}
              onGenerateImage={handleGenerateImage}
              onEditImage={handleEditImage}
              isGeneratingImage={store.status === GenerationStatus.LOADING} // Not exact but fine context
           />
        </div>
    </div>
  );
}
