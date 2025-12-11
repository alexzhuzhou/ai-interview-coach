import { useState, useEffect } from 'react';
import { CheckCircle, RotateCcw, Home, Loader2, AlertCircle, TrendingUp, AlertTriangle, Target, Eye, Sparkles, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { InterviewConfig } from '../types';

interface Props {
  duration: number;
  conversationId: string;
  interviewConfig: InterviewConfig;
  onRestart: () => void;
  onHome: () => void;
}

/**
 * Cleans up markdown feedback to remove common formatting issues
 */
function cleanupFeedback(markdown: string): string {
  return markdown
    // Remove empty list items (bullets with no content or just whitespace)
    .replace(/^[\s]*[-*]\s*$/gm, '')
    // Remove multiple consecutive empty lines (keep max 2)
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    // Remove trailing whitespace at end of document
    .trim();
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

        const response = await fetch('/api/generate-feedback', {
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
        setFeedback(cleanupFeedback(data.feedback));
      } catch (err) {
        console.error('Failed to load feedback:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate feedback');
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, [conversationId, interviewConfig]);


  // Section icon mapping for visual feedback
  const sectionIcons: Record<string, { icon: any; color: string; bgColor: string }> = {
    'Overall Performance': {
      icon: Sparkles,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30'
    },
    'Key Strengths': {
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/30'
    },
    'Areas for Improvement': {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30'
    },
    'Specific Recommendations': {
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30'
    },
    'Visual Presence & Body Language': {
      icon: Eye,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10 border-pink-500/30'
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-900/40 via-emerald-800/30 to-green-900/40 rounded-2xl p-6 border border-green-700/50 mb-6 relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>

          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center border-2 border-green-400/30">
              <Award className="w-9 h-9 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-bold">Interview Complete!</h2>
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <p className="text-green-300">Session Duration: {formatDuration(duration)}</p>
                <span className="text-green-600">•</span>
                <p className="text-slate-300">AI Analysis Ready</p>
              </div>
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
            <div className="text-left animate-fade-in">
              <div className="prose prose-invert prose-slate max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 mt-6 text-white flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => {
                      const title = String(children);
                      const iconConfig = sectionIcons[title] || {
                        icon: CheckCircle,
                        color: 'text-slate-400',
                        bgColor: 'bg-slate-700/20 border-slate-600'
                      };
                      const Icon = iconConfig.icon;

                      return (
                        <div className={`mt-6 mb-4 p-4 rounded-xl border ${iconConfig.bgColor} backdrop-blur-sm`}>
                          <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${iconConfig.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${iconConfig.color}`} />
                            </div>
                            {children}
                          </h2>
                        </div>
                      );
                    },
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mb-3 mt-4 text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-base font-semibold mb-2 mt-3 text-slate-200">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-slate-200 leading-relaxed text-[15px]">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-none mb-4 space-y-2.5 text-slate-200 ml-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2.5 text-slate-200 ml-4">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-slate-200 flex items-start gap-3 group hover:bg-slate-700/30 -ml-2 pl-2 py-1 rounded-lg transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0 group-hover:bg-blue-300"></div>
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-blue-300">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="bg-slate-700/70 px-2 py-0.5 rounded text-sm text-blue-300 font-mono border border-slate-600">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-slate-700/70 p-4 rounded-xl overflow-x-auto mb-4 border border-slate-600">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {feedback}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Self-Reflection (always show) */}
        {!loading && (
          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl p-6 border border-indigo-700/30 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-bold text-lg text-white">Self-Reflection Questions</h3>
            </div>
            <div className="space-y-3">
              {[
                'Did you use specific examples in your answers?',
                'Were your responses structured (situation, action, result)?',
                'Did you maintain eye contact with the camera?',
                'What would you do differently next time?',
              ].map((question, idx) => (
                <div key={idx} className="flex items-start gap-3 text-slate-300 hover:text-white transition-colors group">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-600/40 transition-colors">
                    <span className="text-indigo-300 text-sm font-semibold">{idx + 1}</span>
                  </div>
                  <p className="flex-1">{question}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onHome}
            className="group relative inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-4 rounded-xl transition-all font-medium overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600/0 via-slate-500/20 to-slate-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Home className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Home</span>
          </button>
          <button
            onClick={onRestart}
            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl transition-all font-medium shadow-lg shadow-blue-900/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/30 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <RotateCcw className="w-5 h-5 relative z-10 group-hover:rotate-[-30deg] transition-transform" />
            <span className="relative z-10">Practice Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
