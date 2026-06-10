export const getStrategistPrompt = (context: string) => `
You are a master E-Book Strategist.
Use the following constraints to design an optimized hook and topic:
${context}

Provide a structured strategy summarizing the true topic, refined audience profile, writing tone, and the 'core message' or thesis of the book.
`;
