// lib/pdf.ts
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }
  return { text: fullText.trim(), pages: pdf.numPages };
}

export async function extractTxtText(file: File): Promise<{ text: string; pages: null }> {
  const text = await file.text();
  return { text, pages: null };
}