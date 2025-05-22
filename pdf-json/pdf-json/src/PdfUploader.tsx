import React, { useState } from 'react';
import type { ChangeEvent } from 'react';

import { extractPdfText } from './utils/extractPdfText';

interface PdfUploaderProps {
  onTextExtracted: (text: string) => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onTextExtracted }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      console.log('PDF selected:', file.name);
      setPdfFile(file);

      const text = await extractPdfText(file);
      console.log('Extracted text:', text);

      // Pass extracted text to parent
      onTextExtracted(text);
    } else {
      alert('Please upload a valid PDF file.');
      setPdfFile(null);
      onTextExtracted(''); // clear text in parent if invalid file
    }
  };

  return (
    <div className="p-4 rounded-xl border shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upload a PDF</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />
    </div>
  );
};

export default PdfUploader;