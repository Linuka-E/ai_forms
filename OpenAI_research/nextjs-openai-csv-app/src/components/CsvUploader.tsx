import React, { useState } from 'react';
import { parseCsv } from '../utils/parseCsv';
import FormGenerator from './FormGenerator';

export default function CsvUploader() {
  const [formFields, setFormFields] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const csvData = await parseCsv(file);
    setFormFields(csvData[0]); 
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {formFields.length > 0 && <FormGenerator fields={formFields} />}
    </div>
  );
}