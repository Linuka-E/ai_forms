import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { extractFields } from '../../utils/pdfParser';

// Set up multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Disable Next.js default body parser
export const config = {
  api: { bodyParser: false },
};

// Helper to run multer as a promise
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'));

    // @ts-ignore
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfBuffer = file.buffer;
    const extractedData = await extractFields(pdfBuffer);
    res.status(200).json(extractedData);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
}