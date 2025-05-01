import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false });

// Dropzone Components
const AudioDropzone = ({ accept, onDrop }: { accept: string, onDrop: (files: File[]) => void }) => {
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

const VideoDropzone = ({ accept, onDrop }: { accept: string, onDrop: (files: File[]) => void }) => {
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
      <p>Drag & drop video files here ({accept})</p>
      <p>or click to select files</p>
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
        style={{ display: 'none' }}
        id="video-upload"
      />
    </div>
  );
};

const FileDropzone = ({ accept, onDrop }: { accept: string, onDrop: (files: File[]) => void }) => {
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
      <p>Drag & drop files here ({accept})</p>
      <p>or click to select files</p>
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
        style={{ display: 'none' }}
        id="file-upload"
      />
    </div>
  );
};

const DatePicker = ({ value, onChange }: { value: string, onChange: (date: string) => void }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    />
  );
};

// Enhanced field type detection
const detectFieldType = (columnName: string, columnData: string[]) => {
  const lowerName = columnName.toLowerCase();
  const sampleData = columnData.slice(0, 10).filter(Boolean);

  // Enhanced gender detection
  const genderKeywords = ['gender', 'sex'];
  const genderOptions = ['male', 'female', 'non-binary', 'nonbinary', 'other', 'prefer not to say'];
  
  const isGenderColumn = genderKeywords.some(keyword => lowerName.includes(keyword)) || 
    (sampleData.length > 0 && sampleData.every(val => 
      genderOptions.some(opt => val.toLowerCase().includes(opt)))
    );

  if (isGenderColumn) {
    const uniqueValues = Array.from(new Set(columnData.map(v => v.toLowerCase().trim())));
    
    const standardizedOptions = uniqueValues.map(val => {
      if (val.includes('male')|| val.includes('M')) return 'Male';
      if (val.includes('female') || val.includes('F')) return 'Female';
      if (val.includes('non') || val.includes('binary')) return 'Non-binary';
      if (val.includes('other')) return 'Other';
      if (val.includes('prefer')) return 'Prefer not to say';
      return val.charAt(0).toUpperCase() + val.slice(1);
    }).filter((v, i, a) => a.indexOf(v) === i);

    if (!standardizedOptions.includes('Male')) standardizedOptions.push('Male');
    if (!standardizedOptions.includes('Female')) standardizedOptions.push('Female');
    if (!standardizedOptions.includes('Non-binary')) standardizedOptions.push('Non-binary');

    return {
      type: 'radio',
      options: standardizedOptions.sort((a, b) => {
        const order = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
        return order.indexOf(a) - order.indexOf(b);
      })
    };
  }

  // Check for audio files
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
  const isAudioColumn = sampleData.length > 0 && sampleData.every(val => 
    audioExtensions.some(ext => val.toLowerCase().endsWith(`.${ext}`))
  );
  if (isAudioColumn) {
    return { 
      type: 'audio',
      accept: audioExtensions.map(ext => `.${ext}`).join(',')
    };
  }

  // Check for video/streaming files
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
  const isVideoColumn = sampleData.length > 0 && sampleData.every(val =>
    videoExtensions.some(ext => val.toLowerCase().endsWith(`.${ext}`))
  );
  if (isVideoColumn || lowerName.includes('stream')) {
    return {
      type: 'video',
      accept: videoExtensions.map(ext => `.${ext}`).join(',')
    };
  }

  // Check for general files
  const fileExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'];
  const isFileColumn = sampleData.length > 0 && sampleData.every(val =>
    fileExtensions.some(ext => val.toLowerCase().endsWith(`.${ext}`))
  );
  if (isFileColumn || lowerName.includes('file') || lowerName.includes('attachment')) {
    return {
      type: 'file',
      accept: fileExtensions.map(ext => `.${ext}`).join(',')
    };
  }

  // Check for dates
  const dateRegexes = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/ // MM-DD-YYYY
  ];
  const isDateColumn = sampleData.length > 0 && sampleData.every(val => 
    dateRegexes.some(regex => regex.test(val))
  );
  if (isDateColumn || lowerName.includes('date')) {
    return { type: 'date' };
  }

  // Check for location/address
  const locationKeywords = ['address', 'location', 'city', 'state', 'country', 'zip'];
  if (locationKeywords.some(keyword => lowerName.includes(keyword))) {
    return { type: 'location' };
  }

  // Default to text
  return { type: 'text' };
};

