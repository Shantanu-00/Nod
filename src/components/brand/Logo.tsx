import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const scale = size === 'sm' ? 'scale-90' : size === 'lg' ? 'scale-110' : 'scale-100';

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-1.5 group cursor-pointer select-none ${scale} transition-transform`}
      aria-label="NOD Home - Accessible Community Platform"
    >
      <div className="flex items-center font-extrabold text-2xl sm:text-3xl text-brand-text tracking-tight">
        <span className="font-sans font-black">N</span>
        
        {/* O with Mascot Face */}
        <span className="relative mx-0.5 inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-text text-brand-surface shadow-xs">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-2 bg-brand-surface rounded-full inline-block" />
            <span className="w-1.5 h-2 bg-brand-surface rounded-full inline-block" />
          </span>
        </span>

        {/* D with acoustic wave above it */}
        <span className="relative font-sans font-black inline-block">
          D
          <svg 
            className="absolute -top-2.5 right-0 w-4 h-3 text-brand-green"
            viewBox="0 0 20 12" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          >
            <path d="M4 10C6 5 14 5 16 10" />
            <path d="M7 11C8 8 12 8 13 11" opacity="0.6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
