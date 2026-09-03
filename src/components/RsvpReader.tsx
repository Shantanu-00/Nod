'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';
import { splitWordOrp, calculateWordDelay } from '@/lib/utils/rsvp';
import { 
  Play, 
  Pause, 
  X, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Eye, 
  Zap, 
  Sparkles,
  Volume2
} from 'lucide-react';

export function RsvpReader() {
  const isOpen = useStore((state) => state.focalReader.isOpen);
  const isPlaying = useStore((state) => state.focalReader.isPlaying);
  const words = useStore((state) => state.focalReader.words);
  const currentIndex = useStore((state) => state.focalReader.currentIndex);
  const wpm = useStore((state) => state.focalReader.wpm);
  
  const closeReader = useStore((state) => state.closeFocalReader);
  const playReader = useStore((state) => state.playFocalReader);
  const pauseReader = useStore((state) => state.pauseFocalReader);
  const togglePlay = useStore((state) => state.toggleFocalReaderPlay);
  const setSpeed = useStore((state) => state.setFocalReaderSpeed);
  const setIndex = useStore((state) => state.setFocalReaderIndex);
  const stepIndex = useStore((state) => state.stepFocalReader);

  const containerRef = useRef<HTMLDivElement>(null);

  const totalWords = words.length;
  const isComplete = totalWords > 0 && currentIndex >= totalWords - 1;
  const currentWord = words[currentIndex] || '';
  const { leftSegment, orpChar, rightSegment } = splitWordOrp(currentWord);

  const percent = totalWords > 0 
    ? Math.min(100, Math.round(((currentIndex + 1) / totalWords) * 100))
    : 0;

  // Precision Pacing & Punctuation Delay Engine
  useEffect(() => {
    if (!isOpen || !isPlaying || totalWords === 0) return;

    if (currentIndex >= totalWords) {
      pauseReader();
      return;
    }

    const delay = calculateWordDelay(words[currentIndex], wpm);

    const timer = setTimeout(() => {
      if (currentIndex < totalWords - 1) {
        setIndex(currentIndex + 1);
      } else {
        pauseReader();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentIndex, totalWords, words, wpm, pauseReader, setIndex]);

  // Keyboard Shortcuts Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    // Prevent default scrolling for space and arrows when reader is open
    if (['Space', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case ' ':
      case 'Space':
        togglePlay();
        break;
      case 'Escape':
        closeReader();
        break;
      case 'ArrowUp':
        setSpeed(wpm + 25);
        break;
      case 'ArrowDown':
        setSpeed(Math.max(50, wpm - 25));
        break;
      case 'ArrowLeft':
        stepIndex(-10);
        break;
      case 'ArrowRight':
        stepIndex(10);
        break;
      default:
        break;
    }
  }, [isOpen, togglePlay, closeReader, setSpeed, stepIndex, wpm]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleRestart = () => {
    setIndex(0);
    playReader();
  };

  const handleSpeedPreset = (speed: number) => {
    setSpeed(speed);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Zero-Saccade RSVP Focal Reader"
    >
      {/* Background click to dismiss */}
      <div 
        className="fixed inset-0 cursor-pointer"
        onClick={closeReader}
        title="Click outside to exit reader"
      />

      {/* Main Reader Stage */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl bg-brand-dark border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white z-10 overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-green/20 border border-brand-green/40 flex items-center justify-center text-brand-green">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  Zero-Saccade Focal Reader
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-green/20 text-brand-green border border-brand-green/30">
                  RSVP + ORP
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Fixed-gaze optical anchor to eliminate saccadic eye fatigue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeReader}
              className="touch-target p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close reader (Esc)"
              title="Close reader (Escape)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optical Presentation Chamber */}
        <div className="relative bg-black/60 rounded-2xl border border-white/10 p-6 sm:p-10 flex flex-col items-center justify-center min-h-[180px] shadow-inner overflow-hidden">
          {/* Subtle horizontal alignment guide line */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-white/5 pointer-events-none" />

          {/* Center Vertical Crosshair / Optical Alignment Notches */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="w-0.5 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
          <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="w-0.5 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>

          {totalWords === 0 ? (
            <div className="text-neutral-500 text-sm font-medium">
              No article text loaded.
            </div>
          ) : (
            /* Word Display: Monospace tabular width to guarantee pixel-stable focal alignment */
            <div 
              className="w-full flex items-center justify-center font-mono text-3xl sm:text-5xl md:text-6xl font-bold tracking-normal h-24 select-none relative"
              aria-live="off"
            >
              {/* Left segment (Right-aligned, leading directly into the ORP letter) */}
              <div className="flex-1 text-right text-neutral-100 truncate pr-[0.05ch]">
                {leftSegment}
              </div>

              {/* Central ORP Character (Fixed width, laser-centered on crosshairs) */}
              <div className="w-[1.2ch] text-center text-red-500 font-black relative flex items-center justify-center shrink-0">
                <span className="relative z-10 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                  {orpChar}
                </span>
              </div>

              {/* Right segment (Left-aligned, flowing directly out of the ORP letter) */}
              <div className="flex-1 text-left text-neutral-100 truncate pl-[0.05ch]">
                {rightSegment}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Scrubber & Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>
              Word <strong className="text-white">{Math.min(currentIndex + 1, totalWords)}</strong> of <strong className="text-white">{totalWords}</strong>
            </span>
            <span className="text-brand-green font-bold">
              {percent}% Completed
            </span>
          </div>

          {/* Interactive Scrubbing Slider */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalWords - 1)}
              value={currentIndex}
              onChange={(e) => setIndex(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/40"
              aria-label="Seek position in article"
            />
          </div>
        </div>

        {/* Primary Controls & Speed Adjustment */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {/* Step Back 10 */}
            <button
              onClick={() => stepIndex(-10)}
              disabled={currentIndex <= 0}
              className="touch-target p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Jump back 10 words (←)"
              aria-label="Jump back 10 words"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={isComplete ? handleRestart : togglePlay}
              className="touch-target px-6 py-2.5 rounded-full font-bold text-sm bg-brand-green hover:bg-brand-green-hover text-white flex items-center gap-2 shadow-lg shadow-brand-green/20 active:scale-95 transition-all"
              aria-label={isComplete ? 'Restart playback' : isPlaying ? 'Pause reading (Space)' : 'Start reading (Space)'}
              title="Spacebar to toggle"
            >
              {isComplete ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start</span>
                </>
              )}
            </button>

            {/* Step Forward 10 */}
            <button
              onClick={() => stepIndex(10)}
              disabled={currentIndex >= totalWords - 1}
              className="touch-target p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Jump forward 10 words (→)"
              aria-label="Jump forward 10 words"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Restart from beginning */}
            <button
              onClick={handleRestart}
              className="touch-target p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-colors"
              title="Restart from beginning"
              aria-label="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed (WPM) Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/10 rounded-full px-3 py-1">
              <button
                onClick={() => setSpeed(Math.max(50, wpm - 25))}
                className="touch-target p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Decrease speed by 25 WPM (↓)"
                aria-label="Decrease reading speed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-2 font-mono text-xs font-bold text-neutral-200 min-w-[75px] justify-center">
                <Zap className="w-3.5 h-3.5 text-brand-green" />
                <span>{wpm} WPM</span>
              </div>

              <button
                onClick={() => setSpeed(Math.min(1000, wpm + 25))}
                className="touch-target p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Increase speed by 25 WPM (↑)"
                aria-label="Increase reading speed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speed Presets */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono">
              {[200, 250, 325, 400].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSpeedPreset(preset)}
                  className={`px-2 py-1 rounded-md border transition-colors ${
                    wpm === preset
                      ? 'bg-brand-green/20 border-brand-green text-brand-green font-bold'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard Legend Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5 text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-neutral-300">Space</kbd> Play/Pause</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-neutral-300">↑/↓</kbd> ±25 WPM</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-neutral-300">←/→</kbd> ±10 Words</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-neutral-300">Esc</kbd> Exit</span>
          </div>
          <span className="text-neutral-400 hidden md:inline">
            Punctuation pauses: 1.5× comma, 2.2× sentence ends
          </span>
        </div>
      </div>
    </div>
  );
}