export default function App({ Component, pageProps }: AppProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<{name: string; type: string; options?: string[]; accept?: string}[] | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [locationState, setLocationState] = useState<Record<string, { location: string | null; showMap: boolean }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const rows = content.split('\n').map(row => {
          const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          return matches ? matches.map(cell => cell.replace(/^"|"$/g, '')) : [];
        });
        
        const headers = rows[0];
        const dataRows = rows.slice(1).filter(row => row.length === headers.length);
        
        const columns = headers.map((_, i) => 
          dataRows.map(row => row[i]).filter(val => val && val.trim() !== '')
        );
        
        const fields = headers.map((header, i) => ({
          name: header,
          ...detectFieldType(header, columns[i])
        }));

        setFormFields(fields);
        setFormData({});
      };
      reader.readAsText(file);
    } else {
      alert('Please drop a valid CSV file.');
    }
  };

  const handleUseCurrentLocation = (field: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            if (!response.ok) throw new Error('Failed to fetch location');
            const data = await response.json();
            if (data?.display_name) {
              setLocationState(prev => ({
                ...prev,
                [field]: { location: data.display_name, showMap: false }
              }));
              setFormData(prev => ({ ...prev, [field]: data.display_name }));
            } else {
              alert('Unable to fetch address.');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch location data.');
          }
        },
        (error) => {
          console.error('Error:', error);
          alert('Unable to fetch current location.');
        }
      );
    } else {
      alert('Geolocation not supported.');
    }
  };

  const handleChooseOnMap = (field: string) => {
    setLocationState(prev => ({
      ...prev,
      [field]: { ...prev[field], showMap: true }
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, files: File[]) => {
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, [field]: files[0].name }));
    }
  };

  const sendDataToBackend = async (data: Record<string, any>) => {
    try {
      const response = await fetch('http://localhost:3000/api/save-form-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      return result;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const completeFormData = formFields?.reduce((acc, field) => {
        acc[field.name] = formData[field.name] || '';
        return acc;
      }, {} as Record<string, any>);

      if (!completeFormData) {
        throw new Error('No form data to submit');
      }

      await sendDataToBackend(completeFormData);
      alert('Form submitted successfully!');
      console.log('Form data submitted:', completeFormData);

      setFormData({});
      setLocationState({});
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: dragging ? '#f0f8ff' : '#f9f9f9',
        transition: 'background-color 0.3s ease',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '40px',
          border: dragging ? '3px dashed #0070f3' : '3px dashed #ccc',
          borderRadius: '10px',
          backgroundColor: dragging ? '#e6f7ff' : '#fff',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          marginBottom: '20px',
        }}
      >
        {fileName ? (
          <div>
            <h2 style={{ color: '#0070f3' }}>File Uploaded Successfully!</h2>
            <p style={{ color: '#555' }}>{fileName}</p>
          </div>
        ) : (
          <div>
            <h2 style={{ color: '#0070f3' }}>Drag & Drop Your CSV File Here</h2>
            <p style={{ color: '#555' }}>or click to select a file</p>
          </div>
        )}
      </div>

      {formFields && (
        <div
          style={{
            width: '100%',
            maxWidth: '800px',
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ color: '#0070f3', textAlign: 'center', marginBottom: '30px' }}>
            Generated Form
          </h2>
          <form onSubmit={handleSubmit}>
            {formFields.map((field, index) => (
              <div key={index} style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                  {field.name}
                </label>
                
                {field.type === 'audio' ? (
                  <div>
                    <AudioDropzone
                      accept={field.accept || 'audio/*'}
                      onDrop={(files) => handleFileUpload(field.name, files)}
                    />
                    {formData[field.name] && (
                      <p style={{ marginTop: '10px', color: '#4CAF50' }}>
                        Selected: {formData[field.name]}
                      </p>
                    )}
                  </div>
                ) : field.type === 'video' ? (
                  <div>
                    <VideoDropzone
                      accept={field.accept || 'video/*'}
                      onDrop={(files) => handleFileUpload(field.name, files)}
                    />
                    {formData[field.name] && (
                      <p style={{ marginTop: '10px', color: '#4CAF50' }}>
                        Selected: {formData[field.name]}
                      </p>
                    )}
                  </div>
                ) : field.type === 'file' ? (
                  <div>
                    <FileDropzone
                      accept={field.accept || '*/*'}
                      onDrop={(files) => handleFileUpload(field.name, files)}
                    />
                    {formData[field.name] && (
                      <p style={{ marginTop: '10px', color: '#4CAF50' }}>
                        Selected: {formData[field.name]}
                      </p>
                    )}
                  </div>
                ) : field.type === 'date' ? (
                  <DatePicker
                    value={formData[field.name] || ''}
                    onChange={(date) => handleInputChange(field.name, date)}
                  />
                ) : field.type === 'radio' ? (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {field.options?.map(option => (
                        <div key={option} style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            id={`${field.name}-${option}`}
                            name={field.name}
                            value={option}
                            checked={formData[field.name] === option}
                            onChange={() => handleInputChange(field.name, option)}
                            style={{ marginRight: '8px' }}
                          />
                          <label htmlFor={`${field.name}-${option}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                    {formData[field.name] && (
                      <p style={{ marginTop: '8px', color: '#4CAF50' }}>
                        Selected: {formData[field.name]}
                      </p>
                    )}
                  </div>
                ) : field.type === 'location' ? (
                  <div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      <button
                        type="button"
                        onClick={() => handleUseCurrentLocation(field.name)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#0070f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Use Current Location
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChooseOnMap(field.name)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#0070f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Choose on Map
                      </button>
                    </div>
                    {locationState[field.name]?.showMap && (
                      <div style={{ height: '300px', margin: '15px 0' }}>
                        <MapComponent
                          setSelectedLocation={(location) => {
                            setLocationState(prev => ({
                              ...prev,
                              [field.name]: { location, showMap: false }
                            }));
                            handleInputChange(field.name, location);
                          }}
                        />
                      </div>
                    )}
                    {formData[field.name] && (
                      <p style={{ marginTop: '10px', color: '#555' }}>
                        Location: {formData[field.name]}
                      </p>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                    }}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isSubmitting ? '#cccccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '20px',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </form>
        </div>
      )}

      <Component {...pageProps} />
    </div>
  );
}