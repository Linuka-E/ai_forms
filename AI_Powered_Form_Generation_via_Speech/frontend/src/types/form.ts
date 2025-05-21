export interface FormField {
  type: string;
  extraAttributes: {
    label: string;
    helperText: string;
    placeHolder: string;
    required: boolean;
    options?: string[]; // Only for SelectField
  };
}

export interface FormData {
  name: string;
  description: string;
  content: FormField[];
}