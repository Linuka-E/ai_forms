import { NextApiRequest, NextApiResponse } from 'next';
import { extractFields } from '../../utils/pdfParser';
import multer from 'multer';
import { promisify } from 'util';
import { Readable } from 'stream';

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

// Promisify the multer middleware to use it in an async function
const multerMiddleware = promisify(upload.single('file'));

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Cast NextApiRequest to Express.Request for multer compatibility
    const reqWithExpress = req as any;

    // Use the multer middleware to handle the file upload
    const expressRes = res as any; // Cast NextApiResponse to any for Express compatibility
    await multerMiddleware(reqWithExpress, expressRes);

    const file = reqWithExpress.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfBuffer = file.buffer;

    // Use the pdfParser utility to extract fields
    const extractedData = await extractFields(pdfBuffer);

    res.status(200).json(extractedData);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
}