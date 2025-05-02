import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });


export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    console.log('Fields:', fields);
    console.log('Files:', files);

    const textInput = Array.isArray(fields.text) ? fields.text[0] : fields.text || '';
    const mp3File = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!mp3File && !textInput) {
      return res.status(400).json({ error: 'No valid input provided' });
    }

    try {
      // Handle text input
      if (textInput) {
        console.log('Processing text input:', textInput);

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: textInput },
          ],
          max_tokens: 300,
        });

        const reply = response.choices[0]?.message?.content;
        console.log('Text Response:', reply);
        return res.status(200).json({ textResponse: reply });
      }

      // Handle MP3 file for speech-to-text
      if (mp3File) {
        console.log('Processing MP3 file:', mp3File);

        if (!fs.existsSync(mp3File.filepath)) {
          console.error('File does not exist:', mp3File.filepath);
          return res.status(500).json({ error: 'Uploaded file not found' });
        }

        const fileStream = fs.createReadStream(mp3File.filepath);
        console.log('File Stream created for:', mp3File.filepath);

        const transcription = await openai.audio.transcriptions.create({
          file: fileStream,
          model: 'whisper-1',
        });

        console.log('Transcription:', transcription.text);
        return res.status(200).json({ transcription: transcription.text });
      }

      res.status(400).json({ error: 'No valid input provided' });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });
}