import React from 'react';

interface FormGeneratorProps {
  fields: string[];
}

export default function FormGenerator({ fields }: FormGeneratorProps) {
  return (
    <form>
      {fields.map((field, index) => (
        <div key={index}>
          <label htmlFor={field}>{field}</label>
          <input type="text" id={field} name={field} />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}