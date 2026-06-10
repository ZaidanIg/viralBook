import { BaseAgent } from "./base.agent";
import { GeminiService } from "../services/gemini.service";
import { getVisualPrompt } from "../prompts/visual.prompt";
import { AgentResult, BookPage } from "../types";

export interface VisualInput {
  page: BookPage;
  tone: string;
  category: string;
  instruction?: string; // If present, implies we are EDITING an existing image
}

export class VisualAgent extends BaseAgent<VisualInput, string> {
  async execute(input: VisualInput): Promise<AgentResult<string>> {
    const prompt = input.instruction
      ? `Edit this image to be PHOTOREALISTIC and High Quality based on: ${input.instruction}. 
         CRITICAL: Maintain a clean area (negative space) for text overlay. 
         Do NOT add letters or text. Do NOT make it look like a cartoon sketch or a 3D clay render.`
      : getVisualPrompt(input.page, input.tone, input.category);

    try {
      const base64Output = await GeminiService.requestImage(prompt, input.instruction ? input.page.imageUrl : undefined);
      
      if (!base64Output) {
        return this.fail("Visual model generated an empty image.", true);
      }
      
      return this.success(base64Output);
    } catch (error: any) {
      return this.fail(error.message, true);
    }
  }
}
