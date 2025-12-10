# AI Interview Coach

Practice realistic video interviews with an AI interviewer powered by Tavus CVI and Daily.co. The app guides candidates through setup, connects them to a Tavus-powered interviewer over WebRTC, and ends with a reflection screen.

## Quick Start

```bash
npm install
cp .env.example .env   # fill in Tavus keys and replica ids
npm run dev            # start Vite dev server
```

## Features

- Guided flow: landing → setup (role/industry/preferences) → live interview → feedback.
- Tavus persona + conversation creation (custom system prompt per session).
- Daily.co video call embedded via iframe; 10-minute max session with pre-end warning.
- Tailwind UI with timers, connection status, and end-call handling.

## Project Structure

- `src/App.tsx` – screen router and session timing.
- `src/hooks/useConversation.ts` – creates personas and conversations (dev: direct Tavus calls; prod: serverless proxy).
- `src/components/SetupScreen.tsx` – collects interview config.
- `src/components/InterviewScreen.tsx` – Daily iframe join, timer, end controls.
- `src/components/LandingPage.tsx` / `FeedbackScreen.tsx` – marketing hero and post-session summary.
- `api/conversation.ts` – Vercel serverless function proxy for Tavus API in production.
- `src/types/index.ts` – shared types for interview config and app state.

## Architecture

- **Frontend**: React + TypeScript + Vite; Tailwind for styling; lucide-react icons.
- **Video transport**: Daily.co iframe (`@daily-co/daily-js`).
- **AI interviewer**: Tavus CVI persona and conversation APIs. A persona is created per session with a role-specific system prompt, then a conversation URL is returned for the Daily call.
- **Flows**:
  - Dev mode (`import.meta.env.DEV`): frontend calls Tavus APIs directly (exposes key; for local use only).
  - Prod mode: frontend calls `POST /api/conversation`, which proxies to Tavus using server-side secrets.

## Environment

Copy `.env.example` to `.env` and set:

- `TAVUS_API_KEY` – server-side key (used by Vercel function).
- `REPLICA_ID` – Tavus replica id (server-side).
- `VITE_TAVUS_API_KEY` – key exposed to browser for dev only.
- `VITE_REPLICA_ID` – replica id exposed to browser for dev only.

## Scripts

- `npm run dev` – Vite dev server.
- `npm run build` – Type-check then Vite build.
- `npm run preview` – Preview production build.
- `npm run lint` – ESLint across the project.

## Running the App

1) Set environment variables as above. Avoid using real secrets in dev mode if building public artifacts.
2) `npm run dev` and open the printed local URL.
3) Walk through: Landing → Setup → Interview (join Daily iframe) → End call → Feedback.

## API Integration Details

- **Dev** (`useConversation`): Fetches `POST /v2/personas` then `POST /v2/conversations` directly with `VITE_TAVUS_API_KEY`. A custom system prompt tailors questions to role, industry, level, and interview type. Hard-coded defaults exist for ease of local testing—replace with your keys.
- **Prod** (`api/conversation.ts`): Same flow but executed server-side using `TAVUS_API_KEY` and `REPLICA_ID`; returns `{ conversationId, conversationUrl }`.
- Conversations cap at 10 minutes (`max_call_duration: 600`) and warn at 8 minutes client-side.

## Deployment Notes

- Designed for Vercel (uses `@vercel/node` and `api/` convention). Ensure env vars are set in the Vercel project.
- In prod, rely on `api/conversation` to keep keys private; remove or lock down any direct frontend calls.

## Known Limitations / Next Steps

- Frontend dev path exposes API key; use only locally and prefer the serverless proxy.
- No persistence of interview history or feedback yet.
- Minimal error surfacing during Tavus/Daily failures; consider richer UI states and logging.
- Add tests (currently none) and stricter lint/type settings before shipping.
