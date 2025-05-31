// pdf_editor_app/src/App.tsx
import { useState, type FC, type ChangeEvent } from 'react';
import { PDFViewer } from './components/PDFViewer';
import { PDFActions } from './components/PDFActions';

const App: FC = () => {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (result instanceof ArrayBuffer) {
          setPdfData(new Uint8Array(result));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      {!pdfData && (
        <div className="bg-white rounded-lg  p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Upload PDF
          </h1>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="pdf-upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Choose File
          </label>
        </div>
      )}

      {pdfData && (
        <div className="w-full">
          <div className="bg-gray-900 rounded-b-lg p-4">
            <h1 className="text-2xl font-semibold text-gray-200 mb-4 text-center">
              PDF Editor
            </h1>
            <PDFActions pdfData={pdfData} onUpdate={setPdfData} />
          </div>
          <PDFViewer pdfData={pdfData} />
        </div>
      )}
    </div>
  );
};

export default App;
