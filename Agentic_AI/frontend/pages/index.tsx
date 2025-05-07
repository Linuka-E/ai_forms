import { useState, useRef } from 'react';
import axios from 'axios';
import MicRecorder from 'mic-recorder-to-mp3';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const [selectedForm, setSelectedForm] = useState<'form1' | 'form2'>('form1');
  const recorderRef = useRef<any>(new MicRecorder({ bitRate: 128 }));

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        await recorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Mic access error:', err);
      }
    } else {
      try {
        const [buffer, blob] = await recorderRef.current.stop().getMp3();
        setIsRecording(false);
        console.log('MP3 blob:', blob);

        const formData = new FormData();
        formData.append('file', blob, 'recording.mp3');

        const response = await axios.post(`http://localhost:3001/api/agentic-ai?form=${selectedForm}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const { transcription, extractedFields, agentMessage } = response.data;
        setFormData(extractedFields);
        setAssistantResponse(transcription);
        setAgentMessage(agentMessage);
      } catch (err) {
        console.error('Error stopping or sending recording:', err);
        setIsRecording(false);
      }
    }
  };

  const formFieldsPreview: Record<string, string[]> = {
    form1: ['Name', 'Email', 'Gender', 'Birthday', 'Age', 'Notes', 'Alumni', 'Can Connect'],
    form2: [
      'First Name', 'Last Name', 'Email', 'Company', 'Job Title',
      'What is your association with Swinburne?',
      'How do you identify your gender?',
      'How did you hear about this event?',
      'What school/ area are you part of?',
      'When will you/ did you graduate from Swinburne?',
      'Which of the following apply to you?',
      'Do you identify as Aboriginal and/or Torres Strait Islander?',
      'Have you previously attended any events or programs hosted by the Swinburne Innovation Studio?'
    ]
  };

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <h1>Conversational Agentic AI Tester</h1>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="form-select">Choose a form:</label>
        <select
          id="form-select"
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value as 'form1' | 'form2')}
          style={{ marginLeft: 10 }}
        >
          <option value="form1">Simple Form</option>
          <option value="form2">SUT Test Form</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>Fields in selected form:</h3>
        <ul>
          {formFieldsPreview[selectedForm].map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
      </div>

      <button onClick={toggleRecording}>
        {isRecording ? 'Stop Recording' : '🎤 Start Voice Input (MP3)'}
      </button>

      {assistantResponse && (
        <div style={{ marginTop: 20 }}>
          <h3>Transcription:</h3>
          <p>{assistantResponse}</p>
        </div>
      )}

      {agentMessage && (
        <div style={{ marginTop: 20 }}>
          <h3>Agent's Message:</h3>
          <p>{agentMessage}</p>
        </div>
      )}

      {formData && (
        <div style={{ marginTop: 20 }}>
          <h3>Extracted Fields:</h3>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
