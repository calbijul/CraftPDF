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

// Split PDF into separate single-page documents
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

// Merge multiple PDFs into one
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
