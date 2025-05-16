import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

export const extractFields = async (pdfBuffer: Buffer): Promise<any> => {
  try {
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      return { _error: 'Uploaded file is empty or invalid.' };
    }

    let textContent = '';
    let usedOCR = false;

    // Try extracting text normally
    const pdfData = await pdfParse(pdfBuffer);
    textContent = pdfData.text || '';

    // If no extractable text, try OCR (for scanned PDFs)
    if (!textContent.trim()) {
      usedOCR = true;
      try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
        const pdf = await loadingTask.promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (!context) continue;
          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/png');
          const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng');
          textContent += '\n' + text;
        }
      } catch (ocrError) {
        // OCR failed, but don't throw
        return { _error: 'Failed to extract text from scanned PDF.', _usedOCR: true };
      }
    }

    if (!textContent.trim()) {
      // Instead of throwing, return a flag
      return { _noExtractableText: true, _usedOCR: usedOCR };
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

    extractedFields._usedOCR = usedOCR;
    return extractedFields;
  } catch (error) {
    // Do not leak sensitive info
    console.error('Error parsing PDF');
    return { _error: 'Failed to parse PDF, please try again' };
  }
};