// src/App.tsx
import { useState, type FC, type ChangeEvent } from 'react';
import { PDFViewer } from './components/PDFViewer';
import { PDFActions } from './components/PDFActions';
import { deletePage, reorderPages } from './utils/pdfUtils';

const App: FC = () => {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  // Split‐mode: when true, clicking on pages in the viewer toggles selection
  const [splitMode, setSplitMode] = useState<boolean>(false);
  // 0-based indices of selected pages
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  // Track the drag source index for reordering
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);

  // Shared handler to read a chosen PDF file into pdfData
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (result instanceof ArrayBuffer) {
          setPdfData(new Uint8Array(result));
          setSplitMode(false);
          setSelectedPages([]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Delete a single page
  const handleDeletePage = async (pageIndex: number) => {
    if (!pdfData) return;
    const updated = await deletePage(pdfData, pageIndex);
    setPdfData(updated);
    // Clear selection if in split mode
    setSelectedPages((prev) => prev.filter((i) => i !== pageIndex));
  };

  // Reorder pages when drag-and-drop
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (!pdfData) return;
    // Build new index array, then regenerate PDF
    const indices = Array.from({ length: numPages }, (_, i) => i);
    // Move element at fromIndex to toIndex
    const [moved] = indices.splice(fromIndex, 1);
    indices.splice(toIndex, 0, moved);
    const updated = await reorderPages(pdfData, indices);
    setPdfData(updated);
    // Clear selection and split mode
    setSplitMode(false);
    setSelectedPages([]);
  };

  const toggleSplitMode = () => {
    setSplitMode((prev) => {
      const newMode = !prev;
      if (!newMode) setSelectedPages([]);
      return newMode;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
    
      {!pdfData && (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md text-center">
            <h1 className="text-3xl font-semibold text-gray-200 mb-6">
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
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-white hover:text-gray-800 transition"
            >
              Choose File
            </label>
          </div>
        </div>
      )}

      {pdfData && (
        <div className="w-full">
          {/* Fixed Header + Action Bar */}
          <div className="fixed top-0 left-0 w-full bg-gray-900 z-50 shadow-md">
            <div className="px-4 py-3 flex flex-col items-center">
              {/* <h1 className="text-2xl font-semibold text-gray-200 mb-2 text-center">
                PDF Editor
              </h1> */}
              <PDFActions
                pdfData={pdfData}
                onUpdate={setPdfData}
                onReupload={handleFileChange}
                numPages={numPages}
                splitMode={splitMode}
                toggleSplitMode={toggleSplitMode}
                selectedPages={selectedPages}
                setSelectedPages={setSelectedPages}
              />
            </div>
          </div>

          <div className="pt-25 px-4 pb-8">
            <PDFViewer
              pdfData={pdfData}
              onNumPages={(n) => setNumPages(n)}
              splitMode={splitMode}
              selectedPages={selectedPages}
              togglePageSelection={(pageIndex: number) => {
                setSelectedPages((prev) =>
                  prev.includes(pageIndex)
                    ? prev.filter((i) => i !== pageIndex)
                    : [...prev, pageIndex]
                );
              }}
              onDeletePage={handleDeletePage}
              onDragStart={(i: number) => setDraggedPageIndex(i)}
              onDrop={(i: number) => {
                if (draggedPageIndex !== null && draggedPageIndex !== i) {
                  handleReorder(draggedPageIndex, i);
                }
                setDraggedPageIndex(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
