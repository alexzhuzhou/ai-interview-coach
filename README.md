# AI Interview Coach

Practice realistic video interviews with an AI interviewer powered by Tavus CVI and Daily.co. Get AI-generated feedback analyzing both your verbal responses and non-verbal communication.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in Tavus API key, replica ID, and OpenAI key
vercel dev             # start dev server with serverless functions
```

## Features

- **Guided Flow**: landing → setup (role/industry/preferences) → live interview → AI feedback
- **Smart AI Interviewer**: Tavus persona with custom system prompts tailored to role, industry, and experience level
- **Live Video**: Daily.co WebRTC embedded via iframe; 10-minute max session with pre-end warning
- **AI Feedback**: GPT-4 powered analysis of:
  - Communication skills (clarity, confidence, pacing)
  - STAR method usage in behavioral questions
  - Content quality and specific examples
  - Non-verbal communication (body language, eye contact, facial expressions)
  - Personalized improvement suggestions
- **Beautiful UI**: Tailwind-styled with timers, connection status, and markdown-rendered feedback

## Project Structure

### Frontend (`src/`)
- `App.tsx` – screen router and session timing
- `hooks/useConversation.ts` – conversation lifecycle management (calls serverless functions)
- `components/LandingPage.tsx` – marketing hero page
- `components/SetupScreen.tsx` – interview configuration form
- `components/InterviewScreen.tsx` – Daily.co iframe, timer, end controls
- `components/FeedbackScreen.tsx` – AI-generated feedback display with markdown rendering
- `types/index.ts` – shared TypeScript types

### Serverless Functions (`api/`)
- `conversation.ts` – creates Tavus persona and conversation
- `end-conversation.ts` – ends Tavus conversation and triggers transcript generation
- `generate-feedback.ts` – fetches transcript + perception analysis, generates GPT-4 feedback

## Architecture

- **Frontend**: React 19 + TypeScript + Vite; Tailwind CSS v3; lucide-react icons
- **Backend**: Vercel Serverless Functions (keeps API keys secure)
- **Video**: Daily.co iframe (`@daily-co/daily-js`) for WebRTC
- **AI Interviewer**: Tavus CVI with dynamic persona generation per session
- **Feedback**: Tavus conversation transcript + perception analysis → GPT-4 analysis
- **Flow**: All API calls go through `/api/*` endpoints (no dev/prod split)

## Environment Variables

Copy `.env.example` to `.env` and set:

- `TAVUS_API_KEY` – Your Tavus API key from https://platform.tavus.io
- `REPLICA_ID` – Your Tavus replica ID from the dashboard
- `OPENAI_API_KEY` – Your OpenAI API key from https://platform.openai.com

## Scripts

- `vercel dev` – **Development server** (recommended) - runs Vite + serverless functions
- `npm run dev` – Vite only (won't work without serverless functions)
- `npm run build` – Type-check then Vite build
- `npm run preview` – Preview production build
- `npm run lint` – ESLint across the project

## Running the App

1. Install Vercel CLI globally: `npm i -g vercel`
2. Set up environment: `cp .env.example .env` and fill in API keys
3. Run development server: `vercel dev`
4. Open http://localhost:3000 (or the printed URL)
5. Walk through: Landing → Setup → Interview → Feedback

## API Flow Details

### Conversation Creation (`POST /api/conversation`)
1. Frontend sends interview config (role, industry, level, type)
2. Serverless function generates custom system prompt with:
   - Interview guidelines (4-5 questions, STAR method)
   - Specific question types to ask
   - Conversation style tailored to experience level
3. Creates Tavus persona with system prompt
4. Creates Tavus conversation and returns URL for Daily.co iframe

### Conversation Ending (`POST /api/end-conversation`)
- Ends the Tavus conversation
- Triggers transcript and perception analysis generation

### Feedback Generation (`POST /api/generate-feedback`)
1. Fetches conversation data with `verbose=true`
2. Extracts transcript from `events` array
3. Extracts perception analysis (body language, facial expressions, etc.)
4. Sends both to GPT-4 with detailed coaching prompt
5. Returns markdown-formatted feedback

## Deployment

Deploy to Vercel with one click or via CLI:

```bash
vercel --prod
```

Ensure these environment variables are set in your Vercel project:
- `TAVUS_API_KEY`
- `REPLICA_ID`
- `OPENAI_API_KEY`

## Key Benefits of This Architecture

✅ **No code duplication** - single source of truth for all logic
✅ **Secure** - API keys never exposed to browser
✅ **Production parity** - dev and prod behave identically
✅ **Simplified** - removed 440+ lines of duplicate code

## Known Limitations / Next Steps

- No persistence of interview history or feedback
- Retry logic in feedback generation could be more sophisticated
- Add tests (currently none)
- Consider rate limiting for API endpoints
- Add user authentication for multi-user support
