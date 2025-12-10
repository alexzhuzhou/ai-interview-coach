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
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to start interview';
        throw new Error(errorMessage);
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
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      throw error;
    }
  }, []);

  const endConversation = useCallback(async () => {
    const currentConversationId = state.conversationId;

    setState(prev => ({ ...prev, status: 'ended' }));

    if (currentConversationId) {
      try {
        await fetch('/api/end-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: currentConversationId }),
        });
      } catch (error) {
        console.error('Failed to end conversation via API:', error);
        // Don't throw - we still want to show the feedback screen
      }
    }
  }, [state.conversationId]);

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
