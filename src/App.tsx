import { useState, useRef, useEffect, useCallback } from 'react';
import { defaultProposalConfig } from './config/defaultConfig';
import type { ProposalConfig, CatPropType, CatExpressionType, QuestionOption } from './types/config';
import { Cat3DCanvas } from './components/Cat3DCanvas';
import { QuestionCard } from './components/QuestionCard';
import { ProposalCard } from './components/ProposalCard';
import { CelebrationView } from './components/CelebrationView';
import { NoResponseModal } from './components/NoResponseModal';
import { RomanticAudioPlayer } from './components/RomanticAudioPlayer';
import type { RomanticAudioPlayerRef } from './components/RomanticAudioPlayer';
import { EmojiRain } from './components/EmojiRain';
import { BlackScreenIntro } from './components/BlackScreenIntro';
import { Heart, Sparkles, FileText } from 'lucide-react';
import { saveAnswerToServer, downloadAnswersAsJson } from './utils/answerStorage';
import './App.css';

export function App() {
  const [config, setConfig] = useState<ProposalConfig>(defaultProposalConfig);
  const [showIntro, setShowIntro] = useState<boolean>(config.introScreen?.enabled ?? true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, QuestionOption>>({});
  const [decision, setDecision] = useState<'undecided' | 'yes' | 'no'>('undecided');
  const [isNoModalOpen, setIsNoModalOpen] = useState(false);
  const [rainType, setRainType] = useState<'none' | 'joy' | 'sad'>('none');

  const audioPlayerRef = useRef<RomanticAudioPlayerRef>(null);

  // Initialize Cat Prop & Expression based on initial question
  const [catProp, setCatProp] = useState<CatPropType>(
    config.questions[0]?.catProp || 'envelope'
  );
  const [catExpression, setCatExpression] = useState<CatExpressionType>(
    config.questions[0]?.catExpression || 'curious'
  );

  // Try fetching public/config.json in case user modified it directly
  useEffect(() => {
    fetch('/config.json')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('No public config found');
      })
      .then((data: ProposalConfig) => {
        if (data && data.questions && data.proposal) {
          setConfig(data);
        }
      })
      .catch(() => {
        // Fall back gracefully to bundled config
      });
  }, []);

  const totalQuestions = config.questions.length;
  const isProposalStep = currentStepIndex >= totalQuestions;
  const currentQuestion = config.questions[currentStepIndex];

  // Callback to update Cat prop & expression smoothly
  const handleCatChange = useCallback((prop: CatPropType, expr: CatExpressionType) => {
    setCatProp(prop);
    setCatExpression(expr);
  }, []);

  // When step changes, update cat prop/expression if in question phase or proposal phase
  useEffect(() => {
    if (decision !== 'undecided') return;

    if (isProposalStep) {
      setCatProp(config.proposal.catProp || 'ring_box');
      setCatExpression(config.proposal.catExpression || 'proposal_love');
    } else if (currentQuestion) {
      // Check if user already picked an option for this question
      const chosen = selectedAnswers[currentQuestion.id];
      if (chosen && chosen.nextProp) {
        setCatProp(chosen.nextProp);
        setCatExpression(chosen.nextExpression || currentQuestion.catExpression);
      } else {
        setCatProp(currentQuestion.catProp);
        setCatExpression(currentQuestion.catExpression);
      }
    }
  }, [currentStepIndex, isProposalStep, currentQuestion, selectedAnswers, decision, config.proposal]);

  // Handle Option Selection
  const handleSelectOption = (option: QuestionOption) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));

    // Save question and answer to project answers.json (and production server)
    saveAnswerToServer({
      partnerName: config.theme.partnerName,
      senderName: config.theme.senderName,
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answerId: option.id,
      answer: option.text,
    });
  };

  // Navigate to Next question or proposal
  const handleNextStep = () => {
    if (currentStepIndex < totalQuestions) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Navigate back
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Handle YES Click
  const handleYes = () => {
    setDecision('yes');
    setRainType('joy');
    handleCatChange(config.yesResponse.catProp || 'celebration', config.yesResponse.catExpression || 'celebrating');

    // Save final proposal decision to answers.json
    saveAnswerToServer({
      partnerName: config.theme.partnerName,
      senderName: config.theme.senderName,
      questionId: 'final_proposal',
      question: config.proposal.mainQuestion,
      answerId: 'yes',
      answer: config.proposal.yesButtonText,
      proposalDecision: 'yes',
    });
  };

  // Handle NO Click
  const handleNo = () => {
    // 1. Stop and reset the music immediately
    audioPlayerRef.current?.stopAndReset();

    // 2. Show falling sad emojis
    setRainType('sad');

    // 3. Update cat's expression to sad
    handleCatChange(config.noResponse.catProp || 'broken_heart', config.noResponse.catExpression || 'sad');

    // 4. Open modal popup with required message
    setIsNoModalOpen(true);

    // Save final proposal decision to answers.json
    saveAnswerToServer({
      partnerName: config.theme.partnerName,
      senderName: config.theme.senderName,
      questionId: 'final_proposal',
      question: config.proposal.mainQuestion,
      answerId: 'no',
      answer: config.proposal.noButtonText,
      proposalDecision: 'no',
    });
  };

  // Handle Black Screen Intro completion
  const handleIntroComplete = () => {
    setShowIntro(false);
    audioPlayerRef.current?.play();
  };

  // Restart Journey
  const handleRestart = () => {
    setIsNoModalOpen(false);
    setDecision('undecided');
    setRainType('none');
    setCurrentStepIndex(0);
    setSelectedAnswers({});
    if (config.questions[0]) {
      handleCatChange(config.questions[0].catProp, config.questions[0].catExpression);
    }
  };

  return (
    <div className="app-container">
      {/* Starting Black Screen Intro for Aparna */}
      {showIntro && config.introScreen?.enabled && (
        <BlackScreenIntro
          greeting={config.introScreen.greeting}
          message={config.introScreen.message}
          durationSeconds={config.introScreen.durationSeconds}
          onComplete={handleIntroComplete}
        />
      )}

      {/* Background Animated Orbs */}
      <div className="bg-ambient-layer" aria-hidden="true">
        <div className="floating-orb orb-pink" />
        <div className="floating-orb orb-blue" />
        <div className="floating-orb orb-lavender" />
      </div>

      {/* Falling Emoji Rain (Joy or Sad) */}
      {rainType !== 'none' && <EmojiRain type={rainType} />}

      {/* Header */}
      <header className="site-header">
        <div className="brand-badge">
          <Heart size={14} className="fill-rose-500 text-rose-500 animate-pulse" />
          <span>{config.theme.partnerName} & {config.theme.senderName}</span>
          <Sparkles size={14} className="text-amber-500" />
        </div>
        <h1 className="main-title">{config.theme.title}</h1>
      </header>

      {/* Interactive Main Stage */}
      <main className="main-stage">
        {/* 3D Cat Companion Stage */}
        <div className="cat-stage-wrapper">
          <Cat3DCanvas
            propType={catProp}
            expression={catExpression}
            furColor={config.catSettings?.furColor}
            bellyColor={config.catSettings?.bellyColor}
            blushColor={config.catSettings?.blushColor}
          />
          <div className="cat-stage-pedestal" />
        </div>

        {/* Dynamic Card Display */}
        {decision === 'yes' ? (
          <CelebrationView
            headline={config.yesResponse.headline}
            subheading={config.yesResponse.subheading}
            whatsAppNumber={config.yesResponse.whatsAppNumber}
            whatsAppMessage={config.yesResponse.whatsAppMessage}
            delaySeconds={config.yesResponse.celebrationDelaySeconds}
            onCatChange={handleCatChange}
          />
        ) : isProposalStep ? (
          <ProposalCard
            proposal={config.proposal}
            onYes={handleYes}
            onNo={handleNo}
          />
        ) : (
          currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentStepIndex}
              totalQuestions={totalQuestions}
              onSelectOption={handleSelectOption}
              onNext={handleNextStep}
              onPrev={currentStepIndex > 0 ? handlePrevStep : undefined}
              selectedOption={selectedAnswers[currentQuestion.id] || null}
              onCatChange={handleCatChange}
            />
          )
        )}
      </main>

      {/* Respectful Popup Modal for NO response */}
      <NoResponseModal
        isOpen={isNoModalOpen}
        message={config.noResponse.popupMessage}
        onClose={() => setIsNoModalOpen(false)}
        onRestart={handleRestart}
      />

      {/* Romantic Audio Player with Controls and Autoplay Handling */}
      <RomanticAudioPlayer
        ref={audioPlayerRef}
        src={config.music.filePath}
        songTitle={config.music.title}
        artist={config.music.artist}
        defaultVolume={config.music.defaultVolume}
        autoplayOnInteraction={config.music.autoplayOnFirstClick}
      />

      {/* Discreet Answers JSON export badge in footer */}
      <footer className="site-footer">
        <button
          type="button"
          onClick={() => downloadAnswersAsJson()}
          className="download-answers-badge"
          title="Download answer.json with all recorded question answers"
          aria-label="Download answer.json"
        >
          <FileText size={12} className="text-rose-500" />
          <span>./answer/answer.json</span>
        </button>
      </footer>
    </div>
  );
}

export default App;
