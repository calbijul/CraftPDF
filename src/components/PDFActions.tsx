// src/components/PDFActions.tsx
import { useState, type FC, type ChangeEvent, useRef } from 'react';
import {
  ArrowPathIcon,
  ScissorsIcon,
  DocumentPlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import {
  rotatePDF,
  mergePDFs,
  extractPages,
} from '../utils/pdfUtils';

interface PDFActionsProps {
  pdfData: Uint8Array;
  onUpdate: (data: Uint8Array) => void;
  onReupload: (e: ChangeEvent<HTMLInputElement>) => void;
  numPages: number;
  splitMode: boolean;
  toggleSplitMode: () => void;
  selectedPages: number[];
  setSelectedPages: (pages: number[]) => void;
}

export const PDFActions: FC<PDFActionsProps> = ({
  pdfData,
  onUpdate,
  onReupload,
  numPages,
  splitMode,
  toggleSplitMode,
  selectedPages,
  setSelectedPages,
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const mergeInputRef = useRef<HTMLInputElement | null>(null);

  // Rotate entire PDF by 90°
  const handleRotate = async () => {
    setIsRotating(true);
    try {
      const updated = await rotatePDF(pdfData);
      onUpdate(updated);
    } catch (err) {
      console.error('Error during rotate:', err);
    } finally {
      setIsRotating(false);
    }
  };

  // Trigger the hidden merge file input
  const handleMerge = () => {
    mergeInputRef.current?.click();
  };

  // When user selects a PDF to merge, read and perform merge
  const handleMergeUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result;
      if (result instanceof ArrayBuffer) {
        try {
          // Merge current pdfData with the newly uploaded PDF
          const newPdfBytes = new Uint8Array(result);
          const merged = await mergePDFs([pdfData, newPdfBytes]);
          onUpdate(merged);
        } catch (err) {
          console.error('Error during merge:', err);
          alert('Failed to merge PDFs.');
        }
      }
      // Clear the input value so the same file can be selected again if needed
      if (mergeInputRef.current) {
        mergeInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
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

  // Create a new PDF with only the selected pages
  const handleCreateSplit = async () => {
    if (selectedPages.length === 0) {
      alert('Please select at least one page by clicking on it.');
      return;
    }
    try {
      const extracted = await extractPages(pdfData, selectedPages);
      const blob = new Blob([extracted], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Download name shows the selected pages in 1-based form
      a.download = `split-pages-${selectedPages.map((i) => i + 1).join('-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      // Exit split mode and clear selections
      toggleSplitMode();
      setSelectedPages([]);
    } catch (err) {
      console.error('Error during extractPages:', err);
      alert('Failed to create split PDF.');
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-gray-900">
      <div className="flex justify-center gap-4 p-4 flex-wrap items-center">
        {/* Display total page count */}
         <div className="fixed bottom-4 right-4 bg-gray-800 text-gray-200 text-sm px-3 py-1 rounded shadow-lg">
      Pages: {numPages}
    </div>

        {/* Rotate Button with spinner */}
        <button
          onClick={handleRotate}
          className={`flex items-center gap-2 ${
            isRotating
              ? 'bg-gray-600 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold px-4 py-2 rounded-full transition`}
          disabled={isRotating}
        >
          {isRotating ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowPathIcon className="h-5 w-5" />
          )}
          <span>{isRotating ? 'Rotating...' : 'Rotate'}</span>
        </button>

        {/* Toggle Split Mode */}
        <button
          onClick={toggleSplitMode}
          className={`flex items-center gap-2 ${
            splitMode
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-yellow-500 hover:bg-yellow-600'
          } text-white font-semibold px-4 py-2 rounded-full transition`}
        >
          <ScissorsIcon className="h-5 w-5" />
          <span>{splitMode ? 'Cancel Split' : 'Split'}</span>
        </button>

        {/* Merge Button */}
        <button
          onClick={handleMerge}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-full transition"
        >
          <DocumentPlusIcon className="h-5 w-5" />
          <span>Merge</span>
        </button>

        {/* Hidden merge file input */}
        <input
          ref={mergeInputRef}
          id="pdf-merge-upload"
          type="file"
          accept="application/pdf"
          onChange={handleMergeUpload}
          className="hidden"
        />

        {/* Download current PDF */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-full transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Download</span>
        </button>

        {/* Hidden input for “Upload New PDF” */}
        <input
          id="pdf-reupload"
          type="file"
          accept="application/pdf"
          onChange={onReupload}
          className="hidden"
        />
        {/* “Upload New” button */}
        <label
          htmlFor="pdf-reupload"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-full transition cursor-pointer"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          <span>Upload New</span>
        </label>

        {/* Show “Create Split PDF” only when in split mode */}
        {splitMode && (
          <button
            onClick={handleCreateSplit}
            className="flex items-center gap-2 bg-yellow-700 hover:bg-yellow-800 text-white font-semibold px-4 py-2 rounded-full transition"
          >
            <ScissorsIcon className="h-5 w-5" />
            <span>Create Split PDF</span>
          </button>
        )}
      </div>
    </div>
  );
};
