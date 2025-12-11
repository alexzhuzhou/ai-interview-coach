# AI Interview Coach

Practice realistic video interviews with an AI interviewer powered by Tavus CVI and Daily.co. Get AI-generated feedback analyzing both your verbal responses and non-verbal communication. Review your past interviews with full transcripts and visual perception analysis.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in Tavus API key, replica ID, persona IDs, and OpenAI key
vercel dev             # start dev server with serverless functions
```

Open http://localhost:3000 and start practicing!

## Features

- **Dual Interview Modes**:
  - **General Interview**: Behavioral and role-specific questions for any position
  - **LeetCode Style**: Coding and algorithmic problem-solving interviews

- **Guided Flow**: landing → setup (role/industry/preferences) → live interview → AI feedback

- **Smart AI Interviewer**: Tavus persona with custom system prompts tailored to:
  - Your target role and industry
  - Experience level (entry, mid, senior, executive)
  - Interview type (behavioral, technical, or mixed)

- **Live Video**: Daily.co WebRTC embedded via iframe
  - 10-minute max session with participant timeout
  - Real-time video with AI replica

- **AI Feedback**: GPT-4 powered analysis of:
  - Communication skills (clarity, confidence, pacing)
  - STAR method usage in behavioral questions
  - Content quality and specific examples
  - Non-verbal communication (body language, eye contact, facial expressions)
  - Personalized improvement suggestions

- **Conversation History Dashboard**:
  - View all past interviews in one place
  - Access full conversation transcripts
  - Review detailed visual perception analysis including:
    - Appearance and presentation
    - Behavior and body language
    - Emotional states and engagement levels
    - Screen activities and distractions

- **Beautiful UI**: Tailwind-styled dark theme with:
  - Persistent navigation bar
  - Real-time status indicators
  - Markdown-rendered feedback and analysis
  - Responsive design for all screen sizes

## Project Structure

### Frontend (`src/`)

**Core App:**
- `App.tsx` – main screen router with navigation integration
- `hooks/useConversation.ts` – conversation lifecycle management
- `types/index.ts` – shared TypeScript types

**Components:**
- `Navigation.tsx` – persistent top navigation bar
- `LandingPage.tsx` – hero page with feature showcase
- `SetupScreen.tsx` – interview configuration form (role, industry, level, type, category)
- `InterviewScreen.tsx` – Daily.co iframe with timer and end controls
- `FeedbackScreen.tsx` – AI-generated feedback display with markdown rendering
- `ConversationHistory.tsx` – list view of all past interviews
- `ConversationDetail.tsx` – detailed view with transcript and perception analysis

### Serverless Functions (`api/`)
- `conversation.js` – creates/patches Tavus persona and starts conversation
- `end-conversation.js` – ends Tavus conversation and triggers data generation
- `generate-feedback.js` – fetches transcript + perception, generates GPT-4 feedback
- `list-conversations.js` – retrieves all conversations from Tavus API
- `get-conversation.js` – fetches detailed conversation data with verbose events

## Architecture

- **Frontend**: React 19 + TypeScript + Vite; Tailwind CSS v3; lucide-react icons; react-markdown
- **Backend**: Vercel Serverless Functions (keeps API keys secure)
- **Video**: Daily.co iframe (`@daily-co/daily-js`) for WebRTC
- **AI Interviewer**: Tavus CVI with dynamic persona patching per session
- **Feedback**: Tavus conversation transcript + perception analysis → GPT-4 analysis
- **History**: Tavus API with verbose events for full transcript and perception data
- **Flow**: All API calls go through `/api/*` endpoints (no dev/prod split)

## Environment Variables

Copy `.env.example` to `.env` and set:

- `TAVUS_API_KEY` – Your Tavus API key from https://platform.tavus.io
- `REPLICA_ID` – Your Tavus replica ID from the dashboard
- `LEET_CODE_PERSONA_ID` – Persona ID for LeetCode-style interviews
- `GENERAL_RECRUITER_ID` – Persona ID for general interviews (gets patched dynamically)
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
1. Frontend sends interview config (category, role, industry, level, type)
2. For **General** interviews:
   - Generates custom system prompt with interview guidelines, question types, and conversation style
   - Patches the `GENERAL_RECRUITER_ID` persona with the custom prompt
3. For **LeetCode** interviews:
   - Uses the `LEET_CODE_PERSONA_ID` persona directly (no patching needed)
4. Creates Tavus conversation with selected persona and custom greeting
5. Returns conversation ID and URL for Daily.co iframe

### Conversation Ending (`POST /api/end-conversation`)
- Ends the Tavus conversation
- Triggers transcript and perception analysis generation

### Feedback Generation (`POST /api/generate-feedback`)
1. Fetches conversation data with `verbose=true`
2. Extracts transcript from `application.transcription_ready` event
3. Extracts perception analysis from `application.perception_analysis` event
4. Sends both to GPT-4 with detailed coaching prompt
5. Returns markdown-formatted feedback

### Conversation History (`GET /api/list-conversations`)
- Fetches all conversations from Tavus API
- Returns array of conversation summaries with basic metadata

### Conversation Details (`GET /api/get-conversation?conversation_id=xxx`)
1. Fetches detailed conversation data with `verbose=true` parameter
2. Returns complete conversation object including:
   - Full transcript with role-based messages
   - Visual perception analysis (appearance, behavior, emotions, screen activities)
   - System events (replica joined, shutdown reason, etc.)

## Deployment

Deploy to Vercel with one click or via CLI:

```bash
vercel --prod
```

Ensure these environment variables are set in your Vercel project settings:
- `TAVUS_API_KEY`
- `REPLICA_ID`
- `LEET_CODE_PERSONA_ID`
- `GENERAL_RECRUITER_ID`
- `OPENAI_API_KEY`

## Key Benefits of This Architecture

✅ **Secure** - All API keys stay server-side, never exposed to browser
✅ **Serverless** - No infrastructure management, scales automatically
✅ **Type-safe** - Full TypeScript coverage with shared types
✅ **Modern stack** - React 19, Vite, Tailwind CSS v3
✅ **Rich feedback** - Combines transcript analysis with visual perception data
✅ **History tracking** - Full conversation history with detailed analytics

## User Flow

1. **Landing Page** → Click "Start Practice Interview"
2. **Setup Screen** → Configure your interview:
   - Choose interview category (General or LeetCode)
   - Enter target role (for General interviews)
   - Select industry, experience level, and interview type
3. **Interview Screen** → Live video interview with AI replica
   - 10-minute maximum duration
   - Real-time video conversation
   - End interview button available anytime
4. **Feedback Screen** → View AI-generated analysis
   - Communication skills assessment
   - STAR method usage evaluation
   - Non-verbal communication feedback
   - Personalized improvement suggestions
5. **History Dashboard** → Review past interviews
   - Navigate via top menu bar
   - Click any conversation to view details
   - See full transcripts and perception analysis

## Known Limitations / Next Steps

- ✅ ~~No persistence of interview history or feedback~~ - **IMPLEMENTED**: Full history with transcripts and perception analysis
- No user authentication (all conversations visible to everyone using the same API key)
- No filtering/sorting options in conversation history
- Retry logic in feedback generation could be more sophisticated
- Add automated tests (currently none)
- Consider rate limiting for API endpoints
- Add user authentication for multi-user support
- Add download/export options for transcripts and feedback
- Add search functionality in conversation history
