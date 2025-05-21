# My Grok App
A full-stack app with Next.js (TypeScript) frontend and NestJS backend.

## Setup
1. **Backend**: `cd backend && npm install && npm run start:dev`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. Replace backend\google-credentials.json with new file sent by owner
4. If on Windows run on terminal:set $env:GOOGLE_APPLICATION_CREDENTIALS = "your\path\ai_forms\AI_Powered_Form_Generation_via_Speech\backend\google-credentials.json"

## Environment Variables
- Add below lines to backend/.env
GROK_API_KEY=xai-9Xw71dabiIqX0knCAHs8YEtt5a7K6KwO7p1r0zmzWYi4JIzxfDt9dMWWA2cZDSqIjUhVLdnSGuu5DoJZ
GEMINI_API_KEY=AIzaSyBwvTwNXy5NLfQqfAgvwfhi2QrqOUJUgac
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

- Run: "npm install dotenv --save" in terminal 

