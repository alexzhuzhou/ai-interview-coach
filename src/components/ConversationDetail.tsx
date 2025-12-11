import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, User, Bot, Loader2, AlertCircle, Brain, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ConversationDetail } from '../types';

interface Props {
  conversationId: string;
  onBack: () => void;
}

export function ConversationDetailComponent({ conversationId, onBack }: Props) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversation() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/get-conversation?conversation_id=${conversationId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load conversation details');
        }

        const data = await response.json();
        setConversation(data);
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversation details');
      } finally {
        setLoading(false);
      }
    }

    loadConversation();
  }, [conversationId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </button>
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-lg text-slate-300">Loading conversation details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </button>
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Details</h3>
            <p className="text-slate-400 mb-6">{error || 'Conversation not found'}</p>
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

  // Parse events array to extract transcript, perception analysis, and shutdown reason
  const events = conversation.events || [];

  // Find transcript from transcription_ready event
  const transcriptEvent = events.find(e => e.event_type === 'application.transcription_ready');
  const rawTranscript = transcriptEvent?.properties.transcript || [];
  // Filter out system messages to show only user and assistant conversation
  const transcript = rawTranscript.filter(msg => msg.role === 'user' || msg.role === 'assistant');

  // Find perception analysis from perception_analysis event
  const perceptionEvent = events.find(e => e.event_type === 'application.perception_analysis');
  const perceptionAnalysisText = perceptionEvent?.properties.analysis || null;

  // Find shutdown reason from system.shutdown event
  const shutdownEvent = events.find(e => e.event_type === 'system.shutdown');
  const shutdownReason = shutdownEvent?.properties.shutdown_reason || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>

        {/* Header */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {conversation.conversation_name || 'Interview Session'}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(conversation.created_at)}
            </div>
            <div className="px-2 py-1 bg-slate-700 rounded text-xs">
              {conversation.status}
            </div>
            {shutdownReason && (
              <div className="text-slate-400">
                Ended: {shutdownReason.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Conversation Transcript
          </h2>

          {transcript.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No transcript available</p>
          ) : (
            <div className="space-y-4">
              {transcript.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-blue-500/20'
                      : 'bg-green-500/20'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className={`flex-1 ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`inline-block px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-slate-700/50 border border-slate-600'
                    }`}>
                      <p className="text-slate-200">{message.content}</p>
                      {message.timestamp && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Perception Analysis */}
        {perceptionAnalysisText && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Visual Perception Analysis
            </h2>

            <div className="prose prose-invert prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-white">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-base font-semibold mb-2 mt-3 text-white">{children}</h4>,
                  p: ({ children }) => <p className="mb-3 text-slate-200 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-slate-200 ml-4">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-200 ml-4">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-200">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                  code: ({ children }) => <code className="bg-slate-700 px-1.5 py-0.5 rounded text-sm text-blue-300">{children}</code>,
                  pre: ({ children }) => <pre className="bg-slate-700 p-4 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                }}
              >
                {perceptionAnalysisText}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {!perceptionAnalysisText && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No perception analysis available for this conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
