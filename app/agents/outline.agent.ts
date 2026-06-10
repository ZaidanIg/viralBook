import { GeminiService } from "../services/gemini.service";
import { getOutlinePrompt } from "../prompts/outline.prompt";
import { ContextService } from "../services/context.service";
import { AgentResult } from "./base.agent";
import { OutlineOption } from "../types";
import { Type, Schema } from "@google/genai";

export interface OutlineInput {
  topic: string;
  coreMessage: string;
  audience: string;
  pageRange: string;
}

export class OutlineAgent {
  private schema: Schema = {
    type: Type.OBJECT,
    properties: {
      options: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            title: { type: Type.STRING },
            chapters: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtopics: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "subtopics"]
              }
            }
          },
          required: ["id", "title", "chapters"]
        }
      }
    },
    required: ["options"]
  };

  async execute(input: OutlineInput): Promise<AgentResult<{ options: OutlineOption[] }>> {
    const context = ContextService.getOutlineContext(input.topic, input.coreMessage, input.audience, input.pageRange);
    const prompt = getOutlinePrompt(context);

    try {
      const response = await GeminiService.requestStructured<{ options: OutlineOption[] }>(
        "outline",
        prompt, 
        this.schema
      );
      return { success: true, data: response, retryable: false };
    } catch (error: any) {
      return { success: false, error: error.message, retryable: true };
    }
  }
}
