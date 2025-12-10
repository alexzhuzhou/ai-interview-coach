import { useState, useCallback, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { SetupScreen } from './components/SetupScreen';
import { InterviewScreen } from './components/InterviewScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { useConversation } from './hooks/useConversation';
import type { AppScreen, InterviewConfig } from './types';

function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const {
    status,
    conversationId,
    conversationUrl,
    error,
    startConversation,
    endConversation,
    reset
  } = useConversation();

  const sessionStartRef = useRef<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);

  const handleStartSetup = useCallback(() => {
    setScreen('setup');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('landing');
    reset();
  }, [reset]);

  const handleStartInterview = useCallback(async (config: InterviewConfig) => {
    try {
      setInterviewConfig(config);
      await startConversation(config);
      sessionStartRef.current = new Date();
      setScreen('interview');
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  }, [startConversation]);

  const handleEndInterview = useCallback(() => {
    if (sessionStartRef.current) {
      const duration = Math.floor(
        (new Date().getTime() - sessionStartRef.current.getTime()) / 1000
      );
      setSessionDuration(duration);
    }
    endConversation();
    setScreen('feedback');
  }, [endConversation]);

  const handleRestart = useCallback(() => {
    reset();
    setScreen('setup');
  }, [reset]);

  const handleHome = useCallback(() => {
    reset();
    setScreen('landing');
  }, [reset]);

  switch (screen) {
    case 'landing':
      return <LandingPage onStart={handleStartSetup} />;

    case 'setup':
      return (
        <SetupScreen
          onBack={handleBack}
          onStart={handleStartInterview}
          isLoading={status === 'loading'}
          error={error}
        />
      );

    case 'interview':
      if (!conversationUrl) {
        return <SetupScreen onBack={handleBack} onStart={handleStartInterview} isLoading={true} error={error} />;
      }
      return (
        <InterviewScreen
          conversationUrl={conversationUrl}
          onEnd={handleEndInterview}
        />
      );

    case 'feedback':
      if (!conversationId || !interviewConfig) {
        // Fallback if no conversation data
        return (
          <FeedbackScreen
            duration={sessionDuration}
            conversationId=""
            interviewConfig={{
              role: 'Unknown',
              industry: 'Technology',
              experienceLevel: 'mid',
              interviewType: 'mixed',
            }}
            onRestart={handleRestart}
            onHome={handleHome}
          />
        );
      }
      return (
        <FeedbackScreen
          duration={sessionDuration}
          conversationId={conversationId}
          interviewConfig={interviewConfig}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      );

    default:
      return <LandingPage onStart={handleStartSetup} />;
  }
}

export default App;
