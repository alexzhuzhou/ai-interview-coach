import { FileText, ArrowLeft } from 'lucide-react';
import { DocumentManager } from './DocumentManager';

interface Props {
  onBack: () => void;
}

export function DocumentsScreen({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold">Document Management</h2>
              <p className="text-slate-400 text-sm mt-1">
                Upload and manage your resumes and job descriptions for personalized interviews
              </p>
            </div>
          </div>

          <DocumentManager onDocumentsSelected={() => {}} />
        </div>

        <div className="mt-6 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">How it works:</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>
                <strong className="text-slate-300">Resumes:</strong> Paste a shareable link to your resume
                (Google Drive, Dropbox, OneDrive, etc.). Make sure the link is set to "Anyone with the link can view".
                The AI interviewer will ask questions based on your experience.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>
                <strong className="text-slate-300">Job Descriptions:</strong> Paste a link to the job posting
                (LinkedIn, company website, Google Docs, etc.). The AI will tailor questions to assess your fit for the specific role.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>
                <strong className="text-slate-300">Processing:</strong> Documents may take a few minutes to process after you add them.
                Wait for the green checkmark ("ready" status) before starting your interview.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>
                <strong className="text-slate-300">During Setup:</strong> When starting a General Interview,
                you'll be able to select which documents to use from your saved list.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
