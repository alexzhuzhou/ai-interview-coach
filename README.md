# AI Interview Coach

Practice realistic video interviews with an AI interviewer powered by Tavus CVI and Daily.co. Get AI-generated feedback analyzing both your verbal responses and non-verbal communication. Review your past interviews with full transcripts, visual perception analysis, and **watch video recordings** of your interviews.

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
  - View all past interviews in one place (up to 100 conversations, sorted newest first)
  - Access full conversation transcripts
  - Review detailed visual perception analysis including:
    - Appearance and presentation
    - Behavior and body language
    - Emotional states and engagement levels
    - Screen activities and distractions

- **Video Recording Playback** (Optional):
  - Watch your interview recordings directly in the browser
  - Recordings stored securely in your AWS S3 bucket
  - Presigned URLs with 1-hour expiration for security
  - Graceful fallback when recording is not configured
  - Smart status detection (processing, ready, not available)

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
- `conversation.js` – creates/patches Tavus persona and starts conversation (with conditional recording)
- `end-conversation.js` – ends Tavus conversation and triggers data generation
- `generate-feedback.js` – fetches transcript + perception, generates GPT-4 feedback
- `list-conversations.js` – retrieves up to 100 conversations from Tavus API
- `get-conversation.js` – fetches detailed conversation data with verbose events
- `get-recording-url.js` – fetches recording from S3 and generates presigned URL
- `upload-document.js` – uploads resume/job description to Tavus Knowledge Base
- `list-documents.js` – lists uploaded documents with filtering
- `delete-document.js` – deletes documents from Tavus Knowledge Base

## Architecture

- **Frontend**: React 19 + TypeScript + Vite; Tailwind CSS v3; lucide-react icons; react-markdown
- **Backend**: Vercel Serverless Functions (keeps API keys secure)
- **Video**: Daily.co iframe (`@daily-co/daily-js`) for WebRTC
- **AI Interviewer**: Tavus CVI with dynamic persona patching per session
- **Feedback**: Tavus conversation transcript + perception analysis → GPT-4 analysis
- **History**: Tavus API with verbose events for full transcript and perception data
- **Recording**: AWS S3 for storage, presigned URLs for secure playback (optional)
- **Documents**: Tavus Knowledge Base for resume/job description context
- **Flow**: All API calls go through `/api/*` endpoints (no dev/prod split)

## Environment Variables

Copy `.env.example` to `.env` and set:

**Required:**
- `TAVUS_API_KEY` – Your Tavus API key from https://platform.tavus.io
- `REPLICA_ID` – Your Tavus replica ID from the dashboard
- `LEET_CODE_PERSONA_ID` – Persona ID for LeetCode-style interviews
- `GENERAL_RECRUITER_ID` – Persona ID for general interviews (gets patched dynamically)
- `OPENAI_API_KEY` – Your OpenAI API key from https://platform.openai.com

