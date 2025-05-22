import React, { useState, useEffect } from 'react';
import PdfUploader from './PdfUploader';
import { callBackend } from './utils/api';  // adjust path as needed

const ParentComponent = () => {
  const [pdfText, setPdfText] = useState('');
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sendTextToBackend = async () => {
      if (pdfText.trim() === '') return; // skip empty text

      setLoading(true);
      setError(null);

      try {
        const data = await callBackend(pdfText);
        setBackendResponse(data);
      } catch (err: any) {
        setError(err.message || 'Error calling backend');
      } finally {
        setLoading(false);
      }
    };

    sendTextToBackend();
  }, [pdfText]);

  return (
    <div>
      <PdfUploader onTextExtracted={setPdfText} />
      
      <div>
        <h3>JSON:</h3>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {backendResponse && <pre>{JSON.stringify(backendResponse, null, 2)}</pre>}
      </div>
    </div>
  );
};

export default ParentComponent;
