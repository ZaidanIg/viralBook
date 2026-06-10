import { BaseAgent } from "./base.agent";
import { AgentResult, GeneratedBook } from "../types";
import { exportToPDF, exportToWord, copyForGoogleDocs } from "../services/export.service";

export interface PublisherInput {
  book: GeneratedBook;
  format: "PDF" | "DOCX" | "CLIPBOARD";
}

export class PublisherAgent extends BaseAgent<PublisherInput, boolean> {
  async execute(input: PublisherInput): Promise<AgentResult<boolean>> {
    try {
      if (input.format === "PDF") {
        await exportToPDF(input.book);
      } else if (input.format === "DOCX") {
        await exportToWord(input.book);
      } else if (input.format === "CLIPBOARD") {
        const success = await copyForGoogleDocs(input.book);
        if (!success) return this.fail("Clipboard copy failed", false);
      }
      return this.success(true);
    } catch (e: any) {
      return this.fail(e.message, false);
    }
  }
}
