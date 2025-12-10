import { ArrowRight, Video, MessageSquare, Award } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AI Interview Coach
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Practice your interview skills with a realistic AI interviewer.
            Get unlimited practice sessions tailored to your target role.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105"
          >
            Start Practice Interview
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <Video className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Face-to-Face Practice</h3>
            <p className="text-slate-400">
              Real-time video conversation with an AI interviewer who sees and responds to you naturally.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <MessageSquare className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tailored Questions</h3>
            <p className="text-slate-400">
              Questions customized to your industry, role, and experience level.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <Award className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Build Confidence</h3>
            <p className="text-slate-400">
              Practice as many times as you want in a judgment-free environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
