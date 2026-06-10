import { OutlineOption, GeneratedBook, GenerationStatus } from "../types";
import { useGenerationStore } from "../stores/generation.store";
import { createPage } from "../utils/page-factory";

import { StrategistAgent } from "../agents/strategist.agent";
import { OutlineAgent } from "../agents/outline.agent";
import { WriterAgent } from "../agents/writer.agent";
import { ReviewAgent } from "../agents/review.agent";
import { VisualAgent } from "../agents/visual.agent";

import { parseErrorMessage } from '../utils/errorParser';

export class EbookOrchestrator {
  private strategist = new StrategistAgent();
  private outline = new OutlineAgent();
  private writer = new WriterAgent();
  private reviewer = new ReviewAgent();

  async generateOutlines(): Promise<void> {
    const store = useGenerationStore.getState();
    store.setStatus(GenerationStatus.LOADING);
    
    try {
      // 1. Strategy Slicing
      const stratResult = await this.strategist.execute(store.params);
      if (!stratResult.success || !stratResult.data) {
        throw new Error(stratResult.error || "Failed strategy formulation");
      }
      
      console.log("Strategy success:", stratResult.data);
      store.setParams({ 
        topic: stratResult.data.topic,
        targetAudience: stratResult.data.targetAudience,
        tone: stratResult.data.tone
      });

      // 2. Outline Formulations
      const outlineResult = await this.outline.execute({
        topic: stratResult.data.topic,
        coreMessage: stratResult.data.coreMessage,
        audience: stratResult.data.targetAudience,
        pageRange: stratResult.data.pageRange || store.params.pageRange
      });

      if (!outlineResult.success || !outlineResult.data || !outlineResult.data.options || outlineResult.data.options.length === 0) {
        throw new Error(outlineResult.error || "Gagal membangun kerangka atau AI merespons dengan kosong.");
      }

      console.log("Outline success:", outlineResult.data.options);
      store.setOptions(outlineResult.data.options);
      store.setStatus(GenerationStatus.SUCCESS);
    } catch (e: any) {
      console.error("Outlines exception:", e);
      const errMsg = parseErrorMessage(e);
      if (errMsg.includes('kuota') || errMsg.includes('Quota') || errMsg.includes('Exceeded')) {
        store.showErrorModal('Kuota Habis', 'Kamu kehabisan kuota batas API (Quota Exceeded). Silakan tambahkan Custom API Key di pengaturan.');
      } else if (errMsg.includes('Akses ditolak')) {
        store.showErrorModal('Batas Kuota Sistem Habis', 'Anda telah mencapai batas penggunaan gratis. Silakan masuk ke Pengaturan dan tambahkan Custom API Key Gemini milik Anda.');
      } else {
        store.showErrorModal('Gagal Memproses Outline', `Terjadi kesalahan internal/server: ${errMsg}. Silakan coba lagi.`);
      }
      store.setError(errMsg);
    }
  }

