import React, { useState } from 'react';

const AudioDropzone = ({ accept, onDrop }: { accept: string; onDrop: (files: File[]) => void }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    setIsDragActive(active);
  };

  return (
    <div
      onDragEnter={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        onDrop(Array.from(e.dataTransfer.files));
      }}
      style={{
        padding: '40px',
        border: `2px dashed ${isDragActive ? '#0070f3' : '#ccc'}`,
        borderRadius: '8px',
        backgroundColor: isDragActive ? '#f0f8ff' : '#f9f9f9',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <p>Drag & drop audio files here ({accept})</p>
      <p>or click to select files</p>
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
        style={{ display: 'none' }}
        id="audio-upload"
      />
    </div>
  );
};

export default AudioDropzone;