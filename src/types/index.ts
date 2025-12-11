export interface InterviewConfig {
  category: 'leetcode' | 'general';
  userName: string;
  role: string;
  industry: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  interviewType: 'behavioral' | 'technical' | 'mixed';
  documentIds?: string[]; // Optional: resume and job description document IDs
}

export interface ConversationState {
  status: 'idle' | 'loading' | 'active' | 'ended' | 'error';
  conversationId: string | null;
  conversationUrl: string | null;
  error: string | null;
  startTime: Date | null;
  documentIds?: string[]; // Track which documents were used in this conversation
}

export type AppScreen = 'landing' | 'setup' | 'interview' | 'feedback' | 'history' | 'conversation-detail' | 'documents';

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
  document_ids?: string[]; // Documents used in this conversation
}

// Tavus Knowledge Base Document Types
export interface TavusDocument {
  document_id: string;
  document_name: string;
  document_url?: string;
  status: 'processing' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
  tags?: string[];
  properties?: Record<string, unknown>;
}

export interface UploadDocumentRequest {
  file?: File;
  text?: string;
  documentName: string;
  tags: string[];
}

export interface UploadDocumentResponse {
  document_id: string;
  document_name: string;
  status: string;
}
