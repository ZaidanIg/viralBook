import { GeneratedBook } from "../types";

const EBOOK_DRAFT_KEY = "ezbook_active_draft";

export const storageService = {
  /**
   * Save active book state/draft.
   */
  saveDraft(book: GeneratedBook): void {
    try {
      localStorage.setItem(EBOOK_DRAFT_KEY, JSON.stringify(book));
    } catch (e) {
      console.error("Failed to save draft to localStorage", e);
    }
  },

  /**
   * Loaded active draft if present.
   */
  loadDraft(): GeneratedBook | null {
    try {
      const data = localStorage.getItem(EBOOK_DRAFT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load draft from localStorage", e);
      return null;
    }
  },

  /**
   * Clear work draft.
   */
  clearDraft(): void {
    try {
      localStorage.removeItem(EBOOK_DRAFT_KEY);
    } catch (e) {
      console.error("Failed to clear draft from localStorage", e);
    }
  },
};
