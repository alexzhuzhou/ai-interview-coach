// Vercel serverless function
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';
const REPLICA_ID = process.env.REPLICA_ID;

interface ConversationRequest {
  role: string;
  industry: string;
  experienceLevel: string;
  interviewType: string;
}

function generateSystemPrompt(config: ConversationRequest): string {
  return `You are an experienced hiring manager conducting a ${config.interviewType} interview for a ${config.experienceLevel} ${config.role} position in the ${config.industry} industry.

INTERVIEW GUIDELINES:
- Start with a warm, professional greeting and brief introduction
- Ask 4-5 questions total, mixing behavioral and role-specific questions
- Use the STAR method to probe deeper on behavioral questions (ask follow-ups like "What was the result?" or "How did you handle that specifically?")
- Be encouraging but professional - nod, say "great" or "interesting" naturally
- Keep track of which questions you've asked - don't repeat
- After 4-5 questions, wrap up professionally and thank the candidate

QUESTION TYPES TO INCLUDE:
1. An icebreaker ("Tell me about yourself" or "Walk me through your background")
2. A behavioral question ("Tell me about a time when...")
3. A role-specific technical or situational question
4. A question about challenges or failures (growth mindset)
5. Candidate's questions ("What questions do you have for me?")

CONVERSATION STYLE:
- Speak naturally and conversationally, not robotically
- React to their answers briefly before moving on
- If an answer is vague, ask ONE clarifying follow-up
- Keep your responses concise (2-3 sentences max between questions)
- Maintain a ${config.experienceLevel === 'entry' ? 'supportive and encouraging' : 'professional and direct'} tone

END THE INTERVIEW:
- After the candidate asks their questions (or declines), thank them warmly
- Mention that they'll "hear back soon" (standard interview closing)
- Say goodbye professionally`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment variables
  if (!TAVUS_API_KEY) {
    return res.status(500).json({ error: 'TAVUS_API_KEY environment variable is not set' });
  }
  if (!REPLICA_ID) {
    return res.status(500).json({ error: 'REPLICA_ID environment variable is not set' });
  }

  try {
    const { role, industry, experienceLevel, interviewType } = req.body as ConversationRequest;

    // Create persona with custom system prompt
    const personaResponse = await fetch(`${TAVUS_BASE_URL}/personas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY!,
      },
      body: JSON.stringify({
        persona_name: `Interviewer-${Date.now()}`,
        system_prompt: generateSystemPrompt({ role, industry, experienceLevel, interviewType }),
        context: `Interviewing for: ${role} in ${industry}. Candidate level: ${experienceLevel}. Interview type: ${interviewType}.`,
        default_replica_id: REPLICA_ID,
      }),
    });

    if (!personaResponse.ok) {
      const error = await personaResponse.text();
      console.error('Persona creation failed:', error);
      return res.status(500).json({ error: 'Failed to create persona' });
    }

    const persona = await personaResponse.json();

    // Create conversation with the new persona
    const conversationResponse = await fetch(`${TAVUS_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY!,
      },
      body: JSON.stringify({
        replica_id: REPLICA_ID,
        persona_id: persona.persona_id,
        custom_greeting: `Hi there! Thanks for joining me today. I'm excited to learn more about you and your interest in the ${role} position. Let's get started - are you ready?`,
        properties: {
          max_call_duration: 600,  // 10 minutes max
          participant_left_timeout: 30,
          enable_recording: false,
          language: 'english',
        },
      }),
    });

    if (!conversationResponse.ok) {
      const error = await conversationResponse.text();
      console.error('Conversation creation failed:', error);
      return res.status(500).json({ error: 'Failed to create conversation' });
    }

    const conversation = await conversationResponse.json();

    return res.status(200).json({
      conversationId: conversation.conversation_id,
      conversationUrl: conversation.conversation_url,
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
