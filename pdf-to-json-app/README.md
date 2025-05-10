# PDF to JSON App

This project is a Next.js application that allows users to upload a PDF file and extracts specific fields from it, returning the data in JSON format.

## Features

- Upload PDF files
- Extract fields from the uploaded PDF
- Display extracted data in JSON format

## Technologies Used

- Next.js
- React
- TypeScript
- PDF parsing library (e.g., pdf-lib or pdf-parse)

## Project Structure

```
pdf-to-json-app
├── public                # Static files
├── src
│   ├── components        # React components
│   │   └── FileUploader.tsx
│   ├── pages             # Next.js pages
│   │   ├── api
│   │   │   └── extractFields.ts  # API route for PDF extraction
│   │   └── index.tsx     # Main entry point
│   └── utils             # Utility functions
│       └── pdfParser.ts  # PDF parsing logic
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
└── README.md             # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd pdf-to-json-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and go to `http://localhost:3000`.

3. Use the file uploader to select and upload a PDF file. The extracted fields will be displayed in JSON format.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes. 

## License

This project is licensed under the MIT License.