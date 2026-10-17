import React, { useEffect, useRef } from 'react';
import { HeartHandshake, RotateCcw, X } from 'lucide-react';

interface NoResponseModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onRestart: () => void;
}

export const NoResponseModal: React.FC<NoResponseModalProps> = ({
  isOpen,
  message,
  onClose,
  onRestart,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-modal-title"
    >
      <div className="modal-card animate-scale-up" ref={modalRef}>
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="modal-icon-wrapper sad-glow">
          <HeartHandshake size={38} className="text-rose-500" />
        </div>

        <h3 id="no-modal-title" className="modal-title">
          With Love & Respect
        </h3>

        <div className="modal-message-box">
          <p className="modal-message-text">“{message}”</p>
        </div>

        <div className="modal-actions">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="modal-secondary-btn"
          >
            I Understand
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="modal-primary-btn"
          >
            <RotateCcw size={16} />
            <span>Revisit Our Story</span>
          </button>
        </div>
      </div>
    </div>
  );
};
