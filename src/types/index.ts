export interface InterviewConfig {
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

export type AppScreen = 'landing' | 'setup' | 'interview' | 'feedback';
