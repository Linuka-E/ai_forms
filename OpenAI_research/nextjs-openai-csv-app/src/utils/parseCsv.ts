import Papa from 'papaparse';

export const parseCsv = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (result) => resolve(result.data as string[][]),
      error: (error) => reject(error),
    });
  });
};