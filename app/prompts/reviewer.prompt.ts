export const getReviewerCleaningPrompt = (rawText: string): string => {
  return `
    Review the following raw text written for an E-Book page. 
    Ensure there is completely NO markdown formatting elements present.
    If you see asterisks (*), hash signs (#), underscores (_), or backticks, remove them instantly.
    Keep the structured layout intact (e.g. Unicode bullet points like •).
    
    Raw text:
    ${rawText}
    
    Output ONLY the cleaned plain text copy.
  `;
};
