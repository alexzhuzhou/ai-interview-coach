import { useState, useEffect } from 'react';
import { Clock, Briefcase, Code, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import type { ConversationListItem } from '../types';

interface Props {
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationHistory({ onSelectConversation }: Props) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/list-conversations');

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to load conversations');
        }

        const data = await response.json();

        // Handle different response formats
        let conversationList: ConversationListItem[] = [];
        if (Array.isArray(data)) {
          conversationList = data;
        } else if (data.data && Array.isArray(data.data)) {
          // Tavus API returns { data: [...], total_count: N }
          conversationList = data.data;
        } else if (data.conversations && Array.isArray(data.conversations)) {
          conversationList = data.conversations;
        }

        // Sort by created_at date, newest first
        conversationList.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Descending order (newest first)
        });

        setConversations(conversationList);
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversation history');
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getInterviewIcon = (conversationName: string) => {
    if (conversationName.toLowerCase().includes('leetcode')) {
      return <Code className="w-5 h-5 text-green-400" />;
    }
    return <Briefcase className="w-5 h-5 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-lg text-slate-300">Loading conversation history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load History</h3>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview History</h1>
          <p className="text-slate-400">
            {conversations.length === 0
              ? 'No interviews yet. Start your first practice session!'
              : `${conversations.length} interview${conversations.length !== 1 ? 's' : ''} completed`
            }
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700 text-center">
            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-lg text-slate-400">No interviews yet</p>
            <p className="text-sm text-slate-500 mt-2">Complete an interview to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <button
                key={conversation.conversation_id}
                onClick={() => onSelectConversation(conversation.conversation_id)}
                className="w-full bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getInterviewIcon(conversation.conversation_name)}
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {conversation.conversation_name || 'Interview Session'}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(conversation.created_at)}
                      </div>
                      <div className="px-2 py-1 bg-slate-700 rounded text-xs">
                        {conversation.status}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
