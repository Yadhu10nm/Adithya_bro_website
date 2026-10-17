import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Send, Heart, Sparkles, CheckCircle, ExternalLink } from 'lucide-react';
import type { CatPropType, CatExpressionType } from '../types/config';

interface CelebrationViewProps {
  headline: string;
  subheading: string;
  whatsAppNumber: string;
  whatsAppMessage: string;
  delaySeconds: number;
  onCatChange: (prop: CatPropType, expr: CatExpressionType) => void;
}

export const CelebrationView: React.FC<CelebrationViewProps> = ({
  headline,
  subheading,
  whatsAppNumber,
  whatsAppMessage,
  delaySeconds = 5,
  onCatChange,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(delaySeconds);
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Clean phone number (digits only) and build WhatsApp URL for Adithya (+91 83018 17182)
  const targetNumber =
    whatsAppNumber && !whatsAppNumber.includes('9876543210')
      ? whatsAppNumber
      : '918301817182';
  const cleanPhone = targetNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(whatsAppMessage || 'I love you');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  // Trigger celebration confetti bursts
  useEffect(() => {
    onCatChange('celebration', 'celebrating');

    // Trigger initial confetti cannon
    const fireCelebrationConfetti = () => {
      // Rose and gold heart explosion
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF1493', '#FF69B4', '#FFD700', '#FF4500', '#38BDF8'],
      });

      // Side cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: ['#f43f5e', '#ec4899', '#f59e0b'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: ['#38bdf8', '#818cf8', '#f43f5e'],
        });
      }, 400);

      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#FF69B4', '#FFB6C1', '#FCD34D', '#A7F3D0'],
        });
      }, 1200);
    };

    fireCelebrationConfetti();
    const confettiInterval = setInterval(fireCelebrationConfetti, 3500);

    return () => clearInterval(confettiInterval);
  }, [onCatChange]);

  // Five-second countdown timer for WhatsApp
  useEffect(() => {
    let currentCountdown = delaySeconds;

    timerRef.current = window.setInterval(() => {
      currentCountdown -= 1;
      setSecondsLeft(Math.max(0, currentCountdown));

      if (currentCountdown <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setHasOpenedWhatsApp(true);
        // Attempt to open WhatsApp in new tab/app
        try {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        } catch (e) {
          console.warn('Popup blocked by browser, user can tap manual button:', e);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [delaySeconds, whatsappUrl]);

  const handleManualOpen = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setHasOpenedWhatsApp(true);
  };

  const progressPercentage = Math.max(0, Math.min(100, ((delaySeconds - secondsLeft) / delaySeconds) * 100));

  return (
    <div className="celebration-card animate-scale-up">
      {/* Top celebratory badge */}
      <div className="celebration-badge">
        <Sparkles size={16} className="text-amber-400 animate-spin-slow" />
        <span>A Beautiful Forever</span>
        <Sparkles size={16} className="text-amber-400 animate-spin-slow" />
      </div>

      <h1 className="celebration-title">{headline}</h1>
      <p className="celebration-subheading">{subheading}</p>

      {/* Love milestone card */}
      <div className="love-memo-box">
        <div className="love-memo-header">
          <Heart size={20} className="text-rose-500 fill-rose-500 animate-pulse" />
          <span className="font-semibold text-rose-800">Your Answer Has Been Sealed</span>
        </div>
        <p className="love-memo-text">
          “From this day forward, every tomorrow is ours to share with love, laughter, and endless warmth.”
        </p>
      </div>

      {/* WhatsApp Redirect Countdown Banner */}
      <div className="whatsapp-countdown-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-emerald-600 animate-bounce" />
            <span className="text-sm font-semibold text-slate-800">
              {secondsLeft > 0
                ? `Opening WhatsApp in ${secondsLeft} second${secondsLeft === 1 ? '' : 's'}...`
                : 'WhatsApp launched! 💬'}
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
            Message: “{whatsAppMessage}”
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="countdown-progress-track"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="countdown-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="text-xs text-slate-600 mt-2 text-center">
          Sending to <strong>+{cleanPhone}</strong>: “{whatsAppMessage}”
        </p>
      </div>

      {/* Direct WhatsApp Action Button */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleManualOpen}
          className="whatsapp-action-btn"
          aria-label="Open WhatsApp to send confirmation message"
        >
          <Send size={20} />
          <span>
            {hasOpenedWhatsApp ? 'Re-open WhatsApp Chat' : 'Open WhatsApp Now 💬'}
          </span>
          <ExternalLink size={16} className="opacity-80" />
        </button>

        {hasOpenedWhatsApp && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium animate-fade-in">
            <CheckCircle size={14} />
            <span>If WhatsApp didn't open automatically, click the button above!</span>
          </div>
        )}
      </div>
    </div>
  );
};
