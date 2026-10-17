import React, { useEffect, useState, useRef } from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface BlackScreenIntroProps {
  greeting: string;
  message?: string;
  durationSeconds?: number;
  onComplete: () => void;
}

export const BlackScreenIntro: React.FC<BlackScreenIntroProps> = ({
  greeting = 'hey aparna!',
  message = 'i need to ask you something shuttuuuuuuuuu! 💕',
  durationSeconds = 5,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let timeLeft = durationSeconds;

    timerRef.current = window.setInterval(() => {
      timeLeft -= 1;
      setSecondsLeft(Math.max(0, timeLeft));

      if (timeLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Start smooth fade out
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 800); // 800ms fade transition
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durationSeconds, onComplete]);

  const handleInstantProceed = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  const progressPercentage = Math.max(0, Math.min(100, ((durationSeconds - secondsLeft) / durationSeconds) * 100));

  return (
    <div
      className={`black-intro-container ${isFadingOut ? 'fade-out' : ''}`}
      onClick={handleInstantProceed}
      role="button"
      tabIndex={0}
      aria-label="Click or wait 5 seconds to enter the proposal website"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleInstantProceed();
        }
      }}
    >
      {/* Background Starry Glow Particles */}
      <div className="black-intro-stars" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="intro-twinkle-star"
            style={{
              top: `${Math.random() * 96}%`,
              left: `${Math.random() * 96}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              fontSize: `${10 + Math.random() * 14}px`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Main Glowing Content */}
      <div className="black-intro-content">
        <div className="intro-heart-icon-wrapper animate-pulse">
          <Heart size={38} className="fill-rose-500 text-rose-400 drop-shadow-pink" />
        </div>

        {/* "hey aparna!" glowing in pink */}
        <h1 className="intro-greeting-text glow-pink-title">
          {greeting}
        </h1>

        {/* "i need to ask you something shuttuuuuuuuuu!" */}
        {message && (
          <p className="intro-message-text glow-pink-subtitle">
            {message}
          </p>
        )}

        {/* 5-second glowing countdown indicator */}
        <div className="intro-timer-container">
          <div className="intro-timer-track">
            <div
              className="intro-timer-bar"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="intro-timer-meta">
            <span className="flex items-center gap-1.5 text-xs text-pink-300/80">
              <Sparkles size={13} className="text-pink-400 animate-spin-slow" />
              <span>Opening our special story in {secondsLeft}s...</span>
            </span>
            <span className="text-xs text-pink-300/60 hover:text-pink-200 transition-colors">
              (Tap anywhere to enter ✨)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
