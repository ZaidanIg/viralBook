import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  ImageRun,
  AlignmentType,
} from "docx";
import FileSaver from "file-saver";
import { GeneratedBook, BookPage } from "../types/index";

// Declare window interface to satisfy TypeScript for global library
declare global {
  interface Window {
    html2pdf: any;
  }
}

// --- SHARED HELPER: GENERATE HTML CONTENT ---
// Used for both PDF Export and "Copy to Google Docs"
const generateBookHTML = (book: GeneratedBook, isPdf: boolean = false): string => {
  const mapFontSizeToPx = (sizeClass?: string) => {
    const map: Record<string, string> = {
      'xs': '12px', 'sm': '14px', 'base': '16px', 'lg': '18px',
      'xl': '20px', '2xl': '24px', '3xl': '30px', '4xl': '36px',
      '5xl': '48px', '6xl': '60px', '7xl': '72px',
    };
    return map[sizeClass || ''] || '24px';
  };

  // Helper to generate styles for DOCX
  const getPageStyle = (page: BookPage) => {
    const titleFont = page.titleStyle?.fontFamily || 'Inter';
    const contentFont = page.contentStyle?.fontFamily || 'Inter';
    
    const titleCss = `font-family: '${titleFont}', sans-serif; font-size: ${mapFontSizeToPx(page.titleStyle?.fontSize)}; font-weight: bold; margin-bottom: 20px; text-align: ${page.titleStyle?.textAlign || 'left'}; color: #000; line-height: 1.2;`;
    const contentCss = `font-family: '${contentFont}', sans-serif; font-size: 14px; line-height: 1.6; text-align: ${page.contentStyle?.textAlign || 'left'}; color: #333;`;
    return { titleFont, titleCss, contentCss };
  };

  let htmlContent = "";

  // Wrapper for clipboard compatibility (for PDF, html2pdf will capture this)
  const wrapperStyle = isPdf 
    ? `font-family: sans-serif; width: 794px; background-color: #1a1a1a; text-align: left;`
    : `font-family: sans-serif; max-width: 800px; margin: 0 auto; color: #000; background-color: #fff; text-align: left;`;
  htmlContent += `<div style="${wrapperStyle}">`;

  book.pages.forEach((page, index) => {
    let pageInnerHtml = "";

    if (isPdf) {
      // PDF: Exact replica of PageCard layout (A4 aspect ratio approx 1:1.414 -> 794x1123 at 96PPI)
      const bgColor = page.type === 'content' ? '#1e1e1e' : '#1a1a1a';
      
      let bgHtml = '';
      if (page.imageUrl && page.type !== 'content') {
         bgHtml = `
            <div style="position: absolute; inset: 0; background-image: url('${page.imageUrl}'); background-size: cover; background-position: center; width: 100%; height: 100%; z-index: 0;"></div>
            <div style="position: absolute; inset: 0; background-color: rgba(0,0,0,${page.overlayOpacity ?? 0.5}); z-index: 1;"></div>
         `;
         // Note: html2canvas does not support backdrop-filter well, so we rely on overlayOpacity.
      } else if (page.type === 'content') {
         bgHtml = `<div style="position: absolute; inset: 0; background-color: #1e1e1e; z-index: 0;"></div>`;
      }

      const contentParagraphs = page.content 
          ? page.content.split('\n').map(p => `<div>${p}</div>`).join('')
          : '';

      const titleElem = `<div style="font-family: ${page.titleStyle?.fontFamily || 'Inter, sans-serif'}; color: ${page.titleStyle?.color || '#ffffff'}; font-size: ${page.titleStyle?.fontSize || 24}px; font-weight: ${page.titleStyle?.fontWeight || 'bold'}; font-style: ${page.titleStyle?.fontStyle || 'normal'}; text-align: ${page.titleStyle?.textAlign || 'center'}; margin-bottom: 32px;">${page.title || ''}</div>`;
      
      const contentElem = `<div style="font-family: ${page.contentStyle?.fontFamily || 'Inter, sans-serif'}; color: ${page.contentStyle?.color || '#dddddd'}; font-size: ${page.contentStyle?.fontSize || 16}px; font-weight: ${page.contentStyle?.fontWeight || 'normal'}; font-style: ${page.contentStyle?.fontStyle || 'normal'}; text-align: ${page.contentStyle?.textAlign || 'left'}; min-height: 400px; line-height: 1.6;">${contentParagraphs}</div>`;

      // 794px x 1123px represents standard A4 size at 96 PPI. This ensures exact page breaks!
      pageInnerHtml = `
         <div style="position: relative; width: 794px; min-height: 1123px; display: flex; flex-direction: column; overflow: hidden; background-color: ${bgColor}; box-sizing: border-box; page-break-inside: avoid;">
            ${bgHtml}
            <div style="position: relative; z-index: 2; display: flex; flex-direction: column; padding: 64px; flex: 1; width: 100%; box-sizing: border-box;">
               ${titleElem}
               ${contentElem}
            </div>
         </div>
      `;
    } else {
      // DOCS CLIPBOARD
      const { titleFont, titleCss, contentCss } = getPageStyle(page);

      const imageHtml = page.imageUrl
        ? `<div style="text-align: center; margin-bottom: 20px; page-break-inside: avoid;"><img src="${page.imageUrl}" width="500" style="max-width: 100%; height: auto; display: inline-block;" /></div>`
        : "";

      const contentParagraphs = page.content 
          ? page.content.split('\n').filter(p => p.trim() !== '').map(p => `<p style="margin-bottom: 1em; page-break-inside: avoid;">${p}</p>`).join('')
          : '';

      const pageContainerStyle = "padding: 40px; box-sizing: border-box; background: white; margin-bottom: 0;";

      if (page.type === "cover_front") {
        const bgLayer = page.imageUrl 
          ? `background-image: url('${page.imageUrl}'); background-size: cover; background-position: center;`
          : `background-color: #111;`;
        const overlay = page.imageUrl ? `background: rgba(0, 0, 0, 0.6);` : ``;

        pageInnerHtml = `
              <div style="box-sizing: border-box; margin-bottom: 0; width: 100%; padding: 0; min-height: 850px; position: relative; overflow: hidden; ${bgLayer} display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-inside: avoid;">
                  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; ${overlay} z-index: 1;"></div>
                  <div style="z-index: 2; padding: 40px; width: 100%; display: flex; flex-direction: column; align-items: center;">
                    <h1 style="font-size: 56px; font-weight: bold; line-height: 1.2; margin-bottom: 24px; font-family: '${titleFont}', sans-serif; text-align: center; color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.5);">${page.title}</h1>
                    <div style="font-size: 24px; color: #f0f0f0; max-width: 600px; margin: 0 auto; line-height: 1.6; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">${contentParagraphs}</div>
                  </div>
              </div>
          `;
      } else {
        pageInnerHtml = `
              <div style="${pageContainerStyle}">
                  ${page.type !== "chapter_title" ? `<h2 style="${titleCss} page-break-after: avoid;">${page.title}</h2>` : ""}
                  ${imageHtml}
                  ${
                    page.type === "chapter_title"
                      ? `<div style="page-break-inside: avoid; text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 600px;"><h1 style="font-size: 36px; font-weight: bold; line-height: 1.2; text-align: center; margin-bottom: 16px; font-family: '${titleFont}', sans-serif;">${page.title}</h1><div style="text-align:center; font-style: italic; font-size: 20px; color: #555; max-width: 500px; margin: 0 auto;">${contentParagraphs}</div></div>`
                      : `<div style="${contentCss}">${contentParagraphs}</div>`
                  }
              </div>
          `;
      }
    }

    // Use CSS page break
    const pageBreak =
      index < book.pages.length - 1
        ? '<div style="page-break-after: always; clear: both; height: 1px;"></div>'
        : "";
    htmlContent += pageInnerHtml + pageBreak;
  });

  htmlContent += `</div>`;

  return htmlContent;
};

