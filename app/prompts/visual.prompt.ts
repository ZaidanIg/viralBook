import { BookPage } from "../types/index";

export const getVisualPrompt = (
  page: BookPage,
  tone: string,
  category: string,
): string => {
  const visualContext = `
    Theme Category: ${category}.
    Visual Style: High-End Photorealistic Photography, Cinematic Lighting, 8k Resolution.
    Tone: ${tone}.
    Constraint: NO Text, NO Letters, NO Watermarks, NO 3D Renders, NO Illustrations, NO Cartoons.
  `;

  const pageTopic = page.title || "Book Page";

  if (page.type === "cover_front") {
    return `
      **DESIGN TASK: PHOTOREALISTIC COVER BACKGROUND (Vertical 9:16)**
      **TOPIC:** ${pageTopic}
      **CONTEXT:** ${visualContext}
      
      **CRITICAL INSTRUCTION:**
      - Style: Award-winning photography, Hyper-realistic, 8k.
      - Composition: Minimalist and clean.
      - Negative Space: Create a large, clean, uncluttered area (like a clear sky, a blurred wall, or a solid surface) in the CENTER or TOP. This is essential for text placement.
      - Colors: Sophisticated, ${category}-themed palette.
      - Do NOT use: 2D art, vectors, cartoons.
    `;
  }
  if (page.type === "cover_back") {
    return `
      **DESIGN TASK: CLEAN TEXTURE BACKGROUND (Vertical 9:16)**
      **CONTEXT:** ${visualContext}
      
      **CRITICAL INSTRUCTION:**
      - Style: High-quality material photography (e.g., paper texture, marble, blurred bokeh, fabric).
      - Composition: Extremely clean and minimalist.
      - Purpose: Background for reading text.
      - Do NOT use: Busy patterns, text, high contrast elements.
    `;
  }
  if (page.type === "toc") {
    return `
      **DESIGN TASK: MINIMALIST BACKGROUND FOR TABLE OF CONTENTS (Vertical 9:16)**
      **CONTEXT:** ${visualContext}
      
      **CRITICAL INSTRUCTION:**
      - Style: Abstract Photography, Soft Focus, Macro Photography.
      - Composition: Frame the image with subtle elements on the edges (e.g., leaves, shadows, light leaks).
      - Center Area: MUST be clean/empty/solid color or very soft blur.
      - Do NOT use: Text, Numbers, Busy details.
    `;
  }
  if (page.type === "chapter_title") {
    return `
      **DESIGN TASK: CINEMATIC CHAPTER BACKGROUND (Vertical 9:16)**
      **TOPIC:** ${pageTopic}
      **CONTEXT:** ${visualContext}
      
      **CRITICAL INSTRUCTION:**
      - Style: Cinematic Movie Still, Dramatic Lighting, Photorealistic.
      - Composition: Atmospheric and moody.
      - Negative Space: Leave the CENTER clear (e.g., through depth of field/blur) for large typography.
      - Subject: Subtle visual representation of "${pageTopic}".
    `;
  }

  // Content page background with Copy Space spacing
  return `
    **DESIGN TASK: EDITORIAL BACKGROUND PHOTO (Vertical 9:16)**
    **TOPIC:** ${pageTopic}
    **CONTEXT:** ${visualContext}
    
    **CRITICAL INSTRUCTION:**
    - Style: Professional Stock Photography, Magazine Style, Realism.
    - Layout: "Copy Space" composition.
    - Composition: The subject should be small or off-center (Top 20% or Bottom 20%).
    - Main Area: The rest of the image (80%) MUST be a clean, solid, or heavily blurred background (Bokeh) to allow text readability.
    - Do NOT use: Busy backgrounds, illustrations.
  `;
};
