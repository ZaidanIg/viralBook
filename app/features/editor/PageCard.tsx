import React, { useState, useRef } from 'react';
import { BookPage, TextStyle, ElementPosition } from '../../types';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ImagePlus, Loader2, Paintbrush, FileText, Send, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Download } from 'lucide-react';
import { orchestrator } from '../../orchestrators/ebook.orchestrator';
import { AutoResizeTextarea } from '../../components/AutoResizeTextarea';
import { RichTextEditor } from '../../components/RichTextEditor';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface PageCardProps {
  page: BookPage;
  index: number;
  total: number;
  onUpdatePage: (updates: Partial<BookPage>) => void;
  onGenerateImage: () => void;
  onEditImage: (instruction: string) => void;
  isGeneratingImage: boolean;
}

export function PageCardFull({
  page,
  index,
  total,
  onUpdatePage,
  onGenerateImage,
  onEditImage,
  isGeneratingImage
}: PageCardProps) {
  
  const isContentPage = page.type === 'content';
  const hasImage = !!page.imageUrl;
  
  const [showImageEditInput, setShowImageEditInput] = useState(false);
  const [imageEditPrompt, setImageEditPrompt] = useState('');
  const [activeElementId, setActiveElementId] = useState<string>('title');

  const bgStyle = (page.imageUrl && !isContentPage) 
    ? { backgroundImage: `url(${page.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

  const handleImageEditSubmit = () => {
    if (imageEditPrompt.trim()) {
      onEditImage(imageEditPrompt);
      setShowImageEditInput(false);
      setImageEditPrompt('');
    }
  };

  const activeStyle = activeElementId === 'title' ? page.titleStyle : page.contentStyle;

  const handleStyleUpdate = (updates: Partial<TextStyle>) => {
    if (activeElementId === 'title') {
      onUpdatePage({ titleStyle: { ...(page.titleStyle || {}), ...updates } as TextStyle });
    } else {
      onUpdatePage({ contentStyle: { ...(page.contentStyle || {}), ...updates } as TextStyle });
    }
  };

  return (
    <div className="flex-1 w-full flex h-full bg-zeo-bg/50 overflow-hidden min-h-0 min-w-0">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar relative">
         <div id={`print-page-${index}`} className="relative shadow-2xl mx-auto ring-1 ring-white/5 transition-all duration-300 w-full max-w-[600px] flex flex-col shrink-0 bg-zeo-input" style={{ minHeight: '800px', height: 'max-content' }}>
            <div className="absolute inset-0 z-0 bg-zeo-input pointer-events-none">
               {bgStyle.backgroundImage && (
                 <div className="absolute inset-0" style={{...bgStyle, width: '100%', height: '100%'}} />
               )}
               {page.imageUrl && (
                 <div className="absolute inset-0" style={{ 
                   backgroundColor: `rgba(0,0,0,${page.overlayOpacity ?? 0.5})`,
                   backdropFilter: `blur(${page.overlayBlur ?? 4}px)`
                 }} />
               )}
            </div>

            {/* Elements */}
            <div className="relative z-10 flex flex-col p-12 flex-1 w-full min-h-full">
               <RichTextEditor 
                  value={page.title || ''}
                  onChange={(val) => onUpdatePage({ title: val })}
                  onClick={() => setActiveElementId('title')}
                  className={cn("bg-transparent border border-transparent outline-none overflow-hidden text-center hover:border-white/20 transition-colors focus:border-zeo-primary focus:bg-white/5 rounded", activeElementId === 'title' && "border-white/20")}
                  style={{
                    fontFamily: page.titleStyle?.fontFamily || 'Inter, sans-serif',
                    color: page.titleStyle?.color || '#ffffff',
                    fontSize: `${page.titleStyle?.fontSize || 24}px`,
                    fontWeight: page.titleStyle?.fontWeight || 'bold',
                    fontStyle: page.titleStyle?.fontStyle || 'normal',
                    textAlign: page.titleStyle?.textAlign || 'center',
                  }}
               />
               <RichTextEditor 
                  value={page.content || ''}
                  onChange={(val) => onUpdatePage({ content: val })}
                  onClick={() => setActiveElementId('content')}
                  className={cn("bg-transparent border border-transparent outline-none mt-8 pointer-events-auto hover:border-white/20 transition-colors focus:border-zeo-primary focus:bg-white/5 rounded", activeElementId === 'content' && "border-white/20")}
                  style={{
                    fontFamily: page.contentStyle?.fontFamily || 'Inter, sans-serif',
                    color: page.contentStyle?.color || '#dddddd',
                    fontSize: `${page.contentStyle?.fontSize || 16}px`,
                    fontWeight: page.contentStyle?.fontWeight || 'normal',
                    fontStyle: page.contentStyle?.fontStyle || 'normal',
                    textAlign: page.contentStyle?.textAlign || 'left',
                    minHeight: '400px',
                    lineHeight: '1.6'
                  }}
               />
            </div>
         </div>
      </div>

      {/* Settings Rail */}
      <div className="w-[340px] border-l border-white/10 bg-zeo-card flex flex-col h-full overflow-hidden shrink-0">
          <div className="p-4 border-b border-white/10 shrink-0">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white truncate">Halaman {index + 1} of {total}</h3>
                <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-zeo-muted uppercase tracking-wider">{page.type}</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
             <div className="space-y-3">
                 <h4 className="text-xs font-semibold text-zeo-muted uppercase tracking-wider flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" /> Visual Background
                 </h4>
                 
                 {!hasImage ? (
                    <button 
                       onClick={onGenerateImage}
                       disabled={isGeneratingImage}
                       className="w-full h-[120px] rounded-xl border border-dashed border-white/20 hover:border-zeo-primary hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
                    >
                       {isGeneratingImage ? <Loader2 className="w-6 h-6 text-zeo-primary animate-spin" /> : <Paintbrush className="w-6 h-6 text-zeo-muted group-hover:text-zeo-primary transition-colors" />}
                       <span className="text-sm text-zeo-muted group-hover:text-white">Generate Background AI</span>
                    </button>
                 ) : (
                    <div className="space-y-3">
                       <div className="relative rounded-xl overflow-hidden aspect-[9/16] w-full max-w-[120px] mx-auto border border-white/10 group">
                          <img src={page.imageUrl} alt="Background" className="w-full h-full object-cover" />
                       </div>
                       
                       <div className="flex gap-2">
                          <button onClick={onGenerateImage} disabled={isGeneratingImage} className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10 text-white transition-colors">
                             Regenerate
                          </button>
                          <button onClick={() => setShowImageEditInput(!showImageEditInput)} disabled={isGeneratingImage} className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10 text-white transition-colors">
                             Edit Prompt
                          </button>
                          <a href={page.imageUrl} download={`background-page-${index + 1}.jpg`} className="flex-none px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10 text-white transition-colors flex items-center justify-center" title="Download Image">
                             <Download className="w-4 h-4" />
                          </a>
                       </div>
                       
                       {showImageEditInput && (
                          <div className="flex gap-2 pt-2 animate-in slide-in-from-top-2">
                             <input 
                                type="text" 
                                value={imageEditPrompt}
                                onChange={e => setImageEditPrompt(e.target.value)}
                                placeholder="Ubah warna menjadi biru..."
                                className="flex-1 bg-zeo-input border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zeo-muted focus:border-zeo-primary focus:ring-1 focus:ring-zeo-primary outline-none"
                             />
                             <button onClick={handleImageEditSubmit} className="btn-primary p-2 shrink-0 rounded-lg bg-zeo-primary mt-0 ml-0 hover:brightness-110 flex items-center justify-center">
                                <Send className="w-4 h-4 text-white" />
                             </button>
                          </div>
                       )}
                    </div>
                 )}
                 <div>
                    <label className="text-xs text-zeo-muted block mb-2 mt-4">Tingkat Gelap (Opacity)</label>
                    <input 
                       type="range" min="0" max="1" step="0.1" 
                       value={page.overlayOpacity ?? 0.5} 
                       onChange={e => onUpdatePage({ overlayOpacity: parseFloat(e.target.value) })}
                       className="w-full accent-zeo-primary" 
                    />
                 </div>
                 <div>
                    <label className="text-xs text-zeo-muted block mb-2 mt-4">Efek Blur (Radius)</label>
                    <input 
                       type="range" min="0" max="20" step="1" 
                       value={page.overlayBlur ?? 4} 
                       onChange={e => onUpdatePage({ overlayBlur: parseInt(e.target.value) })}
                       className="w-full accent-zeo-primary" 
                    />
                 </div>
              </div>

             <div className="space-y-4 pt-4 border-t border-white/10 pb-4">
                 <h4 className="text-xs font-semibold text-zeo-muted uppercase tracking-wider flex items-center gap-2">
                    <Type className="w-4 h-4" /> Format Teks Select/Blok
                 </h4>
                 
                 <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                    <button 
                      onClick={() => document.execCommand('bold', false, undefined)}
                      className="flex-1 p-2 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                      title="Bold"
                    ><Bold className="w-4 h-4" /></button>
                    <button 
                      onClick={() => document.execCommand('italic', false, undefined)}
                      className="flex-1 p-2 rounded flex items-center justify-center hover:bg-white/10 transition-colors border-l border-white/10"
                      title="Italic"
                    ><Italic className="w-4 h-4" /></button>
                 </div>
                 
                 <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                    <button 
                      onClick={() => document.execCommand('justifyLeft', false, undefined)}
                      className="flex-1 p-2 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                      title="Align Left"
                    ><AlignLeft className="w-4 h-4" /></button>
                    <button 
                       onClick={() => document.execCommand('justifyCenter', false, undefined)}
                      className="flex-1 p-2 rounded flex items-center justify-center hover:bg-white/10 transition-colors border-l border-white/10"
                      title="Align Center"
                    ><AlignCenter className="w-4 h-4" /></button>
                    <button 
                      onClick={() => document.execCommand('justifyRight', false, undefined)}
                      className="flex-1 p-2 rounded flex items-center justify-center hover:bg-white/10 transition-colors border-l border-white/10"
                      title="Align Right"
                    ><AlignRight className="w-4 h-4" /></button>
                    <button 
                      onClick={() => document.execCommand('justifyFull', false, undefined)}
                      className="flex-1 p-2 rounded flex items-center justify-center hover:bg-white/10 transition-colors border-l border-white/10"
                      title="Justify"
                    ><AlignJustify className="w-4 h-4" /></button>
                 </div>

                 <div>
                    <label className="text-xs text-zeo-muted block mb-2">Ukuran Font ({activeStyle?.fontSize || (activeElementId === 'title' ? 32 : 18)}px)</label>
                    <input 
                       type="range" min="12" max="120" step="2" 
                       value={activeStyle?.fontSize || (activeElementId === 'title' ? 32 : 18)} 
                       onChange={e => handleStyleUpdate({ fontSize: parseInt(e.target.value) })}
                       className="w-full accent-zeo-primary" 
                    />
                 </div>
                 
                 <div>
                    <label className="text-xs text-zeo-muted block mb-2">Warna Teks</label>
                    <div className="flex flex-wrap gap-2">
                       {['#ffffff', '#dddddd', '#a3a3a3', '#000000', '#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'].map(c => (
                         <button 
                           key={c}
                           onClick={() => handleStyleUpdate({ color: c })}
                           className={cn("w-6 h-6 rounded-full border border-white/20 transition-transform", activeStyle?.color === c ? 'border-zeo-primary scale-125 z-10 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'hover:scale-110')}
                           style={{ backgroundColor: c }}
                           title={c}
                         />
                       ))}
                    </div>
                 </div>
             </div>

          </div>
      </div>
    </div>
  );
}
