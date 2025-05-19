import React, { useState } from 'react';

interface FileUploaderProps {
  onDataExtracted: (data: { [key: string]: any }) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataExtracted }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<{ [key: string]: any } | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setError(null);
      setLoading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await fetch('/api/extractFields', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to extract fields');
        }

        const data = await response.json();
        setExtractedData(data); // Store extracted data
        onDataExtracted(data); // Pass extracted data to parent
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownloadJson = () => {
    if (extractedData) {
      const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'extracted-data.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ color: '#333' }}>Upload a PDF</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{
          display: 'block',
          margin: '10px auto',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      />
      {loading && <p style={{ color: '#007BFF' }}>Processing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {extractedData && (
        <button
          onClick={handleDownloadJson}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Download JSON
        </button>
      )}
    </div>
  );
};

export default FileUploader;