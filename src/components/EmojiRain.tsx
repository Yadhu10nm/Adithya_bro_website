import React, { useMemo } from 'react';

interface EmojiRainProps {
  type: 'joy' | 'sad';
  density?: number;
}

export const EmojiRain: React.FC<EmojiRainProps> = ({ type, density = 36 }) => {
  const emojis = useMemo(() => {
    return type === 'joy'
      ? ['💖', '💕', '🥰', '✨', '💍', '🌸', '🎉', '💌', '🌹', '👰', '🤵', '💗', '⭐']
      : ['🌧️', '💔', '🥺', '💧', '☁️', '🥀', '☔', '🫧'];
  }, [type]);

  const items = useMemo(() => {
    return Array.from({ length: density }).map((_, i) => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const left = Math.random() * 98; // percentage across screen
      const delay = Math.random() * 4; // seconds
      const duration = 3.5 + Math.random() * 3.5; // seconds
      const size = 20 + Math.random() * 26; // font size in px
      const sway = (Math.random() - 0.5) * 60; // horizontal drift px
      return { id: i, emoji, left, delay, duration, size, sway };
    });
  }, [emojis, density]);

  return (
    <div
      className={`emoji-rain-container ${type === 'joy' ? 'joy-rain' : 'sad-rain'}`}
      aria-hidden="true"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className="falling-emoji"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            ['--drift' as string]: `${item.sway}px`,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
};
