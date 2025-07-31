'use client'; // to run on client side

import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// add api key here - remove before pushing to git
const genAI = new GoogleGenerativeAI("AIzaSyA84S8r3_BnqXnxV3Mh5-fxsyKU90FZ4oo"); // !!! make sure to remove before pushing !!!

export default function PdfExtractor() {
  // variables for extracting the text
  const [pdfText, setPdfText] = useState(''); // text extract
  const [jsonOutput, setJsonOutput] = useState(null); // json output
  const [error, setError] = useState(''); // error notice
  const [loading, setLoading] = useState(false); // loading notice

  useEffect(() => {
    // loading the PDF document onto client side where the PDF parsing takes place
    const script = document.createElement('script');
    // below is Mozillla's open source library for rendering pdfs in a browser as well as parsing them
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js';
    script.async = true; // delays calling pdfjsLib until needed
    script.onload = () => {
      // indicating the location of the worker file
      // this is because the pdf parsing does not happen on the main thread itself
      if (window['pdfjsLib']) {
        window['pdfjsLib'].GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
      }
    };
    document.body.appendChild(script); // browser can use pdf.js
    return () => document.body.removeChild(script); // browser cannot use pdf.js (at the end - to dismount)
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // error handling - non pdf file upload
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file');
      return;
    }

    // UI state is reset
    setLoading(true);
    setPdfText('');
    setError('');

    const reader = new FileReader(); // reading the file itself
    reader.onload = async () => {
      try {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer); // convert binary data into typed array
        const pdf = await window['pdfjsLib'].getDocument(typedArray).promise; // loading pdf
        let text = ''; // initialise string where extracted text will be stored!

        // looping through each page to extract the text
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const content = await page.getTextContent();
          // join the extracted text together
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }

        // saving the extracted text
        setPdfText(text);
      } catch {
        setError('Error extracting text from the PDF');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading the file');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const generateJson = async () => {
    if (!pdfText.trim()) {
      console.error('No extracted text available for JSON generation.');
      return;
    }

    // below is exactly the same as the react version, Anusha initially did

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(
        `Structure the following text into this JSON format:
        {
          "_id": { "$oid": "" },
          "name": "Generated Form",
          "description": "",
          "content": [
            {
              "id": "",
              "type": "TextField" | "SelectField" | "DateField" | "NumberField" | "CheckboxField" | "SwitchField",
              "extraAttributes": {
                "label": "Your question text here",
                "helperText": "",
                "placeHolder": "",
                "required": false,
                "options": ["Option 1", "Option 2", "Option 3"]
              }
            }
          ],
          "createdAt": { "$date": "" },
          "updatedAt": { "$date": "" },
          "__v": 0
        }

        Input:
        ${pdfText}`
      );

      const response = result.response;
      const cleanedText = response.text().replace(/```json|```/g, '').trim();
      const json = JSON.parse(cleanedText);
      setJsonOutput(json);
    } catch (err) {
      console.error('Error generating JSON:', err);
      setError('Failed to generate structured JSON');
    }
  };

  return (
    <div>
      <h1 className="py-4 font-bold">Upload and Extract Text from PDF</h1>
      <label
        htmlFor="pdf-upload"
        className="bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700">
        Upload PDF
      </label>
      <input id="pdf-upload" className="hidden" type="file" accept="application/pdf" onChange={handleFileChange} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {pdfText && (
        <>
          <h2 className="pb-2 pt-8 font-bold">Extracted Text</h2>
          <pre>{pdfText}</pre>
          <button onClick={generateJson} className="bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700">Generate JSON</button>
        </>
      )}

      {jsonOutput && (
        <div>
          <h3 className="py-4 font-bold">Generated Structured JSON</h3>
          <pre>{JSON.stringify(jsonOutput, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
