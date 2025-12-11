import { useEffect, useRef, useState, useCallback } from 'react';
import DailyIframe, { type DailyCall } from '@daily-co/daily-js';
import { Phone, Clock, AlertCircle } from 'lucide-react';

interface Props {
  conversationUrl: string;
  userName: string;
  onEnd: () => void;
}

export function InterviewScreen({ conversationUrl, userName, onEnd }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle leaving the call
  const handleLeave = useCallback(async () => {
    if (callRef.current) {
      const callInstance = callRef.current;
      try {
        await callInstance.leave();
        callInstance.destroy();
      } catch (err) {
        console.error('Error leaving call:', err);
      } finally {
        callRef.current = null;
      }
    }
    onEnd();
  }, [onEnd]);

  // Initialize Daily call
  useEffect(() => {
    if (!containerRef.current || !conversationUrl) return;

    const initCall = async () => {
      try {
        const call = DailyIframe.createFrame(containerRef.current!, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '12px',
          },
          showLeaveButton: false,
          showFullscreenButton: true,
        });

        callRef.current = call;

        call.on('joined-meeting', () => {
          setIsConnected(true);
        });

        call.on('left-meeting', () => {
          handleLeave();
        });

        call.on('error', (e) => {
          console.error('Daily error:', e);
          setError('Connection error. Please try again.');
        });

        await call.join({
          url: conversationUrl,
          userName: userName
        });
      } catch (err) {
        console.error('Failed to join:', err);
        setError('Failed to connect to interview. Please try again.');
      }
    };

    initCall();

    return () => {
      if (callRef.current) {
        try {
          callRef.current.leave();
          callRef.current.destroy();
        } catch (err) {
          console.error('Cleanup error:', err);
        } finally {
          callRef.current = null;
        }
      }
    };
  }, [conversationUrl, userName, handleLeave]);

  // Warning at 8 minutes (480 seconds) - 2 min before max
  const showTimeWarning = elapsedTime >= 480 && elapsedTime < 600;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={onEnd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
              }`}
            />
            <span className="text-white font-medium">
              {isConnected ? 'Interview in Progress' : 'Connecting...'}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            <div
              className={`flex items-center gap-2 ${
                showTimeWarning ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              {showTimeWarning && (
                <span className="text-sm">(2 min remaining)</span>
              )}
            </div>

            {/* End Button */}
            <button
              onClick={handleLeave}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              End Interview
            </button>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl" style={{ height: 'calc(100vh - 200px)' }}>
          <div
            ref={containerRef}
            className="w-full h-full bg-slate-800 rounded-xl overflow-hidden"
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>

      {/* Tips Footer */}
      <div className="bg-slate-800/50 border-t border-slate-700 px-6 py-3">
        <p className="text-center text-sm text-slate-400">
          💡 Tip: Speak clearly and take your time. Use the STAR method for behavioral questions.
        </p>
      </div>
    </div>
  );
}
