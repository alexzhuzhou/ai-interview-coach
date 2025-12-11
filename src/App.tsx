import { useState, useCallback, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { SetupScreen } from './components/SetupScreen';
import { InterviewScreen } from './components/InterviewScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { Navigation } from './components/Navigation';
import { ConversationHistory } from './components/ConversationHistory';
import { ConversationDetailComponent } from './components/ConversationDetail';
import { DocumentsScreen } from './components/DocumentsScreen';
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

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
    // Call endConversation (async) but don't wait for it
    // This ensures the API call to end the conversation happens in the background
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

  const handleNavigate = useCallback((newScreen: AppScreen) => {
    setScreen(newScreen);
  }, []);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    setScreen('conversation-detail');
  }, []);

  const handleBackToHistory = useCallback(() => {
    setSelectedConversationId(null);
    setScreen('history');
  }, []);

  const renderScreen = () => {
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
              category: 'general',
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

      case 'history':
        return <ConversationHistory onSelectConversation={handleSelectConversation} />;

      case 'conversation-detail':
        if (!selectedConversationId) {
          return <ConversationHistory onSelectConversation={handleSelectConversation} />;
        }
        return (
          <ConversationDetailComponent
            conversationId={selectedConversationId}
            onBack={handleBackToHistory}
          />
        );

      case 'documents':
        return <DocumentsScreen onBack={handleHome} />;

      default:
        return <LandingPage onStart={handleStartSetup} />;
    }
  };

  // Show navigation only on certain screens
  const showNavigation = screen === 'landing' || screen === 'history' || screen === 'conversation-detail' || screen === 'documents';

  return (
    <>
      {showNavigation && <Navigation currentScreen={screen} onNavigate={handleNavigate} />}
      {renderScreen()}
    </>
  );
}

export default App;
