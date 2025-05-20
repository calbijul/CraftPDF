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
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">PDF Editor</h1>
      <div className="mb-4 flex justify-center">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>
      {pdfData && (
        <>
          <PDFActions pdfData={pdfData} onUpdate={setPdfData} />
          <PDFViewer pdfData={pdfData} />
        </>
      )}
    </div>
  );
};

export default App;