'use client';

import React from 'react';
import { useWebMCP } from '@/lib/webmcp/useWebMCP';
import { useStore } from '@/lib/store/useStore';
import { AccessibilityDock } from '@/components/accessibility/AccessibilityDock';
import { WebMCPSimulator } from '@/components/accessibility/WebMCPSimulator';
import { PeekModal } from '@/components/feed/PeekModal';
import { Header } from '@/components/brand/Header';

export function ClientShell({ children }: { children: React.ReactNode }) {
  // Registers all canonical WebMCP tools in-browser with document.modelContext
  useWebMCP();

  const liveAnnouncement = useStore((state) => state.liveAnnouncement);

  return (
    <>
      {/* Screen Reader ARIA Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only" 
        id="a11y-announcer"
      >
        {liveAnnouncement}
      </div>

      <Header />

      <main id="main-content" className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Floating Accessibility Dock & In-Place Peek Modal */}
      <AccessibilityDock />
      <PeekModal />
      <WebMCPSimulator />
    </>
  );
}
