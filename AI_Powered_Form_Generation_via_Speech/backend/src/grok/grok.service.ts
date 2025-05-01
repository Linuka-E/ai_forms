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
    const prompt = `Generate a form based on this prompt and return it as a JSON object: "${query}". 
    The JSON should include a "form" object with 
    "title", "fields" (array of objects with "name", "label", "type", "required",
    and optionally "options" for dropdowns as an array of string), and "submitButton".`;
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