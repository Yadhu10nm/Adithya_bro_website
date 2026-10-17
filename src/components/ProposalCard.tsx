import React from 'react';
import { Heart, Sparkles, XCircle } from 'lucide-react';
import type { ProposalConfig } from '../types/config';

interface ProposalCardProps {
  proposal: ProposalConfig['proposal'];
  onYes: () => void;
  onNo: () => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onYes, onNo }) => {
  return (
    <div className="proposal-card animate-scale-up">
      {/* Top golden emblem */}
      <div className="proposal-emblem">
        <Sparkles size={16} className="text-amber-500 animate-spin-slow" />
        <span>{proposal.stepBadge}</span>
        <Sparkles size={16} className="text-amber-500 animate-spin-slow" />
      </div>

      <div className="proposal-content">
        <p className="proposal-lead">{proposal.title}</p>
        <h1 className="proposal-main-question">{proposal.mainQuestion}</h1>
        <p className="proposal-subtitle">{proposal.subtitle}</p>
      </div>

      {/* Decision Buttons */}
      <div className="proposal-decision-actions">
        <button
          type="button"
          onClick={onYes}
          className="yes-decision-btn"
          aria-label="Accept the proposal: Yes, a thousand times yes!"
        >
          <Heart size={22} className="heart-beat-icon fill-white" />
          <span className="yes-btn-text">{proposal.yesButtonText}</span>
        </button>

        <button
          type="button"
          onClick={onNo}
          className="no-decision-btn"
          aria-label="Decline: No, I'm sorry"
        >
          <XCircle size={18} className="opacity-80" />
          <span>{proposal.noButtonText}</span>
        </button>
      </div>
    </div>
  );
};
