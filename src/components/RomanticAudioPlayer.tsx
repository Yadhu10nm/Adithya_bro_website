import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

export interface RomanticAudioPlayerRef {
  play: () => Promise<void>;
  pause: () => void;
  stopAndReset: () => void;
  isPlaying: boolean;
}

interface RomanticAudioPlayerProps {
  src: string;
  songTitle?: string;
  artist?: string;
  defaultVolume?: number;
  autoplayOnInteraction?: boolean;
}

export const RomanticAudioPlayer = forwardRef<RomanticAudioPlayerRef, RomanticAudioPlayerProps>(
  (
    {
      src,
      songTitle = 'Romantic Melody',
      artist = 'For You',
      defaultVolume = 0.65,
      autoplayOnInteraction = true,
    },
    ref
  ) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(defaultVolume);
    const [isMuted, setIsMuted] = useState(false);
    const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
    const hasInteractedRef = useRef(false);

    // Stop and reset audio helper
    const stopAndReset = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }, []);

    const playAudio = useCallback(async () => {
      if (!audioRef.current) return;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setShowAutoplayPrompt(false);
      } catch (err) {
        // Autoplay blocked by browser policy
        console.warn('Autoplay restricted by browser until user gesture:', err);
        setShowAutoplayPrompt(true);
        setIsPlaying(false);
      }
    }, []);

    const pauseAudio = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }, []);

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        play: playAudio,
        pause: pauseAudio,
        stopAndReset,
        isPlaying,
      }),
      [playAudio, pauseAudio, stopAndReset, isPlaying]
    );

    // Setup initial volume
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
      }
    }, [volume, isMuted]);

    // Handle first user interaction to start audio
    useEffect(() => {
      if (!autoplayOnInteraction) return;

      const handleFirstInteraction = () => {
        if (!hasInteractedRef.current) {
          hasInteractedRef.current = true;
          playAudio();
          // Remove listener once interacted
          window.removeEventListener('click', handleFirstInteraction);
          window.removeEventListener('keydown', handleFirstInteraction);
          window.removeEventListener('touchstart', handleFirstInteraction);
        }
      };

      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);

      return () => {
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };
    }, [autoplayOnInteraction, playAudio]);

    const togglePlay = () => {
      hasInteractedRef.current = true;
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    };

    const toggleMute = () => {
      if (audioRef.current) {
        if (isMuted) {
          audioRef.current.volume = volume;
          setIsMuted(false);
        } else {
          audioRef.current.volume = 0;
          setIsMuted(true);
        }
      }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setVolume(val);
      if (audioRef.current) {
        audioRef.current.volume = val;
      }
      if (val > 0 && isMuted) {
        setIsMuted(false);
      }
    };

    return (
      <>
        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={src}
          loop
          preload="auto"
          onEnded={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
          }}
          onError={(e) => {
            console.warn('Audio element error, falling back if needed:', e);
          }}
        />

        {/* Autoplay blocked gentle prompt */}
        {showAutoplayPrompt && !isPlaying && (
          <aside
            role="status"
            aria-live="polite"
            className="autoplay-banner animate-fade-in"
            onClick={togglePlay}
          >
            <div className="autoplay-content">
              <span className="pulse-dot" />
              <span>🎵 Tap here to start romantic music 💕</span>
            </div>
          </aside>
        )}

        {/* Floating audio control pill */}
        <aside
          role="region"
          aria-label="Romantic Music Controls"
          className="audio-pill-container"
        >
          <div className="audio-pill">
            <button
              type="button"
              onClick={togglePlay}
              className={`play-btn ${isPlaying ? 'is-playing' : ''}`}
              aria-label={isPlaying ? 'Pause romantic music' : 'Play romantic music'}
              title={isPlaying ? 'Pause music' : 'Play music'}
            >
              {isPlaying ? <Pause size={17} className="icon-pulse" /> : <Play size={17} className="ml-0.5" />}
            </button>

            <div className="song-meta">
              <div className="flex items-center gap-1.5">
                <Music size={13} className="text-rose-500 animate-spin-slow" />
                <span className="song-title" title={`${songTitle} - ${artist}`}>
                  {songTitle}
                </span>
              </div>
              <div className="soundwave-bar">
                <span className={`bar b1 ${isPlaying ? 'anim' : ''}`} />
                <span className={`bar b2 ${isPlaying ? 'anim' : ''}`} />
                <span className={`bar b3 ${isPlaying ? 'anim' : ''}`} />
                <span className={`bar b4 ${isPlaying ? 'anim' : ''}`} />
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMute}
              className="mute-btn"
              aria-label={isMuted ? 'Unmute music' : 'Mute music'}
              title={isMuted ? 'Unmute music' : 'Mute music'}
            >
              {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <div className="volume-slider-wrapper">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Music volume"
                className="volume-slider"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>
          </div>
        </aside>
      </>
    );
  }
);

RomanticAudioPlayer.displayName = 'RomanticAudioPlayer';
