export const getResearcherPrompt = (
  topic: string,
  category: string,
  audience: string,
  tone: string,
): string => {
  return `
    Based on the topic "${topic}" (Category: ${category}, Audience: ${audience}), 
    create 3 DISTINCT and unique book outline concepts.
    
    For EACH concept, provide:
    1. A catchy Title.
    2. Exactly 5 Chapter Titles (Bab 1 to Bab 5).
    3. Do NOT use Markdown syntax or formatting in chapter titles.

    Tone: ${tone}.
  `;
};
