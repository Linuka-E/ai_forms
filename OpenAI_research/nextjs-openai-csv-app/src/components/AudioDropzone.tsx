import React, { useState } from 'react';

interface AudioDropzoneProps {
  onAudioUpload: (file: File) => void;
}

const AudioDropzone: React.FC<AudioDropzoneProps> = ({ onAudioUpload }) => {
  const [dragging, setDragging] = useState(false);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

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
    if (file && file.type === 'audio/mpeg') {
      setAudioFileName(file.name);
      onAudioUpload(file);
    } else {
      alert('Please drop a valid MP3 audio file.');
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
      {audioFileName ? (
        <p style={{ color: '#0070f3' }}>Uploaded: {audioFileName}</p>
      ) : (
        <p style={{ color: '#555' }}>Drag & Drop an MP3 file here</p>
      )}
    </div>
  );
};

export default AudioDropzone;