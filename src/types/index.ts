export interface InterviewConfig {
  category: 'leetcode' | 'general';
  role: string;
  industry: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  interviewType: 'behavioral' | 'technical' | 'mixed';
}

export interface ConversationState {
  status: 'idle' | 'loading' | 'active' | 'ended' | 'error';
  conversationId: string | null;
  conversationUrl: string | null;
  error: string | null;
  startTime: Date | null;
}

export type AppScreen = 'landing' | 'setup' | 'interview' | 'feedback' | 'history' | 'conversation-detail';

// Conversation History Types
export interface ConversationListItem {
  conversation_id: string;
  conversation_name: string;
  conversation_url: string;
  created_at: string;
  status: string;
  replica_id: string;
  persona_id: string;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface PerceptionAnalysis {
  appearance?: {
    description?: string;
    attire?: string;
    grooming?: string;
  };
  behavior?: {
    body_language?: string;
    eye_contact?: string;
    gestures?: string;
    posture?: string;
  };
  emotional_states?: {
    overall_mood?: string;
    engagement_level?: string;
    confidence_level?: string;
    nervousness_indicators?: string[];
  };
  screen_activities?: {
    activities_detected?: string[];
    distractions?: string[];
  };
  summary?: string;
}

export interface ConversationEvent {
  created_at: string;
  updated_at: string;
  event_type: string;
  message_type: string;
  properties: {
    analysis?: string;
    shutdown_reason?: string;
    replica_id?: string;
    transcript?: TranscriptMessage[];
  };
  timestamp: string;
}

export interface ConversationDetail {
  conversation_id: string;
  conversation_name: string;
  conversation_url: string;
  created_at: string;
  status: string;
  replica_id: string;
  persona_id: string;
  events?: ConversationEvent[];
}
