import React from 'react';
import styles from './formStyles.module.css';
import type { FormField } from '@/types/form';
import { on } from 'events';

interface Props {
  field: FormField;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  setFormValues: (values: any) => void;
  formValues: Record<string, string>;
}

//This component is responsible for rendering different types of form fields based on the type specified in the field prop. It uses a switch statement to determine which field to render and returns the appropriate JSX for each case.
const FormFieldCreator: React.FC<Props> = ({ field, value, onChange, setFormValues, formValues }) => {
  const { type, extraAttributes } = field;
  const name = extraAttributes.label.replace(/\s+/g, '_').toLowerCase();

  switch (type) {
    case 'TextField':
      return (
        <div style={{ marginBottom: '16px' }}>
          <label>
            {extraAttributes.label}
            <input
              type="text"
              name={name}
              placeholder={extraAttributes.placeHolder}
              required={extraAttributes.required}
              value={value || ''}
              onChange={onChange}
              style={{ marginLeft: '8px', padding: '4px' }}
            />
          </label>
        </div>
      );
    case 'TextareaField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  {extraAttributes.label}
                  <textarea
                    name={name}
                    placeholder={extraAttributes.placeHolder}
                    required={extraAttributes.required}
                    value={formValues[name] || ''}
                    onChange={onChange}
                    style={{ marginLeft: '8px', padding: '4px', width: '100%', height: '100px' }}
                  />
                </label>
              </div>
            );
          case 'NumberField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  {extraAttributes.label}
                  <input
                    type="number"
                    name={name}
                    placeholder={extraAttributes.placeHolder}
                    required={extraAttributes.required}
                    value={formValues[name] || ''}
                    onChange={onChange}
                    style={{ marginLeft: '8px', padding: '4px' }}
                  />
                </label>
              </div>
            );
          case 'DateField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  {extraAttributes.label}
                  <input
                    type="date"
                    name={name}
                    required={extraAttributes.required}
                    value={formValues[name] || ''}
                    onChange={onChange}
                    style={{ marginLeft: '8px', padding: '4px' }}
                  />
                </label>
              </div>
            );
          case 'SelectField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  {extraAttributes.label}
                  <select
                    name={name}
                    required={extraAttributes.required}
                    value={formValues[name] || ''}
                    onChange={onChange}
                    style={{ marginLeft: '8px', padding: '4px' }}
                  >
                    <option value="">Select...</option>
                    {extraAttributes.options &&
                      extraAttributes.options.map((option: string, i: number) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            );
          case 'CheckboxField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  <input
                    type="checkbox"
                    name={name}
                    checked={!!formValues[name]}
                    onChange={e =>
                      setFormValues({
                        ...formValues,
                        [name]: e.target.checked ? 'true' : 'false',
                      })
                    }
                    style={{ marginRight: '8px' }}
                  />
                  {extraAttributes.label}
                </label>
              </div>
            );
          case 'SwitchField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  <input
                    type="checkbox"
                    name={name}
                    checked={!!formValues[name]}
                    onChange={e =>
                      setFormValues({
                        ...formValues,
                        [name]: e.target.checked ? 'true' : 'false',
                      })
                    }
                    style={{ marginRight: '8px' }}
                  />
                  {extraAttributes.label}
                </label>
              </div>
            );
          case 'UploadField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  {extraAttributes.label}
                  <input
                    type="file"
                    name={name}
                    required={extraAttributes.required}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormValues({
                          ...formValues,
                          [name]: file.name,
                        });
                      }
                    }}
                    style={{ marginLeft: '8px', padding: '4px' }}
                  />
                </label>
              </div>
            );
          case 'GPSField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  {extraAttributes.label}
                  <button
                    type="button"
                    className={styles.FormButton} onClick={async() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          position => {
                            const { latitude, longitude } = position.coords;
                            setFormValues({
                              ...formValues,
                              [name]: `Latitude: ${latitude}, Longitude: ${longitude}`,
                            });
                          },
                          error => {
                            console.error('Error getting location:', error);
                          }
                        );
                      } else {
                        console.error('Geolocation is not supported by this browser.');
                      }
                    }}
                  >
                    Get Location
                  </button>
                  <input
                    type="text"
                    name={name}
                    value={formValues[name] || ''}
                    readOnly
                    style={{
                      marginLeft: '8px',
                      padding: '4px',
                      width: 'calc(100% - 120px)'
                    }}
                  />
                </label>
              </div>
            );
          
          case 'RadioField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>{extraAttributes.label}</label>
                {extraAttributes.options &&
                  extraAttributes.options.map((option: string, i: number) => (
                    <div key={i}>
                      <input
                        type="radio"
                        name={name}
                        value={option}
                        checked={formValues[name] === option}
                        onChange={onChange}
                        style={{ marginRight: '8px' }}
                      />
                      {option}
                    </div>
                  ))}
              </div>
            )
          case 'AddressField':
            return (
              <div style={{ marginBottom: '16px' }}>
                <label>
                  {extraAttributes.label}
                  <input
                    type="text"
                    name={name}
                    placeholder={extraAttributes.placeHolder}
                    required={extraAttributes.required}
                    value={formValues[name] || ''}
                    onChange={onChange}
                    style={{ marginLeft: '8px', padding: '4px' }}
                  />
                </label>
              </div>
            );
    default:
      return null;
  }
};

export default FormFieldCreator;
