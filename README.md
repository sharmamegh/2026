# GhostWork (React + Vite)

Quick start

1. `cp .env.example .env` and fill the values:
   - `VITE_FIREBASE_CONFIG`: JSON string for your Firebase app (wrap the whole object in quotes if editing the file manually).
   - `VITE_APP_ID`: Any string to namespace data in Firestore.
   - `VITE_GOOGLE_API_KEY`: Gemini API key for AI helpers (optional, app still runs without it).
   - `VITE_INITIAL_AUTH_TOKEN`: Optional custom auth token if you use a server-issued login.
2. Install deps: `npm install`
3. Run locally: `npm run dev`

If Firebase env vars are missing, the app will run in a safe demo mode with sample data so you can still navigate the UI.
