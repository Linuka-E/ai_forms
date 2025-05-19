import { useState } from 'react';
import FileUploader from '../components/FileUploader';

const Home = () => {
  const [extractedData, setExtractedData] = useState(null);

  const handleDataExtraction = (data: any) => {
    setExtractedData(data);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#007BFF' }}>PDF to JSON Converter</h1>
      <FileUploader onDataExtracted={handleDataExtraction} />
      {extractedData && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h2 style={{ color: '#333' }}>Extracted Data:</h2>
          <div style={{ overflowX: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(extractedData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;