**Optional (for video recording):**
- `AWS_ASSUME_ROLE_ARN` – AWS IAM Role ARN for Tavus to upload recordings (e.g., `arn:aws:iam::123456789:role/TavusRecordingRole`)
- `S3_BUCKET_NAME` – Your S3 bucket name for storing recordings
- `S3_BUCKET_REGION` – AWS region (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID` – AWS access key for presigned URL generation
- `AWS_SECRET_ACCESS_KEY` – AWS secret key for presigned URL generation

> **Note:** The app works perfectly without AWS configuration. Recording is completely optional!

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

## Setting Up Video Recording (Optional)

Interview recording is **completely optional**. The app works perfectly without it! If you want to enable video playback:

### Prerequisites
- AWS account
- Access to create S3 buckets and IAM roles/users

### Step 1: Create S3 Bucket

1. Go to AWS S3 Console
2. Click **Create bucket**
3. Configuration:
   - **Bucket name**: `tavus-interview-recordings` (or your choice)
   - **Region**: `us-east-1` (or your preferred region)
   - **Block Public Access**: Leave enabled (we'll use presigned URLs)
   - **Bucket Versioning**: ✅ **Enable** (required by Tavus)
4. Click **Create bucket**

### Step 2: Enable CORS on S3 Bucket

1. Go to your bucket → **Permissions** tab → **CORS**
2. Add this configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Step 3: Create IAM Policy

1. Go to IAM Console → **Policies** → **Create policy**
2. Choose **JSON** tab and paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:ListBucketMultipartUploads",
      "s3:AbortMultipartUpload",
      "s3:ListBucketVersions",
      "s3:GetObjectVersion",
      "s3:ListMultipartUploadParts"
    ],
    "Resource": [
      "arn:aws:s3:::tavus-interview-recordings",
      "arn:aws:s3:::tavus-interview-recordings/*"
    ]
  }]
}
```
3. Name it: `TavusRecordingAccess`
4. Click **Create policy**

### Step 4: Create IAM Role for Tavus

1. Go to IAM Console → **Roles** → **Create role**
2. Select **Another AWS account**
3. Configuration:
   - **Account ID**: `291871421005` (Tavus's AWS account)
   - **External ID**: `tavus` (**required!**)
   - ✅ Check **Require external ID**
   - **Maximum session duration**: 12 hours
4. Attach the `TavusRecordingAccess` policy
5. **Role name**: `TavusRecordingRole`
6. **Copy the Role ARN** (e.g., `arn:aws:iam::123456789012:role/TavusRecordingRole`)

### Step 5: Create IAM User for Your App

1. Go to IAM Console → **Users** → **Create user**
2. **User name**: `tavus-app-user`
3. Attach the `TavusRecordingAccess` policy directly
4. Go to **Security credentials** → **Create access key**
5. Choose **Application running outside AWS**
6. **Save both keys** (Access Key ID and Secret Access Key)

### Step 6: Update .env

Add these to your `.env` file:

```bash
# AWS S3 Configuration for Recordings
AWS_ASSUME_ROLE_ARN=arn:aws:iam::YOUR_ACCOUNT_ID:role/TavusRecordingRole
S3_BUCKET_NAME=tavus-interview-recordings
S3_BUCKET_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Step 7: Test It!

1. Restart `vercel dev`
2. Start a new interview
3. Complete the interview
4. Wait 2-5 minutes for Tavus to process the recording
5. Go to **History** → Click the conversation
6. Refresh the page → Video player should appear! 🎉

### How Recording Works

1. **During Interview**: Tavus records the video
2. **After Interview Ends**: Tavus uploads to `tavus/{conversation_id}/{timestamp}` in your S3 bucket
3. **When Viewing**: App generates a presigned URL (expires in 1 hour)
4. **Video Player**: Loads directly in browser from S3

### Recording Status Messages

| Status | What It Means |
|--------|---------------|
| ✅ **Ready** | Recording available, click to watch |
| ⏳ **Processing** | Tavus is still processing (wait 2-5 min) |
| ℹ️ **Not Available** | No recording (old interview or recording disabled) |
| ⚙️ **Not Configured** | AWS not set up (recording disabled) |
| ❌ **Error** | Something went wrong (check S3 permissions) |

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

### Recording Playback (`GET /api/get-recording-url?conversation_id=xxx`)
1. Checks if AWS S3 is configured
2. Searches for recording in S3 at `tavus/{conversation_id}/`
3. Finds video files (with or without `.mp4` extension)
4. Generates presigned URL (expires in 1 hour)
5. Returns:
   - `recording_url`: Presigned S3 URL (if found)
   - `status`: ready, processing, not_available, not_configured, or error
   - `message`: User-friendly status description
6. For old conversations (>2 hours), marks as "not_available" instead of "processing"

## Deployment

Deploy to Vercel with one click or via CLI:

```bash
vercel --prod
```

Ensure these environment variables are set in your Vercel project settings:

**Required:**
- `TAVUS_API_KEY`
- `REPLICA_ID`
- `LEET_CODE_PERSONA_ID`
- `GENERAL_RECRUITER_ID`
- `OPENAI_API_KEY`

**Optional (for recording):**
- `AWS_ASSUME_ROLE_ARN`
- `S3_BUCKET_NAME`
- `S3_BUCKET_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Key Benefits of This Architecture

✅ **Secure** - All API keys stay server-side, never exposed to browser
✅ **Serverless** - No infrastructure management, scales automatically
✅ **Type-safe** - Full TypeScript coverage with shared types
✅ **Modern stack** - React 19, Vite, Tailwind CSS v3
✅ **Rich feedback** - Combines transcript analysis with visual perception data
✅ **History tracking** - Full conversation history with detailed analytics
✅ **Video recordings** - Optional AWS S3 integration for playback
✅ **Graceful degradation** - Works perfectly without optional features
✅ **Document context** - Resume/job description integration via Tavus Knowledge Base

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
   - **Watch video recordings** (if AWS S3 is configured)

## Known Limitations / Next Steps

**Implemented Features:**
- ✅ ~~No persistence of interview history or feedback~~ - **IMPLEMENTED**: Full history with transcripts and perception analysis
- ✅ ~~No video recording~~ - **IMPLEMENTED**: AWS S3 integration with presigned URLs
- ✅ ~~Conversations not sorted~~ - **IMPLEMENTED**: Newest first, up to 100 conversations
- ✅ ~~No document upload~~ - **IMPLEMENTED**: Resume and job description integration

**Future Enhancements:**
- No user authentication (all conversations visible to everyone using the same API key)
- No pagination for conversation history (currently limited to 100)
- No filtering options in conversation history (status, date range, etc.)
- No search functionality in conversation history
- Retry logic in feedback generation could be more sophisticated
- Add automated tests (currently none)
- Consider rate limiting for API endpoints
- Add download/export options for transcripts, feedback, and recordings
- Add user authentication for multi-user support
- Add ability to share recordings with others (shareable links)
- Add recording download feature
- Add recording deletion capability

## Troubleshooting

### Recording Issues

**"Recording Not Configured" message:**
- AWS environment variables are missing or incorrect
- Solution: Check `.env` file has all 5 AWS variables set correctly

**"Recording is still processing" (for hours):**
- Recording might have failed during upload
- Solution: Check S3 bucket manually, verify Tavus has access to upload

**"Error Loading Recording":**
- S3 permissions issue or incorrect credentials
- Solution: Verify IAM user has correct permissions, check AWS access keys

**Recording plays but video link expires:**
- This is expected! Presigned URLs expire after 1 hour for security
- Solution: Just refresh the page to generate a new presigned URL

**No recordings in old conversations:**
- Recording was added later, old interviews don't have videos
- Solution: This is expected behavior, only new interviews after AWS setup will have recordings

### General Issues

**Vercel Dev won't start:**
- Missing dependencies or environment variables
- Solution: Run `npm install` and check `.env` file

**Interview won't start:**
- Check Tavus API key and persona IDs in `.env`
- Check browser console for errors

**Feedback not generating:**
- OpenAI API key missing or invalid
- Transcript/perception not ready yet (wait longer after interview)

## Resources

- **Tavus Documentation**: https://docs.tavus.io
- **Tavus Recording Setup**: https://docs.tavus.io/sections/conversational-video-interface/quickstart/conversation-recordings
- **Daily.co Documentation**: https://docs.daily.co
- **OpenAI API**: https://platform.openai.com/docs
- **AWS S3 Documentation**: https://docs.aws.amazon.com/s3/

## License

MIT
