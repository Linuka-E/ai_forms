export interface FormField {
    name?: string;
    label?: string;
    type?: string;
    required?: boolean;
    options?: string[]; // Optional for dropdowns
  }
  
  export interface FormData {
    form: {
      title: string;
      fields: FormField[];
      submitButton: string;
    };
  }