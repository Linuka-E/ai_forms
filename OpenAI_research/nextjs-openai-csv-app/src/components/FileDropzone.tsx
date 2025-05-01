import React, { useState } from 'react';

interface FileDropzoneProps {
  onFileUpload: (file: File) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileUpload }) => {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onFileUpload(file);
    } else {
      alert('Please drop a valid file.');
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: dragging ? '3px dashed #0070f3' : '3px dashed #ccc',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: dragging ? '#e6f7ff' : '#fff',
        transition: 'all 0.3s ease',
      }}
    >
      {fileName ? (
        <p style={{ color: '#0070f3' }}>Uploaded: {fileName}</p>
      ) : (
        <p style={{ color: '#555' }}>Drag & Drop a file here</p>
      )}
    </div>
  );
};

export default FileDropzone;