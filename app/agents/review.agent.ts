import { GeminiService } from "../services/gemini.service";
import { getReviewPrompt } from "../prompts/review.prompt";
import { AgentResult } from "./base.agent";
import { Type, Schema } from "@google/genai";

export interface ReviewInput {
  draftPages: { title: string; content: string }[];
}

export interface ReviewOutput {
  reviewedPages: { title: string; content: string }[];
}

export class ReviewAgent {
  private schema: Schema = {
    type: Type.OBJECT,
    properties: {
      reviewedPages: {
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
    required: ["reviewedPages"]
  };

  async execute(input: ReviewInput): Promise<AgentResult<ReviewOutput>> {
    const prompt = getReviewPrompt(JSON.stringify(input.draftPages));

    try {
      const response = await GeminiService.requestStructured<ReviewOutput>(
        "review",
        prompt, 
        this.schema
      );
      
      return { success: true, data: response, retryable: false };
    } catch (error: any) {
      // Review is non-critical, act as passthrough on fail to save pipeline crash
      return { success: true, data: { reviewedPages: input.draftPages }, retryable: false }; 
    }
  }
}
