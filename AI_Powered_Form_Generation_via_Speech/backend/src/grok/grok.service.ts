import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GrokService {
  private readonly client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY, // Loaded from .env
      baseURL: 'https://generativelanguage.googleapis.com/v1beta', // Base URL for Gemini API
    
    });
  }

  async callGrokApi(query: string): Promise<any> {
    const prompt = `Generate a form based on this prompt and return it as a JSON object in the following format:

      {
        "name": "<form name>",
        "description": "<form description>",
        "content": [
          {
            "type": "<FieldType>", // e.g., TextField, TextareaField, SelectField, DateField, NumberField, CheckboxField, SwitchField, UploadField, GPSField, RadioField, AddressField 
            "extraAttributes": {
              "label": "<Field label>",
              "helperText": "",
              "placeHolder": "",
              "required": <true|false>,
              "options": [ "<option1>", "<option2>", ... ] // Only for SelectField
            }
          }
          // ...more fields
        ]
      }

      - The "content" array should contain objects for each field.
      - Use "type" to specify the field type as shown above.
      - For SelectField, include an "options" array in "extraAttributes".
      - For other fields, omit the "options" property.
      - Only include properties shown above.
      - Do not add any extra explanation or text, just the JSON object.

      Prompt: "${query}";
    `;
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gemini-2.0-flash', // As per the documentation
        messages: [{ role: 'user', content: prompt }], // Basic message format
      });
      const jsonMatch = completion.choices[0].message.content?.match(/\{[\s\S]*\}/);
      console.log('Raw response from Gemini API:', completion.choices[0].message.content); // Log the raw response for debugging
      if (jsonMatch) {
        const jsonString = jsonMatch[0]; 
        return JSON.parse(jsonString); // Parse the JSON string into an object
      }
      // If no JSON object is found, return the raw response
      console.error('No JSON object found in the response:', completion.choices[0].message.content);
      
      return "Form fields could not be extracted from the provided text.Try again";

    } catch (error) {
      throw new Error(`Failed to call Gemini API: ${error.message}`);
    }
  }
}