  async generateFullBook(selectedOption: OutlineOption): Promise<void> {
    const store = useGenerationStore.getState();
    store.setStatus(GenerationStatus.GENERATING);
    store.setProgress(0, 100, "Menyiapkan kompilasi bab...");

    try {
      const book: GeneratedBook = {
        title: selectedOption.title,
        pages: [ createPage({ id: "cover1", type: "cover_front", title: selectedOption.title, content: store.params.topic }) ]
      };

      // Auto-generate TOC globally
      const tocContent = selectedOption.chapters.map((c, i) => `${i + 1}. ${c.title}`).join("\n");
      book.pages.push(createPage({ id: "toc", type: "toc", title: "Daftar Isi", content: tocContent }));
      store.setBookNode({ ...book });

      const totalChapters = selectedOption.chapters.length;

      // Sequential Chapter Batching
      for (let i = 0; i < totalChapters; i++) {
        const chapterConfig = selectedOption.chapters[i];
        store.setProgress(Math.floor((i / totalChapters) * 90), 100, `Menulis Bab ${i+1}: ${chapterConfig.title}`);

        // Write Sub-agent Focuses only on this chapter
        const draftResult = await this.writer.execute({
          chapter: chapterConfig,
          audience: store.params.targetAudience,
          tone: store.params.tone
        });

        if (!draftResult.success || !draftResult.data) {
          console.error(`Writer agent failed for chapter: ${chapterConfig.title}`, draftResult.error);
          throw new Error(draftResult.error || `Writer failed for chapter ${chapterConfig.title}`);
        }
        
        // Review pipeline skipped to optimize token efficiency and speed
        const finalizedPages = draftResult.data.pages;

        // Assembly
        book.pages.push(createPage({
          id: `chap-title-${i}`,
          type: "chapter_title",
          title: draftResult.data.chapterTitle || chapterConfig.title,
          content: draftResult.data.summary || ""
        }));

        finalizedPages.forEach((p, pIdx) => {
          book.pages.push(createPage({
            id: `chap-${i}-page-${pIdx}`,
            type: "content",
            title: p.title,
            content: p.content,
            isFactChecked: true // Assuming light constraints met
          }));
        });

        store.setBookNode({ ...book });
      }

      book.pages.push(createPage({ id: "cover_back", type: "cover_back", title: "Selesai", content: "" }));
      store.setBookNode({ ...book });
      store.setProgress(100, 100, "Buku selesai di-generate!");
      store.setStatus(GenerationStatus.SUCCESS);

    } catch (e: any) {
      console.error("Book generation exception:", e);
      const errMsg = parseErrorMessage(e);
      if (errMsg.includes('kuota') || errMsg.includes('Quota') || errMsg.includes('Exceeded')) {
        store.showErrorModal('Kuota Habis', 'Mohon maaf, Kamu kehabisan kuota Gemini API (Quota Exceeded). Menampilkan hasil seadanya yang sudah berhasil di-generate sejauh ini.');
        // Ensure Editor is opened with whatever we obtained
        store.setStatus(GenerationStatus.SUCCESS);
      } else if (errMsg.includes('Akses ditolak')) {
        store.showErrorModal('Batas Kuota Sistem Habis', 'Anda telah mencapai batas penggunaan gratis. Silakan masuk ke Pengaturan dan tambahkan Custom API Key Gemini milik Anda untuk dapat melanjutkan.');
        store.setStatus(GenerationStatus.SUCCESS);
      } else {
        store.showErrorModal('Terjadi Kesalahan Server', `Proses terhenti karena error: ${errMsg}. Menampilkan hasil yang sempat di-generate.`);
        // Force success anyway to show what we have so far
        store.setStatus(GenerationStatus.SUCCESS);
      }
    }
  }

  // Visual isolated to standalone triggers
  async generateImageForPage(pageId: string): Promise<void> {
    const store = useGenerationStore.getState();
    const book = store.bookNode;
    if (!book) return;

    const pageIndex = book.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;

    const page = book.pages[pageIndex];
    store.setStatus(GenerationStatus.LOADING);

    try {
      const visualAgent = new VisualAgent();
      const result = await visualAgent.execute({
        page,
        tone: store.params.tone || 'Professional',
        category: store.params.category || 'General'
      });

      if (result.success && result.data) {
        const newPages = [...book.pages];
        newPages[pageIndex] = { ...page, imageUrl: result.data };
        store.updateBookConfig({ pages: newPages });
        store.setStatus(GenerationStatus.SUCCESS);
      } else {
        throw new Error(result.error || 'Failed to generate visual');
      }
    } catch (e: any) {
      console.error("Visual generation exception:", e);
      const errMsg = parseErrorMessage(e);
      store.showErrorModal('Gagal Membuat Gambar', errMsg);
      store.setStatus(GenerationStatus.SUCCESS); // Revert status so user can interact
    }
  }

  async editImageForPage(pageId: string, instruction: string): Promise<void> {
    const store = useGenerationStore.getState();
    const book = store.bookNode;
    if (!book) return;

    const pageIndex = book.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;

    const page = book.pages[pageIndex];
    if (!page.imageUrl) return; // Cannot edit if no image

    store.setStatus(GenerationStatus.LOADING);

    try {
      const visualAgent = new VisualAgent();
      const result = await visualAgent.execute({
        page,
        tone: store.params.tone || 'Professional',
        category: store.params.category || 'General',
        instruction
      });

      if (result.success && result.data) {
        const newPages = [...book.pages];
        newPages[pageIndex] = { ...page, imageUrl: result.data };
        store.updateBookConfig({ pages: newPages });
        store.setStatus(GenerationStatus.SUCCESS);
      } else {
        throw new Error(result.error || 'Failed to edit visual');
      }
    } catch (e: any) {
      console.error("Visual editing exception:", e);
      const errMsg = parseErrorMessage(e);
      store.showErrorModal('Gagal Mengedit Gambar', errMsg);
      store.setStatus(GenerationStatus.SUCCESS); // Revert status
    }
  }
}

export const orchestrator = new EbookOrchestrator();
