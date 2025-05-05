import React from 'react';

const DatePicker = ({ value, onChange }: { value: string; onChange: (date: string) => void }) => {
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

export default DatePicker;