// --- CLIPBOARD EXPORT (GOOGLE DOCS) ---
export const copyForGoogleDocs = async (book: GeneratedBook) => {
  try {
    const htmlContent = generateBookHTML(book);

    // Create Blobs for Clipboard
    // We provide both HTML (for formatting) and Text (fallback)
    const blobHtml = new Blob([htmlContent], { type: "text/html" });
    const blobText = new Blob(
      [
        book.pages
          .map((p) => `${p.title}\n\n${p.content}`)
          .join("\n\n----------------\n\n"),
      ],
      { type: "text/plain" },
    );

    const data = [
      new ClipboardItem({
        ["text/html"]: blobHtml,
        ["text/plain"]: blobText,
      }),
    ];

    await navigator.clipboard.write(data);
    return true;
  } catch (e) {
    console.error("Clipboard copy failed", e);
    throw e;
  }
};

// --- PDF EXPORT LOGIC ---

import generatePDF from 'react-to-pdf';

export const exportToPDF = async (book: GeneratedBook) => {
  const htmlContent = generateBookHTML(book, true);

  // Create an invisible container in the document
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "794px"; // Strict A4 width
  container.style.zIndex = "-9999";
  container.style.backgroundColor = "#1a1a1a";
  
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Wait for all images to naturally load
    const images = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Ignore errors to proceed
        });
      })
    );

    // Minor delay to ensure CSS paints
    await new Promise(r => setTimeout(r, 200));

    const options = {
      filename: `${book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`,
      page: {
        margin: 0,
      },
      canvas: {
        useCORS: true,
      },
      overrides: {
        canvas: {
          windowWidth: 794
        }
      }
    };
    
    await generatePDF(() => container, options);
  } catch (e) {
    console.error("PDF Export Error:", e);
    throw e;
  } finally {
    document.body.removeChild(container);
  }
};

