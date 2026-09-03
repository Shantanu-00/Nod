'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from './Logo';
import { PenSquare, Sparkles, Terminal } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';

export function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const setSimulatorOpen = useStore((state) => state.setSimulatorOpen);

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-bg/95 backdrop-blur-md border-b border-brand-border transition-colors">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-brand-green text-white font-bold rounded-full shadow-lg"
      >
        Skip to main content
      </a>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Clean Platform Brand */}
        <div className="flex items-center gap-6">
          <Logo />
        </div>

        {/* Right: Clean Social Platform Navigation & Avatar */}
        <div className="flex items-center gap-3">
          {/* Write / New Post Action */}
          <Link
            href="/articles/new"
            className="touch-target px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-brand-green hover:bg-brand-green-hover rounded-full transition-transform active:scale-95 flex items-center gap-2 shadow-xs"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write</span>
          </Link>

          {/* Top Bar Mascot Avatar with Black Background */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="touch-target w-9 h-9 rounded-full border border-brand-border hover:border-brand-green transition-all focus:outline-none bg-black flex items-center justify-center overflow-hidden p-1 shadow-xs"
              aria-label="User Profile & Assistant Options"
              title="NOD Companion"
            >
              <Image
                src="/brand/nood_mascot_with_marks.png"
                alt="NOD Mascot"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </button>

            {/* Profile / Agent Dropdown */}
            {profileOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                onClick={() => setProfileOpen(false)}
              >
                <div className="flex items-center gap-3 pb-3 border-b border-brand-border">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-black p-1 flex items-center justify-center">
                    <Image
                      src="/brand/nood_mascot_with_marks.png"
                      alt="NOD Mascot"
                      width={36}
                      height={36}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-brand-text">Your NOD Profile</div>
                    <div className="text-[11px] text-brand-muted">@community_reader</div>
                  </div>
                </div>

                <div className="py-2 space-y-1 text-xs">
                  <button
                    onClick={() => setSimulatorOpen(true)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-surface-elevated text-brand-text flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-brand-green" />
                      <span>WebMCP Agent DevTools</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-brand-green" />
                  </button>

                  <div className="px-3 py-1.5 text-[11px] text-brand-muted flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-green" />
                    <span>In-browser agent actuation active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
