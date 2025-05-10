import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfParse from 'pdf-parse';

export const extractFields = async (pdfBuffer: Buffer): Promise<any> => {
  try {
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      throw new Error('Uploaded file is empty or invalid.');
    }

    const pdfData = await pdfParse(pdfBuffer);
    const textContent = pdfData.text || '';
    if (!textContent.trim()) {
      throw new Error('The PDF does not contain extractable text.');
    }

    const extractedFields: { [key: string]: any } = {};
    const lines = textContent.split('\n').map(line => line.trim()).filter(Boolean);
    let currentSection: string | null = null;

    const isLikelyHeader = (line: string) =>
      /^[A-Z\s]+$/.test(line) || /^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(line);

    const isLikelyField = (line: string) =>
      /^[\w\s]+:\s*.+/.test(line);

    const normalizeKey = (key: string) =>
      key.toLowerCase().trim().replace(/\s+/g, '_');

    for (const line of lines) {
      if (isLikelyHeader(line) && !line.includes(':')) {
        currentSection = normalizeKey(line);
        if (!extractedFields[currentSection]) extractedFields[currentSection] = {};
        continue;
      }

      if (isLikelyField(line)) {
        const [rawKey, ...valueParts] = line.split(':');
        const key = normalizeKey(rawKey);
        const value = valueParts.join(':').trim();

        if (currentSection) {
          extractedFields[currentSection][key] = value;
        } else {
          extractedFields[key] = value;
        }
      } else {
        // Fallback: guess unstructured field
        const lower = line.toLowerCase();
        if (lower.includes('@')) {
          extractedFields['email'] = line;
        } else if (/\+?\d[\d\s\-]+/.test(line)) {
          extractedFields['phone'] = line;
        } else if (/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(line)) {
          extractedFields['date'] = line;
        } else if (!currentSection) {
          extractedFields[`line_${lines.indexOf(line)}`] = line;
        }
      }
    }

    return extractedFields;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
};
