import { EBookParams, ChapterOutline } from "../types";

export const CATEGORIES = [
  "Edukasi", "Lifestyle", "Resep", "Worksheet", "Bisnis", 
  "Kesehatan", "Self Improvement", "Parenting", "Teknologi", 
  "Motivasi", "Marketing", "Produktivitas", "Olahraga"
];

export const TARGET_AUDIENCES = [
  "Umum", "Pemula", "Profesional / Ahli", "Mahasiswa / Pelajar", 
  "Anak-anak", "Remaja", "Ibu Rumah Tangga", "Pengusaha / Pekerja"
];

export const TONES = [
  "Informatif & Edukatif", "Kasual & Santai", "Formal & Profesional", "Humoris & Menggelitik", 
  "Motivator & Menginspirasi", "Bercerita (Storytelling)"
];

export const PAGE_RANGES = ["Micro-Book (10-20 Halaman)", "Buku Singkat (30-50 Halaman)", "60-100 Halaman", "100-200 Halaman"];

export class ContextService {
  static getStrategyContext(params: EBookParams): string {
    return JSON.stringify({
      category: params.category,
      audience: params.targetAudience,
      tone: params.tone,
      pageRange: params.pageRange,
      userTopicHint: params.topic || "None"
    });
  }

  static getOutlineContext(topic: string, coreMessage: string, audience: string, pageRange: string): string {
    return JSON.stringify({ topic, coreMessage, audience, pageRange });
  }

  /**
   * Slices context tightly to only expose the active chapter and its overarching audience goal.
   * Ensures the system does not bleed tokens feeding Chapter 10 back into Chapter 11 computations.
   */
  static getWriterContext(chapter: ChapterOutline, audience: string, tone: string): string {
    return JSON.stringify({
      chapterTitle: chapter.title,
      subtopicsToCover: chapter.subtopics,
      targetAudience: audience,
      writingTone: tone,
      instructions: "Generate cohesive pages covering these subtopics deeply. Do not bleed into overarching book narratives, stay focused entirely on this specific chapter scope."
    });
  }

  static getReviewContext(draftPages: {title: string, content: string}[]): string {
    return JSON.stringify({
      draftToReview: draftPages.map(d => ({ title: d.title, snippetStart: d.content.substring(0, 300) })),
      instructions: "Ensure flow is logical across these drafted pages. Return the cleaned output."
    });
  }
}
