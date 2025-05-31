// pdf_editor_app/src/components/PDFActions.tsx
import { type FC } from 'react';
import {
  ArrowPathIcon,
  ScissorsIcon,
  DocumentPlusIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
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
    <div className=" rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-center gap-6 flex-wrap">
        <button
          onClick={handleRotate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full transition"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Rotate</span>
        </button>

        <button
          onClick={handleSplit}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-full transition"
        >
          <ScissorsIcon className="h-5 w-5" />
          <span>Split</span>
        </button>

        <button
          onClick={handleMerge}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-full transition"
        >
          <DocumentPlusIcon className="h-5 w-5" />
          <span>Merge</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-full transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
