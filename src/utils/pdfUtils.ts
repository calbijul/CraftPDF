// src/utils/pdfUtils.ts
import { PDFDocument, degrees } from 'pdf-lib';

// Rotate all pages by 90°
export async function rotatePDF(input: Uint8Array): Promise<Uint8Array> {
  const cloned = new Uint8Array(input);
  const pdfDoc = await PDFDocument.load(cloned);
  const pages = pdfDoc.getPages();
  pages.forEach((page) => {
    const angle = (page.getRotation().angle + 90) % 360;
    page.setRotation(degrees(angle));
  });
  return await pdfDoc.save();
}

// Split PDF into separate single-page documents (unchanged)
export async function splitPDF(input: Uint8Array): Promise<Uint8Array[]> {
  const cloned = new Uint8Array(input);
  const pdfDoc = await PDFDocument.load(cloned);
  const pages = pdfDoc.getPages();
  const outputs: Uint8Array[] = [];
  for (let i = 0; i < pages.length; i++) {
    const newDoc = await PDFDocument.create();
    const [copied] = await newDoc.copyPages(pdfDoc, [i]);
    newDoc.addPage(copied);
    outputs.push(await newDoc.save());
  }
  return outputs;
}

// Merge multiple PDFs into one (unchanged)
export async function mergePDFs(inputs: Uint8Array[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const data of inputs) {
    const cloned = new Uint8Array(data);
    const pdf = await PDFDocument.load(cloned);
    const copied = await merged.copyPages(pdf, pdf.getPageIndices());
    copied.forEach((page) => merged.addPage(page));
  }
  return await merged.save();
}

// Extract specific pages (zero-based indices) into one PDF (unchanged)
export async function extractPages(
  input: Uint8Array,
  pageIndices: number[]
): Promise<Uint8Array> {
  const cloned = new Uint8Array(input);
  const pdfDoc = await PDFDocument.load(cloned);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));
  return await newDoc.save();
}

// DELETE a single page by index (zero-based)
export async function deletePage(
  input: Uint8Array,
  pageIndex: number
): Promise<Uint8Array> {
  const cloned = new Uint8Array(input);
  const pdfDoc = await PDFDocument.load(cloned);
  pdfDoc.removePage(pageIndex);
  return await pdfDoc.save();
}

// REORDER pages according to newIndices array (zero-based)
export async function reorderPages(
  input: Uint8Array,
  newIndices: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(input);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(pdfDoc, newIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));
  return await newDoc.save();
}
