import React, { useState } from 'react';

export default function AudioUploader() {
  const [dragging, setDragging] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [response, setResponse] = useState<string | null>(null);

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
      setMp3File(file);
    } else {
      alert('Please drop a valid MP3 file.');
    }
  };

  const handleSubmit = async () => {
    if (!textInput && !mp3File) {
      alert('Please provide text input or upload an MP3 file.');
      return;
    }

    const formData = new FormData();
    if (textInput) formData.append('text', textInput);
    if (mp3File) formData.append('file', mp3File);
    console.log('Form Data:', formData.get('text'), formData.get('file'));

    try {
      const response = await fetch('http://localhost:3000/api/openai', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to call the API');
      }

      const data = await response.json();
      if (data.textResponse) {
        setResponse(`Text Response: ${data.textResponse}`);
      } else if (data.transcription) {
        setResponse(`Transcription: ${data.transcription}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to call the API.');
    }
  };

  return (
    <div
      style={{
        marginTop: '20px',
        width: '80%',
        maxWidth: '500px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h3 style={{ color: '#0070f3', textAlign: 'center' }}>Upload MP3 or Submit Text</h3>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          marginBottom: '20px',
          padding: '20px',
          border: dragging ? '3px dashed #0070f3' : '3px dashed #ccc',
          borderRadius: '10px',
          backgroundColor: dragging ? '#e6f7ff' : '#f9f9f9',
          textAlign: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {mp3File ? (
          <p style={{ color: '#0070f3' }}>Uploaded File: {mp3File.name}</p>
        ) : (
          <p style={{ color: '#555' }}>Drag & Drop an MP3 File Here</p>
        )}
      </div>
      <textarea
        placeholder="Enter your text here..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        style={{
          width: '100%',
          height: '100px',
          marginBottom: '20px',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          fontSize: '14px',
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Submit
      </button>
      {response && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}