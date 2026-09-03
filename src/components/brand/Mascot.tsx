'use client';

import React from 'react';
import { useStore } from '@/lib/store/useStore';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showStatusBubble?: boolean;
}

export function Mascot({ size = 'md', showStatusBubble = false }: MascotProps) {
  const mascotMood = useStore((state) => state.mascotMood);
  const liveAnnouncement = useStore((state) => state.liveAnnouncement);

  const dimensions = {
    sm: { width: 36, height: 36 },
    md: { width: 64, height: 64 },
    lg: { width: 96, height: 96 },
    hero: { width: 140, height: 140 },
  }[size];

  const moodAnimation = {
    idle: 'hover:-translate-y-1 transition-transform duration-300',
    listening: 'scale-105 transition-all animate-pulse',
    nodding: 'animate-bounce transition-transform duration-500',
    completed: 'scale-110 rotate-3 transition-transform duration-300',
  }[mascotMood];

  const moodLabel = {
    idle: 'Ready to assist',
    listening: 'Listening to intent...',
    nodding: 'Executing action...',
    completed: 'Task completed!',
  }[mascotMood];

  return (
    <div className="relative inline-flex flex-col items-center select-none group">
      {/* Speech / Status Bubble */}
      {showStatusBubble && (
        <div 
          className="absolute -top-9 whitespace-nowrap px-3 py-1 bg-brand-surface border border-brand-border text-xs text-brand-text font-medium rounded-full shadow-md pointer-events-none transition-all duration-300 flex items-center gap-1.5 z-10"
          role="status"
        >
          <span className={`w-2 h-2 rounded-full ${mascotMood === 'nodding' ? 'bg-brand-green animate-ping' : 'bg-brand-green'}`} />
          <span>{liveAnnouncement || moodLabel}</span>
        </div>
      )}

      {/* Pure Vector SVG Mascot with Transparent Background */}
      <div 
        className={`relative flex items-center justify-center cursor-pointer ${moodAnimation}`}
        style={{ width: dimensions.width, height: dimensions.height }}
        title={`NOD Mascot: ${moodLabel}`}
      >
        <svg
          viewBox="0 0 160 160"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
        >
          <defs>
            {/* Clay Body Gradient */}
            <radialGradient id="clayHead" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#F4EFE6" />
              <stop offset="100%" stopColor="#DDD6C8" />
            </radialGradient>

            <radialGradient id="clayBody" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FAF7F2" />
              <stop offset="70%" stopColor="#E8E2D5" />
              <stop offset="100%" stopColor="#D2C9B8" />
            </radialGradient>

            <linearGradient id="antennaGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8CC63F" />
              <stop offset="100%" stopColor="#6E9924" />
            </linearGradient>

            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Ground Contact Shadow */}
          <ellipse cx="80" cy="148" rx="42" ry="8" fill="#1E2024" fillOpacity="0.08" />

          {/* --- Little Clay Legs / Body --- */}
          <g filter="url(#softShadow)">
            {/* Left Foot */}
            <ellipse cx="65" cy="140" rx="11" ry="8" fill="url(#clayBody)" />
            {/* Right Foot */}
            <ellipse cx="95" cy="140" rx="11" ry="8" fill="url(#clayBody)" />

            {/* Torso */}
            <path
              d="M52 105 C50 132, 60 142, 80 142 C100 142, 110 132, 108 105 C104 96, 56 96, 52 105 Z"
              fill="url(#clayBody)"
            />

            {/* Tiny Left Arm */}
            <ellipse cx="48" cy="116" rx="7" ry="12" transform="rotate(15 48 116)" fill="url(#clayBody)" />
            {/* Tiny Right Arm */}
            <ellipse cx="112" cy="116" rx="7" ry="12" transform="rotate(-15 112 116)" fill="url(#clayBody)" />
          </g>

          {/* --- Tilted Clay Head (The Signature NOD Tilt) --- */}
          <g transform="rotate(10 80 75)" filter="url(#softShadow)">
            {/* Round Head */}
            <circle cx="80" cy="68" r="44" fill="url(#clayHead)" />

            {/* Cute Dark Oval Pill Eyes */}
            {/* Left Eye */}
            <rect
              x="62"
              y="56"
              width="8.5"
              height="18"
              rx="4.25"
              fill="#191B1F"
              transform="rotate(-4 66 65)"
            />
            {/* Right Eye */}
            <rect
              x="88"
              y="60"
              width="8.5"
              height="18"
              rx="4.25"
              fill="#191B1F"
              transform="rotate(6 92 69)"
            />

            {/* Eye Catchlight reflections */}
            <circle cx="64.5" cy="59" r="2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="90.5" cy="63" r="2" fill="#FFFFFF" opacity="0.9" />

            {/* Soft Cheek Blush */}
            <circle cx="53" cy="74" r="6" fill="#F4A261" fillOpacity="0.22" />
            <circle cx="106" cy="78" r="6" fill="#F4A261" fillOpacity="0.22" />
          </g>

          {/* --- Green Acoustic Waves / Antenna (Above Head) --- */}
          <g className="animate-pulse">
            {/* Outer wave */}
            <path
              d="M108 22 C118 20, 130 26, 136 36"
              stroke="url(#antennaGreen)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Inner wave */}
            <path
              d="M102 32 C108 30, 116 34, 120 40"
              stroke="url(#antennaGreen)"
              strokeWidth="4.5"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
