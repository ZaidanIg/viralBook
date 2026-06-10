import { GeminiService } from "../services/gemini.service";
import { getWriterPrompt } from "../prompts/writer.prompt";
import { ContextService } from "../services/context.service";
import { AgentResult } from "./base.agent";
import { ChapterOutline } from "../types";
import { Type, Schema } from "@google/genai";

export interface WriterInput {
  chapter: ChapterOutline;
  audience: string;
  tone: string;
}

export interface WriterOutput {
  chapterTitle: string;
  summary: string;
  pages: { title: string; content: string }[];
}

export class WriterAgent {
  private schema: Schema = {
    type: Type.OBJECT,
    properties: {
      chapterTitle: { type: Type.STRING },
      summary: { type: Type.STRING },
      pages: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "content"]
        }
      }
    },
    required: ["chapterTitle", "summary", "pages"]
  };

  async execute(input: WriterInput): Promise<AgentResult<WriterOutput>> {
    const context = ContextService.getWriterContext(input.chapter, input.audience, input.tone);
    const prompt = getWriterPrompt(context);
    
    try {
      const response = await GeminiService.requestStructured<WriterOutput>(
        "writer", // uses flash natively
        prompt, 
        this.schema,
        2
      );
      return { success: true, data: response, retryable: false };
    } catch (error: any) {
      return { success: false, error: error.message, retryable: true };
    }
  }
}
