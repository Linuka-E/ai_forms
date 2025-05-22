//deliverable 3: input is pdf, output is json structure
import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfToText from "react-pdftotext";

function App() {
  const [text, setText] = useState("");
  const [jsonOutput, setJsonOutput] = useState(null); 

  const genAI = new GoogleGenerativeAI(); //removed key bcs of public git

  //text being extraced from file using react extracter module
  const extractText = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const extractedText = await pdfToText(file);
        setText(extractedText);
      } catch (error) {
        console.error("Failed to extract text from PDF", error);
      }
    }
  };

  const generateJson = async () => {
    if (!text.trim()) {
      console.error("No extracted text available for JSON generation.");
      return;
    }

    //prompt engineering for the structured json form - based off sample file
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
                "options": ["Option 1", "Option 2", "Option 3"] // Only include for SelectField type
              }
            }
          ],
          "createdAt": { "$date": "" },
          "updatedAt": { "$date": "" },
          "__v": 0
        }
        
        Input:
        ${text}`
      );

      const response = result.response;
      const sanitizedText = response.text().replace(/```json|```/g, "").trim();
      const jsonString = JSON.parse(sanitizedText);

      setJsonOutput(jsonString); // Store the structured JSON

    } catch (error) {
      console.error("Error generating JSON:", error);
    }
  };

  return (
    //what the user sees and interacts with
    <div>
      <h2>Extract Text from PDF & Generate JSON</h2>
      <input type="file" accept="application/pdf" onChange={extractText} className="file-input" />

      {text && (
        <div>
          <h3>Extracted Text:</h3>
          <p>{text}</p>
          <button onClick={generateJson} className="btn btn-primary">Generate JSON</button>
        </div>
      )}

      {jsonOutput && (
        <div>
          <h3>Generated Structured JSON:</h3>
          <pre>{JSON.stringify(jsonOutput, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

//TODO: see if pdfparser works in NEXT else just use gemini
