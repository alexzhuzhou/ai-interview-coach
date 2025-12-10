import type { VercelRequest, VercelResponse } from '@vercel/node';

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface InterviewConfig {
  role: string;
  industry: string;
  experienceLevel: string;
  interviewType: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, interviewConfig } = req.body as {
      conversationId: string;
      interviewConfig: InterviewConfig;
    };

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    if (!TAVUS_API_KEY) {
      return res.status(500).json({ error: 'TAVUS_API_KEY not configured' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    // Fetch conversation data from Tavus with verbose=true to get transcript
    const conversationResponse = await fetch(
      `${TAVUS_BASE_URL}/conversations/${conversationId}?verbose=true`,
      {
        method: 'GET',
        headers: {
          'x-api-key': TAVUS_API_KEY,
        },
      }
    );

    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text();
      console.error('Failed to fetch conversation:', errorText);
      return res.status(conversationResponse.status).json({
        error: `Failed to fetch conversation: ${errorText.substring(0, 200)}`,
      });
    }

    const conversationData = await conversationResponse.json();

    // Extract transcript from verbose response
    const transcript = conversationData.transcript || [];

    if (transcript.length === 0) {
      return res.status(200).json({
        feedback: `# Interview Feedback\n\n⚠️ No transcript available yet. The conversation may still be processing.\n\n## What You Can Do:\n- Wait a few moments and refresh\n- The transcript is generated after the conversation ends\n- If this persists, there may have been an issue with the recording`,
      });
    }

    // Format transcript for analysis
    const formattedTranscript = transcript
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    // Generate feedback using OpenAI
    const feedback = await generateFeedback(formattedTranscript, interviewConfig);

    return res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function generateFeedback(
  transcript: string,
  config: InterviewConfig
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach providing constructive feedback on mock interviews. Analyze the transcript and provide detailed, actionable feedback.

Focus on:
1. **Communication Skills**: Clarity, confidence, pacing, and articulation
2. **STAR Method**: Did they structure answers with Situation, Task, Action, Result?
3. **Content Quality**: Specific examples, relevant experience, depth of answers
4. **Areas for Improvement**: Concrete suggestions with examples
5. **Strengths**: What they did well and should continue doing

Format your response in markdown with clear sections and bullet points.`,
        },
        {
          role: 'user',
          content: `Interview Details:
- Role: ${config.role}
- Industry: ${config.industry}
- Experience Level: ${config.experienceLevel}
- Interview Type: ${config.interviewType}

Transcript:
${transcript}

Provide detailed, constructive feedback.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}