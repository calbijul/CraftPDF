import { useState, useEffect, type FC } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PDFViewerProps {
  pdfData: Uint8Array;
}

export const PDFViewer: FC<PDFViewerProps> = ({ pdfData }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Create blob URL only when pdfData is valid
  useEffect(() => {
    if (!pdfData) return;

    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdfData]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (!blobUrl) return <div>Loading PDF...</div>;

  return (
    <div className="space-y-4 flex flex-col items-center">
      <Document
        file={blobUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => console.error('Error loading PDF:', error)}
        loading={<div>Loading PDF...</div>}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={`page_${i + 1}`}
            pageNumber={i + 1}
            width={600}
            renderAnnotationLayer
            renderTextLayer
          />
        ))}
      </Document>
    </div>
  );
};
