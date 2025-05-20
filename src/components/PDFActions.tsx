import { type FC } from 'react';
import { rotatePDF, splitPDF, mergePDFs } from '../utils/pdfUtils';

interface PDFActionsProps {
  pdfData: Uint8Array;
  onUpdate: (data: Uint8Array) => void;
}

export const PDFActions: FC<PDFActionsProps> = ({ pdfData, onUpdate }) => {
  // Rotate entire PDF by 90°
  const handleRotate = async () => {
    const updated = await rotatePDF(pdfData);
    onUpdate(updated);
  };

  // Split PDF into individual pages and download each
  const handleSplit = async () => {
    const parts = await splitPDF(pdfData);
    parts.forEach((part, idx) => {
      const blob = new Blob([part], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `split-page-${idx + 1}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Merge PDF with itself as demo
  const handleMerge = async () => {
    const merged = await mergePDFs([pdfData, pdfData]);
    const blob = new Blob([merged], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download current PDF
  const handleDownload = () => {
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-center gap-4 mb-6 flex-wrap">
      <button onClick={handleRotate} className="px-4 py-2 bg-blue-500 text-white rounded">Rotate</button>
      <button onClick={handleSplit} className="px-4 py-2 bg-yellow-500 text-white rounded">Split</button>
      <button onClick={handleMerge} className="px-4 py-2 bg-green-600 text-white rounded">Merge</button>
      <button onClick={handleDownload} className="px-4 py-2 bg-purple-600 text-white rounded">Download</button>
    </div>
  );
};