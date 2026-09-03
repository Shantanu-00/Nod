import React from 'react';
import Link from 'next/link';
import { AccessibleEditor } from '@/components/editor/AccessibleEditor';
import { ArrowLeft } from 'lucide-react';

export default function NewArticlePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="touch-target inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-muted hover:text-brand-lime transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>

      <AccessibleEditor />
    </div>
  );
}
