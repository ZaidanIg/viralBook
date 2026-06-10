import { GeminiService } from "../services/gemini.service";
import { getStrategistPrompt } from "../prompts/strategist.prompt";
import { ContextService } from "../services/context.service";
import { AgentResult } from "./base.agent";
import { EBookParams } from "../types";
import { Type, Schema } from "@google/genai";

export interface StrategistOutput {
  topic: string;
  targetAudience: string;
  tone: string;
  coreMessage: string;
  pageRange: string;
}

export class StrategistAgent {
  private schema: Schema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      targetAudience: { type: Type.STRING },
      tone: { type: Type.STRING },
      coreMessage: { type: Type.STRING },
      pageRange: { type: Type.STRING }
    },
    required: ["topic", "targetAudience", "tone", "coreMessage", "pageRange"]
  };

  async execute(input: EBookParams): Promise<AgentResult<StrategistOutput>> {
    const context = ContextService.getStrategyContext(input);
    const prompt = getStrategistPrompt(context);
    
    try {
      const output = await GeminiService.requestStructured<StrategistOutput>(
        "strategist",
        prompt,
        this.schema
      );
      return { success: true, data: output, retryable: false };
    } catch (error: any) {
      return { success: false, error: error.message, retryable: true };
    }
  }
}
