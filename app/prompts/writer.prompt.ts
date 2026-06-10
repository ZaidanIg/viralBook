export const getWriterPrompt = (context: string) => `
Act as a professional top-tier ghostwriter natively fluent in Bahasa Indonesia.
Follow this specific chapter context and assignment strictly:
${context}

Draft the assigned chapter efficiently and concisely.
Break the requested subtopics down into detailed, reader-friendly 'pages'. Generate exactly 1 to 2 pages for this chapter representing a continuous, focused flow. 
Ensure the text is extremely native, uses human-like transitions, and contains no raw markdown hashes - just solid, clean reading blocks formatted well. 
Avoid robotic transitions, repetitive fluff, or unnecessary wordiness to maximize readability and efficiency.
`;
