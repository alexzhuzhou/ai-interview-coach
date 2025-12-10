import { useState, useEffect } from 'react';
import { CheckCircle, RotateCcw, Home, Loader2, AlertCircle } from 'lucide-react';
import type { InterviewConfig } from '../types';

interface Props {
  duration: number;
  conversationId: string;
  interviewConfig: InterviewConfig;
  onRestart: () => void;
  onHome: () => void;
}

export function FeedbackScreen({ duration, conversationId, interviewConfig, onRestart, onHome }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  };

  useEffect(() => {
    async function loadFeedback() {
      try {
        setLoading(true);
        setError(null);

        // Development mode: Call API directly (will need to proxy through Vercel in production)
        const isDev = import.meta.env.DEV;
        const apiUrl = isDev
          ? '/api/generate-feedback'
          : '/api/generate-feedback';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            interviewConfig,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate feedback');
        }

        const data = await response.json();
        setFeedback(data.feedback);
      } catch (err) {
        console.error('Failed to load feedback:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate feedback');
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, [conversationId, interviewConfig]);

  // Simple markdown-to-React renderer for basic formatting
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Headers
      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-2xl font-bold mb-4 mt-6">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-semibold mb-3 mt-5">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-lg font-semibold mb-2 mt-4">{line.slice(4)}</h3>);
      }
      // Bold text
      else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={i} className="font-bold mb-2">{line.slice(2, -2)}</p>);
      }
      // Bullet points
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(<li key={i} className="ml-4 mb-1">{line.slice(2)}</li>);
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      }
      // Regular paragraphs
      else if (line.trim()) {
        elements.push(<p key={i} className="mb-2">{line}</p>);
      }

      i++;
    }

    return <div className="prose prose-invert max-w-none">{elements}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Interview Complete!</h2>
              <p className="text-slate-400 text-sm">Session Duration: {formatDuration(duration)}</p>
            </div>
          </div>
        </div>

        {/* Feedback Content */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-6">
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-lg text-slate-300">Analyzing your interview...</p>
              <p className="text-sm text-slate-500 mt-2">This may take 15-30 seconds</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Generate Feedback</h3>
              <p className="text-slate-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && feedback && (
            <div className="text-left">
              <h3 className="text-xl font-bold mb-4 text-blue-400">AI-Generated Feedback</h3>
              <div className="text-slate-200 space-y-3">
                {renderMarkdown(feedback)}
              </div>
            </div>
          )}
        </div>

        {/* Self-Reflection (always show) */}
        {!loading && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
            <h3 className="font-semibold mb-4 text-lg">Self-Reflection Questions:</h3>
            <ul className="space-y-2 text-slate-300">
              <li>• Did you use specific examples in your answers?</li>
              <li>• Were your responses structured (situation, action, result)?</li>
              <li>• Did you maintain eye contact with the camera?</li>
              <li>• What would you do differently next time?</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onHome}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-4 rounded-xl transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            onClick={onRestart}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl transition-colors font-medium"
          >
            <RotateCcw className="w-5 h-5" />
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}
