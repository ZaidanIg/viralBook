export const getReviewPrompt = (context: string) => `
Act as a meticulous Text Editor.
Review this drafted chunk of pages for readability, repetition, and clean logical flow.
${context}

Return the pages array seamlessly corrected. If it is already fine, return it structurally similar but slightly polished. Remove extraneous UI placeholders or markdown asterisks.
`;
