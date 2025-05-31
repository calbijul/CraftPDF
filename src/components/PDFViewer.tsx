import { useState, useEffect, type FC } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { TrashIcon } from '@heroicons/react/24/outline';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PDFViewerProps {
  pdfData: Uint8Array;
  onNumPages: (num: number) => void;
  splitMode: boolean;
  selectedPages: number[];
  togglePageSelection: (pageIndex: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onDragStart: (pageIndex: number) => void;
  onDrop: (pageIndex: number) => void;
}

export const PDFViewer: FC<PDFViewerProps> = ({
  pdfData,
  onNumPages,
  splitMode,
  selectedPages,
  togglePageSelection,
  onDeletePage,
  onDragStart,
  onDrop,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);

  useEffect(() => {
    if (!pdfData) return;
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [pdfData]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    const pages = Array.from({ length: numPages }, (_, i) => i);
    setVisiblePages(pages);
    onNumPages(numPages);
  };

  const handleDelete = (pageIndex: number) => {
    setVisiblePages((prev) => prev.filter((p) => p !== pageIndex));
    onDeletePage(pageIndex);
  };

  if (!blobUrl) return null;

  return (
    <div className="flex flex-col items-center space-y-6 mt-6">
      <Document
        file={blobUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => console.error('Error loading PDF:', error)}
      >
        {visiblePages.map((i) => {
          const isSelected = selectedPages.includes(i);
          return (
            <div
              key={`page_wrapper_${i}`}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              onClick={() => splitMode && togglePageSelection(i)}
              className={`relative bg-white shadow-lg mb-6 ${
                splitMode ? 'cursor-pointer' : 'cursor-auto'
              }`}
              style={{
                width: 600,
                border: splitMode
                  ? isSelected
                    ? '4px solid #FBBF24'
                    : '4px solid transparent'
                  : 'none',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(i);
                }}
                className="absolute top-1 -left-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 z-10"
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              <Page
                pageNumber={i + 1}
                width={600}
                renderAnnotationLayer
                renderTextLayer
              />

              {splitMode && (
                <div className="absolute top-1 right-1 bg-gray-700 text-white text-xs px-1 rounded">
                  {i + 1}
                </div>
              )}
            </div>
          );
        })}
      </Document>
    </div>
  );
};
