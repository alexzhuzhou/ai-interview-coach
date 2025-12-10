import { useState, useCallback } from 'react';
import type { InterviewConfig, ConversationState } from '../types';

const initialState: ConversationState = {
  status: 'idle',
  conversationId: null,
  conversationUrl: null,
  error: null,
  startTime: null,
};

export function useConversation() {
  const [state, setState] = useState<ConversationState>(initialState);

  const startConversation = useCallback(async (config: InterviewConfig) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }));

    try {
      // Development mode: Use Tavus API directly from the frontend
      // Note: This exposes the API key in the browser. Only use for local dev!
      const isDev = import.meta.env.DEV;

      if (isDev) {
        console.log('Running in development mode - calling Tavus API directly');

        const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
        console.log('Using API key:', TAVUS_API_KEY ? 'Found' : 'Missing');
        const TAVUS_BASE_URL = 'https://tavusapi.com/v2';
        const REPLICA_ID = import.meta.env.VITE_REPLICA_ID;

        if (!TAVUS_API_KEY || !REPLICA_ID) {
          throw new Error('Missing required environment variables: VITE_TAVUS_API_KEY and VITE_REPLICA_ID must be set in .env file');
        }

        // Create persona
        const systemPrompt = `You are an experienced hiring manager conducting a ${config.interviewType} interview for a ${config.experienceLevel} ${config.role} position in the ${config.industry} industry.

INTERVIEW GUIDELINES:
- Start with a warm, professional greeting and brief introduction
- Ask 4-5 questions total, mixing behavioral and role-specific questions
- Use the STAR method to probe deeper on behavioral questions
- Be encouraging but professional
- After 4-5 questions, wrap up professionally and thank the candidate`;

        const personaResponse = await fetch(`${TAVUS_BASE_URL}/personas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': TAVUS_API_KEY,
          },
          body: JSON.stringify({
            persona_name: `Interviewer-${Date.now()}`,
            system_prompt: systemPrompt,
            context: `Interviewing for: ${config.role} in ${config.industry}.`,
            default_replica_id: REPLICA_ID,
          }),
        });

        if (!personaResponse.ok) {
          const errorText = await personaResponse.text();
          console.error('Persona creation failed:', errorText);
          throw new Error(`Failed to create persona: ${personaResponse.status} ${errorText.substring(0, 100)}`);
        }

        const persona = await personaResponse.json();

        // Create conversation
        const conversationResponse = await fetch(`${TAVUS_BASE_URL}/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': TAVUS_API_KEY,
          },
          body: JSON.stringify({
            replica_id: REPLICA_ID,
            persona_id: persona.persona_id,
            custom_greeting: `Hi there! Thanks for joining me today. I'm excited to learn more about you and your interest in the ${config.role} position. Let's get started - are you ready?`,
            properties: {
              max_call_duration: 600,
              participant_left_timeout: 30,
              enable_recording: false,
              language: 'english',
            },
          }),
        });

        if (!conversationResponse.ok) {
          const errorText = await conversationResponse.text();
          console.error('Conversation creation failed:', errorText);
          throw new Error(`Failed to create conversation: ${conversationResponse.status} ${errorText.substring(0, 100)}`);
        }

        const conversation = await conversationResponse.json();

        setState({
          status: 'active',
          conversationId: conversation.conversation_id,
          conversationUrl: conversation.conversation_url,
          error: null,
          startTime: new Date(),
        });

        return conversation;
      } else {
        // Production mode: Use serverless API
        const response = await fetch('/api/conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });

        if (!response.ok) {
          throw new Error('Failed to start interview');
        }

        const data = await response.json();

        setState({
          status: 'active',
          conversationId: data.conversationId,
          conversationUrl: data.conversationUrl,
          error: null,
          startTime: new Date(),
        });

        return data;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      throw error;
    }
  }, []);

  const endConversation = useCallback(() => {
    setState(prev => ({ ...prev, status: 'ended' }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    startConversation,
    endConversation,
    reset,
  };
}
