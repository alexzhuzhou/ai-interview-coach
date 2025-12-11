// Vercel serverless function
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';
const REPLICA_ID = process.env.REPLICA_ID;
const LEET_CODE_PERSONA_ID = process.env.LEET_CODE_PERSONA_ID;
const GENERAL_RECRUITER_ID = process.env.GENERAL_RECRUITER_ID;

function generateSystemPrompt(config) {
  const hasDocuments = config.hasResume || config.hasJobDescription;
  const documentContext = hasDocuments
    ? `\n\nDOCUMENT CONTEXT:
${config.hasResume ? '- You have access to the candidate\'s resume. Use it to ask specific questions about their experience and background.' : ''}
${config.hasJobDescription ? '- You have access to the job description. Tailor your questions to assess fit for this specific role and its requirements.' : ''}
- Reference specific details from these documents naturally in your questions
- Assess how well the candidate's experience aligns with the role requirements`
    : '';

  return `You are an experienced hiring manager conducting a ${config.interviewType} interview for a ${config.experienceLevel} ${config.role} position in the ${config.industry} industry.${documentContext}

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

function generateGreeting(config, category) {
  if (category === 'leetcode') {
    return "Hi there! Thanks for joining me today. Ready to solve some coding problems together? ";
  }
  return `Hi there! Thanks for joining me today. I'm excited to learn more about you and your interest in the ${config.role} position. Let's get started - are you ready?`;
}

export default async function handler(req, res) {
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
  if (!LEET_CODE_PERSONA_ID) {
    return res.status(500).json({ error: 'LEET_CODE_PERSONA_ID environment variable is not set' });
  }
  if (!GENERAL_RECRUITER_ID) {
    return res.status(500).json({ error: 'GENERAL_RECRUITER_ID environment variable is not set' });
  }

  try {
    const { category, role, industry, experienceLevel, interviewType, documentIds } = req.body;

    console.log('Starting interview:', { category, role, industry, experienceLevel, interviewType, documentIds });

    let personaId;

    // Determine which persona to use based on category
    if (category === 'leetcode') {
      // Use LeetCode persona directly (no patching needed)
      personaId = LEET_CODE_PERSONA_ID;
      console.log('Using LeetCode persona:', personaId);
    } else if (category === 'general') {
      // PATCH the General Recruiter persona with user's custom settings
      personaId = GENERAL_RECRUITER_ID;
      console.log('Patching General Recruiter persona:', personaId);

      // Determine if we have resume and/or job description from documentIds
      const hasResume = documentIds && documentIds.length > 0;
      const hasJobDescription = documentIds && documentIds.length > 1; // Assume 2 docs = resume + JD

      const patchOperations = [
        {
          op: 'replace',
          path: '/system_prompt',
          value: generateSystemPrompt({ role, industry, experienceLevel, interviewType, hasResume, hasJobDescription })
        },
        {
          op: 'replace',
          path: '/context',
          value: `Interviewing for: ${role} in ${industry}. Candidate level: ${experienceLevel}. Interview type: ${interviewType}.${hasResume || hasJobDescription ? ' Documents provided for context.' : ''}`
        }
      ];

      const patchResponse = await fetch(`${TAVUS_BASE_URL}/personas/${personaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY,
        },
        body: JSON.stringify(patchOperations),
      });

      // 304 Not Modified is a success case - persona is already in desired state
      if (!patchResponse.ok && patchResponse.status !== 304) {
        const error = await patchResponse.text();
        console.error('Persona patch failed:', {
          status: patchResponse.status,
          statusText: patchResponse.statusText,
          error,
        });
        return res.status(500).json({
          error: 'Failed to update persona',
          details: error,
          status: patchResponse.status
        });
      }

      if (patchResponse.status === 304) {
        console.log('Persona already up-to-date (304 Not Modified)');
      } else {
        console.log('Persona patched successfully');
      }
    } else {
      return res.status(400).json({ error: 'Invalid interview category' });
    }

    // Create conversation with the selected/patched persona
    const conversationBody = {
      replica_id: REPLICA_ID,
      persona_id: personaId,
      custom_greeting: generateGreeting({ role, industry, experienceLevel, interviewType }, category),
      properties: {
        max_call_duration: 600,  // 10 minutes max
        participant_left_timeout: 30,
        enable_recording: true,
        language: 'english',
      },
    };

    // Add document_ids if provided (for General interviews with resume/JD)
    if (documentIds && documentIds.length > 0) {
      conversationBody.document_ids = documentIds;
      console.log('Including documents in conversation:', documentIds);
    }

    const conversationResponse = await fetch(`${TAVUS_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY,
      },
      body: JSON.stringify(conversationBody),
    });

    if (!conversationResponse.ok) {
      const error = await conversationResponse.text();
      console.error('Conversation creation failed:', {
        status: conversationResponse.status,
        statusText: conversationResponse.statusText,
        error,
      });
      return res.status(500).json({
        error: 'Failed to create conversation',
        details: error,
        status: conversationResponse.status
      });
    }

    const conversation = await conversationResponse.json();

    return res.status(200).json({
      conversationId: conversation.conversation_id,
      conversationUrl: conversation.conversation_url,
      documentIds: documentIds || [], // Return document IDs for tracking
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
