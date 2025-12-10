import { useState } from 'react';
import { ArrowLeft, ArrowRight, Briefcase } from 'lucide-react';
import type { InterviewConfig } from '../types';

interface Props {
  onBack: () => void;
  onStart: (config: InterviewConfig) => void;
  isLoading: boolean;
  error?: string | null;
}

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Consulting',
  'Marketing',
  'Sales',
  'Operations',
  'Other',
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior Level (6-10 years)' },
  { value: 'executive', label: 'Executive (10+ years)' },
];

const INTERVIEW_TYPES = [
  { value: 'behavioral', label: 'Behavioral (STAR questions)' },
  { value: 'technical', label: 'Technical/Role-specific' },
  { value: 'mixed', label: 'Mixed (Recommended)' },
];

export function SetupScreen({ onBack, onStart, isLoading, error }: Props) {
  const [config, setConfig] = useState<InterviewConfig>({
    role: '',
    industry: 'Technology',
    experienceLevel: 'mid',
    interviewType: 'mixed',
  });

  const isValid = config.role.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onStart(config);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold">Set Up Your Interview</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Role Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Role *
              </label>
              <input
                type="text"
                value={config.role}
                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                placeholder="e.g., Product Manager, Software Engineer, Data Analyst"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Industry Select */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Industry
              </label>
              <select
                value={config.industry}
                onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Experience Level
              </label>
              <select
                value={config.experienceLevel}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    experienceLevel: e.target.value as InterviewConfig['experienceLevel'],
                  })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Interview Type
              </label>
              <select
                value={config.interviewType}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    interviewType: e.target.value as InterviewConfig['interviewType'],
                  })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {INTERVIEW_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl text-lg font-semibold transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  Begin Interview
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-2">Tips for success:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Find a quiet, well-lit space</li>
            <li>Test your camera and microphone</li>
            <li>Treat it like a real interview!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
