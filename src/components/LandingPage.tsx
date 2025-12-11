import { useState } from 'react';
import {
  ArrowRight,
  Video,
  MessageSquare,
  Award,
  Settings,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Check,
  Repeat,
  FileText,
  History,
  Sparkles,
  Clock,
} from 'lucide-react';

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const scrollToHowIt = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-hero mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient">
            AI Interview Coach
          </h1>
          <p className="text-xl text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Practice your interview skills with a realistic AI interviewer.
            Get unlimited practice sessions tailored to your target role.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mb-10">
            <span className="flex items-center gap-1">
              <Repeat className="w-4 h-4 text-cyan-400" />
              Practice Unlimited
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AI-Powered
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              Get Instant Feedback
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-900/30"
            >
              Start Practice Interview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={scrollToHowIt}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-slate-700"
            >
              See How It Works
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-slate-900/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-section text-center mb-4">How It Works</h2>
          <p className="text-center text-slate-400 mb-16 max-w-2xl mx-auto">
            Get started in three simple steps and start improving your interview skills today
          </p>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Arrow connectors (hidden on mobile) */}
            <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-blue-500/50"></div>

            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-blue-900/30">
                  1
                </div>
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                  <Settings className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Setup Your Interview</h3>
                <ul className="text-slate-400 space-y-2 text-sm">
                  <li>Choose your target role and industry</li>
                  <li>Select interview type (behavioral, technical, mixed)</li>
                  <li>Optional: Upload resume/job description</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-cyan-900/30">
                  2
                </div>
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
                  <Video className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Practice Live</h3>
                <ul className="text-slate-400 space-y-2 text-sm">
                  <li>10-minute video interview with AI</li>
                  <li>Real-time conversation</li>
                  <li>Natural question flow based on your responses</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-emerald-900/30">
                  3
                </div>
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <BarChart3 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Review & Improve</h3>
                <ul className="text-slate-400 space-y-2 text-sm">
                  <li>Detailed AI feedback on performance</li>
                  <li>Communication skills analysis</li>
                  <li>Body language insights</li>
                  <li>Actionable recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Questions Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-section text-center mb-4">Sample Questions</h2>
          <p className="text-center text-slate-400 mb-12">
            Here's what you can expect during your practice interviews
          </p>

          <div className="space-y-4">
            {/* General Interview Questions */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === 'general' ? null : 'general')
                }
                className="w-full flex items-center justify-between p-6 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">General Interview Examples</h3>
                    <p className="text-sm text-slate-400">Behavioral and situational questions</p>
                  </div>
                </div>
                {expandedQuestion === 'general' ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedQuestion === 'general' && (
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex items-start gap-3 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                    <p>"Tell me about a time you overcame a significant challenge at work..."</p>
                  </div>
                  <div className="flex items-start gap-3 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                    <p>"Describe your leadership style and give me an example of how you've used it..."</p>
                  </div>
                  <div className="flex items-start gap-3 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                    <p>"Why are you interested in this role and what makes you a good fit?"</p>
                  </div>
                  <div className="flex items-start gap-3 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                    <p>"How do you handle conflicts with team members or stakeholders?"</p>
                  </div>
                </div>
              )}
            </div>

            {/* LeetCode Interview Questions */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === 'leetcode' ? null : 'leetcode')
                }
                className="w-full flex items-center justify-between p-6 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">LeetCode Style Examples</h3>
                    <p className="text-sm text-slate-400">Coding and algorithmic problems</p>
                  </div>
                </div>
                {expandedQuestion === 'leetcode' ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedQuestion === 'leetcode' && (
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex items-start gap-3 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-1 text-emerald-400 flex-shrink-0" />
                    <p>"Implement a function to reverse a linked list. What's the time and space complexity?"</p>
                  </div>
                  <div className="flex items-start gap-3 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-1 text-emerald-400 flex-shrink-0" />
                    <p>"Find the longest substring without repeating characters. Walk me through your approach."</p>
                  </div>
                  <div className="flex items-start gap-3 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-1 text-emerald-400 flex-shrink-0" />
                    <p>"Design a rate limiter for an API. How would you handle edge cases?"</p>
                  </div>
                  <div className="flex items-start gap-3 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-1 text-emerald-400 flex-shrink-0" />
                    <p>"Implement a LRU cache with O(1) operations. Explain your data structure choices."</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features & Benefits Section */}
      <div className="bg-slate-900/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-section text-center mb-4">Why Practice With Us</h2>
          <p className="text-center text-slate-400 mb-16 max-w-2xl mx-auto">
            Everything you need to ace your next interview
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Face-to-Face Practice</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Practice with a realistic AI interviewer who sees and responds to you in real-time, just like a real interview.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tailored Questions</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Industry-specific questions customized to your role, experience level, and the type of interview you're preparing for.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Feedback</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Get detailed AI analysis of your communication, content quality, and body language immediately after each session.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Repeat className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unlimited Practice</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No limits on practice sessions. Interview as many times as you need to build confidence and perfect your responses.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-amber-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Document Context</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload your resume and job description so the AI can ask personalized questions relevant to your background and target role.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-sky-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <History className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conversation History</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Review full transcripts, detailed feedback, and video recordings from all your past interviews to track your progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Tips Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-section text-center mb-4">Before You Start</h2>
          <p className="text-center text-slate-400 mb-12">
            Follow these tips for the best practice experience
          </p>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Find a quiet, well-lit space with minimal background noise',
                'Test your camera and microphone (check browser permissions)',
                'Dress professionally - treat it like a real interview',
                'Have a glass of water nearby',
                'Prepare your resume/job description (optional but helpful)',
                'Set aside 15-20 minutes for the full experience',
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 group">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-blue-900/30 via-cyan-900/20 to-blue-900/30 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-subsection mb-4">Ready to ace your next interview?</h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of candidates who have improved their interview skills with AI-powered practice
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-5 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-2xl shadow-blue-900/50"
            >
              Start Practice Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                // This could navigate to a demo or sample interview
                alert('Sample interview feature coming soon!');
              }}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-10 py-5 rounded-xl text-lg font-semibold transition-all border border-slate-700"
            >
              View Sample Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
