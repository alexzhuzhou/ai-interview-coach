const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = 'https://tavusapi.com/v2';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, interviewConfig } = req.body;

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

    // Log all available event types for debugging
    const availableEventTypes = conversationData.events?.map(e => e.event_type) || [];
    console.log('Available event types:', availableEventTypes);

    // Extract transcript from events array
    const transcriptEvent = conversationData.events?.find(
      (event) => event.event_type === 'application.transcription_ready'
    );
    let transcript = transcriptEvent?.properties?.transcript || [];

    // Extract perception analysis from events array
    const perceptionEvent = conversationData.events?.find(
      (event) => event.event_type === 'application.perception_analysis'
    );
    let perceptionAnalysis = perceptionEvent?.properties?.analysis || null;

    console.log('Conversation data:', {
      hasTranscript: !!transcript.length,
      transcriptLength: transcript.length,
      hasPerceptionAnalysis: !!perceptionAnalysis,
      status: conversationData.status,
      hasEvents: !!conversationData.events,
      eventCount: conversationData.events?.length || 0,
    });

    // If transcript not ready, wait 10 seconds and retry once
    if (transcript.length === 0) {
      console.log('Transcript not ready, waiting 10 seconds and retrying...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      const retryResponse = await fetch(
        `${TAVUS_BASE_URL}/conversations/${conversationId}?verbose=true`,
        {
          method: 'GET',
          headers: {
            'x-api-key': TAVUS_API_KEY,
          },
        }
      );

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();

        // Extract transcript from events array
        const retryTranscriptEvent = retryData.events?.find(
          (event) => event.event_type === 'application.transcription_ready'
        );
        transcript = retryTranscriptEvent?.properties?.transcript || [];

        // Extract perception analysis from events array
        const retryPerceptionEvent = retryData.events?.find(
          (event) => event.event_type === 'application.perception_analysis'
        );
        perceptionAnalysis = retryPerceptionEvent?.properties?.analysis || null;

        console.log('Retry conversation data:', {
          hasTranscript: !!transcript.length,
          transcriptLength: transcript.length,
          hasPerceptionAnalysis: !!perceptionAnalysis,
          status: retryData.status,
        });
      }

      // If still no transcript, return helpful message
      if (transcript.length === 0) {
        return res.status(200).json({
          feedback: `# Interview Feedback\n\n⚠️ No transcript available yet. The conversation may still be processing.\n\n## What You Can Do:\n- The interview may have been too short to generate a transcript\n- Try having a longer conversation (at least 1-2 minutes)\n- Wait a few moments and refresh the page\n\n**Tip:** For best results, have a natural conversation with the interviewer for at least 2-3 questions.`,
        });
      }
    }

    // Format transcript for analysis
    const formattedTranscript = transcript
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    // Generate feedback using OpenAI
    const feedback = await generateFeedback(formattedTranscript, interviewConfig, perceptionAnalysis);

    return res.status(200).json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function generateFeedback(
  transcript,
  config,
  perceptionAnalysis
) {
  // Prepare perception analysis text if available
  const perceptionText = perceptionAnalysis
    ? `\n\nVisual Analysis:
${JSON.stringify(perceptionAnalysis, null, 2)}`
    : '';

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
          content: `You are an expert interview coach providing constructive feedback on mock interviews. Analyze both the transcript and visual analysis to provide detailed, actionable feedback.

CRITICAL FORMATTING RULES:
- Use strict markdown formatting with clear hierarchy
- Start with an overall performance summary (2-3 sentences)
- Organize feedback into EXACTLY these sections with ## headers:
  ## Overall Performance
  ## Key Strengths
  ## Areas for Improvement
  ## Specific Recommendations
  ## Visual Presence & Body Language (only if perception analysis is available)
- Use bullet points with meaningful content only (NO empty bullets)
- Each bullet should be specific and actionable
- Use **bold** for emphasis on key points
- Keep feedback constructive and professional
- The feedback is for the 'user' role in the transcript, not 'system' or 'assistant'
- Aim for 8-15 total bullet points across all sections
- Each section should have 2-4 substantive bullet points

STRUCTURE EXAMPLE:
## Overall Performance
[2-3 sentence summary of performance]

## Key Strengths
- **[Strength category]**: Specific observation with example from interview
- **[Strength category]**: Specific observation with example

## Areas for Improvement
- **[Area]**: What to improve and why, with specific suggestion
- **[Area]**: What to improve and why, with specific suggestion

## Specific Recommendations
- **[Action item]**: Concrete next step to practice
- **[Action item]**: Concrete next step to practice

## Visual Presence & Body Language
[Only if perception analysis is available]
- **[Observation]**: Based on visual analysis data`,
        },
        {
          role: 'user',
          content: `Interview Details:
- Role: ${config.role}
- Industry: ${config.industry}
- Experience Level: ${config.experienceLevel}
- Interview Type: ${config.interviewType}

Transcript:
${transcript}${perceptionText}

Provide detailed, constructive feedback following the exact format specified in the system prompt.`,
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