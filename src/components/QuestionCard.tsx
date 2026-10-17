import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Heart, Sparkles } from 'lucide-react';
import type { QuestionItem, QuestionOption, CatPropType, CatExpressionType } from '../types/config';

interface QuestionCardProps {
  question: QuestionItem;
  currentIndex: number;
  totalQuestions: number;
  onSelectOption: (option: QuestionOption) => void;
  onNext: () => void;
  onPrev?: () => void;
  selectedOption: QuestionOption | null;
  onCatChange: (prop: CatPropType, expr: CatExpressionType) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onSelectOption,
  onNext,
  onPrev,
  selectedOption,
  onCatChange,
}) => {
  const [activeReaction, setActiveReaction] = useState<string | null>(
    selectedOption ? selectedOption.reactionMessage : null
  );

  const handleOptionClick = (option: QuestionOption) => {
    setActiveReaction(option.reactionMessage);
    onSelectOption(option);

    if (option.nextProp || option.nextExpression) {
      onCatChange(
        option.nextProp || question.catProp,
        option.nextExpression || question.catExpression
      );
    }
  };

  return (
    <div className="story-card animate-fade-in" key={question.id}>
      {/* Header bar with progress */}
      <div className="card-top-bar">
        {onPrev && currentIndex > 0 ? (
          <button
            type="button"
            onClick={onPrev}
            className="prev-btn"
            aria-label="Previous question"
            title="Go back"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
        ) : (
          <div className="w-12" />
        )}

        <div className="step-pill">
          <Sparkles size={13} className="text-rose-500" />
          <span>{question.stepBadge || `Chapter ${currentIndex + 1} of ${totalQuestions}`}</span>
        </div>

        <div className="progress-dots" aria-label={`Step ${currentIndex + 1} of ${totalQuestions}`}>
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <span
              key={idx}
              className={`progress-dot ${idx === currentIndex ? 'active' : idx < currentIndex ? 'completed' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Question Content */}
      <div className="card-content">
        <h2 className="question-title">{question.question}</h2>
        {question.subtitle && <p className="question-subtitle">{question.subtitle}</p>}

        {/* Options list */}
        <div className="options-grid" role="group" aria-label="Answer options">
          {question.options.map((option) => {
            const isSelected = selectedOption?.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={`option-btn ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className={`option-check ${isSelected ? 'checked' : ''}`}>
                    <Heart size={13} className={isSelected ? 'fill-current' : 'opacity-30'} />
                  </div>
                  <span className="option-text">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reaction message banner */}
        {activeReaction && (
          <div className="reaction-bubble animate-scale-up" role="status" aria-live="polite">
            <div className="reaction-avatar">🐱</div>
            <div className="reaction-content">
              <span className="reaction-tag">The Cat's Heart</span>
              <p className="reaction-text">“{activeReaction}”</p>
            </div>
          </div>
        )}

        {/* Continue Button */}
        {selectedOption && (
          <div className="card-actions animate-fade-in">
            <button
              type="button"
              onClick={onNext}
              className="continue-btn"
              aria-label="Continue to next chapter"
            >
              <span>Continue Our Journey</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