// --- WORD (DOCX) EXPORT LOGIC ---

// Helper to convert Data URI to Blob/ArrayBuffer
const dataURItoBlob = (dataURI: string) => {
  try {
    if (!dataURI || !dataURI.includes(",")) return null;
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.error("DataURI parse error", e);
    return null;
  }
};

export const exportToWord = async (book: GeneratedBook) => {
  const children: any[] = [];

  for (const page of book.pages) {
    // 1. Handle Image
    if (page.imageUrl) {
      try {
        let imageBuffer: ArrayBuffer | null = null;
        let imgWidth = 500;
        let imgHeight = 500;

        let imageBlob: Blob | null = null;
        if (page.imageUrl.startsWith("data:")) {
           imageBlob = dataURItoBlob(page.imageUrl);
        } else {
           // Provide fallback for URL based images (unsplash, pollinations, etc)
           const res = await fetch(page.imageUrl);
           imageBlob = await res.blob();
        }

        if (imageBlob) {
            imageBuffer = await imageBlob.arrayBuffer();
            
            // Get original image dimensions to prevent stretching
            const dimensions = await new Promise<{width: number, height: number}>((resolve) => {
              const url = URL.createObjectURL(imageBlob as Blob);
              const img = new Image();
              img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(url);
              };
              img.onerror = () => {
                resolve({ width: 500, height: 500 });
                URL.revokeObjectURL(url);
              };
              img.src = url;
            });

            // Scale down if too big for Word A4 page width (~500px usable)
            const maxWidth = 500;
            const maxHeight = 700;
            let finalWidth = dimensions.width;
            let finalHeight = dimensions.height;
            if (finalWidth > maxWidth) {
               finalHeight = (maxWidth / finalWidth) * finalHeight;
               finalWidth = maxWidth;
            }
            if (finalHeight > maxHeight) {
               finalWidth = (maxHeight / finalHeight) * finalWidth;
               finalHeight = maxHeight;
            }
            
            imgWidth = finalWidth || 500;
            imgHeight = finalHeight || 500;
        }

        if (imageBuffer) {
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: imgWidth,
                    height: imgHeight,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          );
        }
      } catch (e) {
        console.warn("Failed to add image to DOCX", e);
      }
    }

    // 2. Handle Title
    if (page.type === "cover_front") {
      children.push(
        new Paragraph({
          text: page.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        }),
      );
    } else if (page.type === "chapter_title") {
      children.push(
        new Paragraph({
          text: page.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
          pageBreakBefore: true,
        }),
      );
    } else {
      children.push(
        new Paragraph({
          text: page.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      );
    }

    // 3. Handle Content
    // Split content by newlines to create proper paragraphs
    const paragraphs = page.content
      ? page.content.split("\n").filter((p) => p.trim().length > 0)
      : [];

    if (paragraphs.length > 0) {
      paragraphs.forEach((paraText) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paraText,
                size: 24, // 12pt
                font: "Calibri",
              }),
            ],
            spacing: { after: 120 },
          }),
        );
      });
    } else {
      // Fallback for empty content pages to ensure structure
      children.push(new Paragraph({ text: "" }));
    }

    // 4. Page Break (except for last page)
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
    );
  }

  // Ensure sections is not empty
  if (children.length === 0) {
    children.push(new Paragraph({ text: "Empty Book" }));
  }

  // Create Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // Generate and Save
  const blob = await Packer.toBlob(doc);

  // Handle saveAs safely
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, `${book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`);
};
