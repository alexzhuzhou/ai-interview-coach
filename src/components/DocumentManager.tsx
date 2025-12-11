import { useState, useEffect } from 'react';
import { Link as LinkIcon, FileText, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { TavusDocument } from '../types';

interface DocumentManagerProps {
  onDocumentsSelected: (resumeId: string | null, jobDescId: string | null) => void;
}

export function DocumentManager({ onDocumentsSelected }: DocumentManagerProps) {
  const [resumes, setResumes] = useState<TavusDocument[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<TavusDocument[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJobDescId, setSelectedJobDescId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'resume' | 'job-description' | null>(null);

  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [showResumeInput, setShowResumeInput] = useState(false);

  const [jobDescUrl, setJobDescUrl] = useState('');
  const [jobDescName, setJobDescName] = useState('');
  const [showJobDescInput, setShowJobDescInput] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Notify parent of selection changes
  useEffect(() => {
    onDocumentsSelected(selectedResumeId, selectedJobDescId);
  }, [selectedResumeId, selectedJobDescId, onDocumentsSelected]);

  const fetchDocuments = async () => {
    try {
      // Fetch resumes
      const resumeRes = await fetch('/api/list-documents?tag=resume');
      if (resumeRes.ok) {
        const resumeData = await resumeRes.json();
        const resumeDocs = resumeData.documents || [];
        setResumes(Array.isArray(resumeDocs) ? resumeDocs : []);
      } else {
        console.warn('Failed to fetch resumes:', resumeRes.statusText);
        setResumes([]);
      }

      // Fetch job descriptions
      const jdRes = await fetch('/api/list-documents?tag=job-description');
      if (jdRes.ok) {
        const jdData = await jdRes.json();
        const jdDocs = jdData.documents || [];
        setJobDescriptions(Array.isArray(jdDocs) ? jdDocs : []);
      } else {
        console.warn('Failed to fetch job descriptions:', jdRes.statusText);
        setJobDescriptions([]);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents. Make sure the Tavus API endpoint is correct.');
      setResumes([]);
      setJobDescriptions([]);
    }
  };

  const handleResumeSubmit = async () => {
    if (!resumeUrl.trim()) {
      setError('Resume URL cannot be empty');
      return;
    }
    if (!resumeName.trim()) {
      setError('Resume name cannot be empty');
      return;
    }

    setUploading(true);
    setUploadType('resume');
    setError(null);

    try {
      const response = await fetch('/api/upload-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentUrl: resumeUrl,
          documentName: resumeName,
          tags: ['resume'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      // Refresh documents list
      await fetchDocuments();

      // Auto-select the newly uploaded document
      setSelectedResumeId(result.document_id);

      // Clear form
      setResumeUrl('');
      setResumeName('');
      setShowResumeInput(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadType(null);
    }
  };

  const handleJobDescSubmit = async () => {
    if (!jobDescUrl.trim()) {
      setError('Job description URL cannot be empty');
      return;
    }
    if (!jobDescName.trim()) {
      setError('Job description name cannot be empty');
      return;
    }

    setUploading(true);
    setUploadType('job-description');
    setError(null);

    try {
      const response = await fetch('/api/upload-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentUrl: jobDescUrl,
          documentName: jobDescName,
          tags: ['job-description'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      // Refresh documents list
      await fetchDocuments();

      // Auto-select the newly uploaded document
      setSelectedJobDescId(result.document_id);

      // Clear form
      setJobDescUrl('');
      setJobDescName('');
      setShowJobDescInput(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadType(null);
    }
  };

  const handleDelete = async (documentId: string, type: 'resume' | 'job-description') => {
    try {
      const response = await fetch(`/api/delete-document?document_id=${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Clear selection if deleted document was selected
      if (type === 'resume' && selectedResumeId === documentId) {
        setSelectedResumeId(null);
      } else if (type === 'job-description' && selectedJobDescId === documentId) {
        setSelectedJobDescId(null);
      }

      // Refresh documents list
      await fetchDocuments();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderDocumentList = (
    documents: TavusDocument[],
    type: 'resume' | 'job-description',
    selectedId: string | null,
    onSelect: (id: string) => void
  ) => (
    <div className="space-y-2 mt-3">
      {documents.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          No {type === 'resume' ? 'resumes' : 'job descriptions'} added yet
        </p>
      ) : (
        documents.map((doc, index) => (
          <div
            key={doc.document_id || `doc-${index}`}
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
              selectedId === doc.document_id
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                : 'border-slate-600 bg-slate-700/20 hover:border-slate-500 hover:bg-slate-700/30'
            }`}
            onClick={() => onSelect(doc.document_id)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className={`w-5 h-5 flex-shrink-0 ${
                selectedId === doc.document_id ? 'text-blue-400' : 'text-slate-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{doc.document_name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              {getStatusIcon(doc.status)}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(doc.document_id, type);
              }}
              className="ml-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300">
          <p className="font-semibold mb-1 text-red-200">⚠️ Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Resume Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Resume</h3>

        {!showResumeInput ? (
          <button
            onClick={() => setShowResumeInput(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/90 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/50"
            disabled={uploading}
          >
            <LinkIcon className="w-5 h-5" />
            <span className="font-medium">Add Resume Link</span>
          </button>
        ) : (
          <div className="space-y-3 mb-4 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Resume Name
              </label>
              <input
                type="text"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="e.g., My Resume 2024"
                className="w-full p-3 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Resume URL
              </label>
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/file/..."
                className="w-full p-3 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                💡 Make sure the link is set to "Anyone with the link can view"
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleResumeSubmit}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || !resumeUrl.trim() || !resumeName.trim()}
              >
                {uploading && uploadType === 'resume' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  'Add Resume'
                )}
              </button>
              <button
                onClick={() => {
                  setShowResumeInput(false);
                  setResumeUrl('');
                  setResumeName('');
                }}
                className="px-4 py-2.5 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-all font-medium"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {renderDocumentList(resumes, 'resume', selectedResumeId, setSelectedResumeId)}
      </div>

      {/* Job Description Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Job Description</h3>

        {!showJobDescInput ? (
          <button
            onClick={() => setShowJobDescInput(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600/90 text-white rounded-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-green-500/50"
            disabled={uploading}
          >
            <LinkIcon className="w-5 h-5" />
            <span className="font-medium">Add Job Description Link</span>
          </button>
        ) : (
          <div className="space-y-3 mb-4 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Job Description Name
              </label>
              <input
                type="text"
                value={jobDescName}
                onChange={(e) => setJobDescName(e.target.value)}
                placeholder="e.g., Software Engineer - Google"
                className="w-full p-3 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Job Description URL
              </label>
              <input
                type="url"
                value={jobDescUrl}
                onChange={(e) => setJobDescUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
                className="w-full p-3 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={uploading}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                💡 Paste a link to the job posting, LinkedIn, or a Google Docs with the JD
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleJobDescSubmit}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || !jobDescUrl.trim() || !jobDescName.trim()}
              >
                {uploading && uploadType === 'job-description' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  'Add Job Description'
                )}
              </button>
              <button
                onClick={() => {
                  setShowJobDescInput(false);
                  setJobDescUrl('');
                  setJobDescName('');
                }}
                className="px-4 py-2.5 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-all font-medium"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {renderDocumentList(jobDescriptions, 'job-description', selectedJobDescId, setSelectedJobDescId)}
      </div>
    </div>
  );
}
