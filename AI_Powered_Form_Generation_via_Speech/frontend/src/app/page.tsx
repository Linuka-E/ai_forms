'use client';

import { useState,useRef } from 'react';
import { callBackend } from '@/lib/api';
import type { FormData, FormField } from '@/types/form';

export default function Home() {

  //Gemini related variables
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [queryTime, setQueryTime] = useState<number | null>(null); //Added to track query time

  // Google Cloud Speech to Text related variables
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQueryTime(null); // Reset query time on new submission
    const startTime = Date.now(); // Start time for query
    try {
      const data: FormData = await callBackend(query);
      setFormData(data);
      setFormValues({}); // Reset form values
    } catch (error) {
      console.error('Error calling backend:', error);
    } finally {
      const endTime = Date.now(); // End time for query
      setQueryTime(endTime - startTime); // Calculate and set query time
      setLoading(false);
    }
  };

  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>  ) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with values:', formValues);
    // Add logic here to handle form submission (e.g., send to backend)
  };

  //Function to start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Audio Blob:', audioBlob);
        await sendAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Failed to access microphone');
    }
  };

  //Function to stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  //Function to send audio blob to the backend for transcription
  const sendAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
  
    try {
      const response = await fetch('http://localhost:3001/speech/transcribe', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
  
      const result = await response.json();
      setTranscription(result.transcription || 'No transcription available');
    } catch (err) {
      setError('Transcription failed');
    }
  };

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Transcribe speech</h1>
      <button
  onClick={isRecording ? stopRecording : startRecording}
  style={{
    padding: '6px 12px', // Reduced padding for a smaller button
    border: '1px solid #007BFF', // Thinner border
    borderRadius: '4px', // Keep slight rounding
    backgroundColor: isRecording ? '#FF4D4D' : '#007BFF', // Dynamic background color
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px', // Smaller font size
    fontWeight: 'bold',
    transition: 'background-color 0.3s, transform 0.2s',
  }}
  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
>
  {isRecording ? 'Stop Recording' : 'Start Recording'}
</button>
      <p>Transcript: </p>
      <p style={{marginBottom:'40px'}}>
        {transcription}
      </p>
      
      <h1>Generate a Form with Gemini</h1>
      
      <form onSubmit={handleSubmit}>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '6px 12px', // Reduced padding for a smaller button
            border: '1px solid #007BFF', // Thinner border
            borderRadius: '4px', // Keep slight rounding
            backgroundColor: loading ? '#6c757d' : '#007BFF', // Gray when loading, blue otherwise
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer', // Disabled cursor when loading
            fontSize: '14px', // Smaller font size
            fontWeight: 'bold',
            transition: 'background-color 0.3s, transform 0.2s',
          }}
          //On Click event query is set to the transcription value
          onClick={() => {
            if (transcription) {
              setQuery(transcription);
            } else {
              setError('No transcription available to generate form');
            }
          }}

          //On Mouse Enter event the button is scaled up
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {loading ? 'Generating...' : 'Generate Form'}
        </button>
      </form>

      {formData && (
  <section
    style={{
      marginTop: '20px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      color: 'black',
    }}
  >
    <h2>{formData.form.title}</h2>
    <form onSubmit={handleFormSubmit}>
      {formData.form.fields.map((field: FormField) => (
        <div key={field.name} style={{ marginBottom: '15px' }}>
          <label htmlFor={field.name} style={{ display: 'block', color: 'black' }}>
            {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
          </label>
          {field.type ==='dropdown' && field.options || field.type == 'select' && field.options ? (
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              value={field.name ? formValues[field.name] || '' : ''}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                color: 'black',
              }}
              >
            <option value="" disabled>
              Select an option
            </option>
            {field.options.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
          ) : (
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            required={field.required}
            value={field.name ? formValues[field.name] || '' : ''}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              color: 'black',
            }}
          />
          )}
        </div>
      ))}
      <button
        type="submit"
        style={{
          padding: '10px 20px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Submit
      </button>

    </form>
  </section>
  )}
  {queryTime !== null && (
  <p style={{ marginTop: '10px', color: 'white' }}>
    Query completed in {queryTime} milliseconds.
  </p>
  )}
    </main>
    
  );
}



