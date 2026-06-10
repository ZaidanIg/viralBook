export const getOutlinePrompt = (context: string) => `
You are a Principal Publishing Architect.
Review this book strategy (including the requested page length 'pageRange'):
${context}

Create exactly 3 structural outline variations for this book.
Each option must have:
- A compelling title
- A focused list of 5 to 7 highly impactful chapters. Do not over-expand to 20+ chapters.
- 2 to 3 concise subtopics per chapter.
- Keep descriptions short and to the point.
`;
