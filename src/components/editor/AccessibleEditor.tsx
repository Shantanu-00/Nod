'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { calculateReadingMetrics } from '@/lib/utils/a11y-metrics';
import { Mic, MicOff, Sparkles, Send, User } from 'lucide-react';
import { BinaryReviewModal } from './BinaryReviewModal';

export function AccessibleEditor() {
  const router = useRouter();
  const announce = useStore((state) => state.announce);
  const setMascotMood = useStore((state) => state.setMascotMood);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [handle, setHandle] = useState('@curator');
  const [authorName, setAuthorName] = useState('Alex M.');
  const [category, setCategory] = useState<'strategies' | 'stories' | 'technology' | 'discussion'>('strategies');
  const [tagsInput, setTagsInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [proposedText, setProposedText] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const savedTitle = sessionStorage.getItem('nod_draft_title');
    const savedContent = sessionStorage.getItem('nod_draft_content');
    if (savedTitle) setTitle(savedTitle);
    if (savedContent) setContent(savedContent);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('nod_draft_title', title);
    sessionStorage.setItem('nod_draft_content', content);
  }, [title, content]);

  const metrics = calculateReadingMetrics(content || 'Start typing...');

  const toggleSpeechRecognition = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      announce('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        announce('Listening for speech...');
        setMascotMood('listening');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setMascotMood('idle');
      };

      recognition.onend = () => {
        setIsRecording(false);
        setMascotMood('idle');
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleExpandIntent = async () => {
    if (!content.trim()) return;

    setIsExpanding(true);
    setMascotMood('nodding');
    announce('Expanding shorthand thoughts into structured sentences...');

    try {
      const lines = content.split('\n').filter(Boolean);
      const expandedLines = lines.map((line) => {
        const clean = line.replace(/^[-*•]\s*/, '').trim();
        const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
        return cap.endsWith('.') ? cap : `${cap}.`;
      });

      const proposal = expandedLines.join(' ');
      setProposedText(proposal);
    } finally {
      setIsExpanding(false);
      setMascotMood('idle');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPublishing(true);
    announce('Publishing your article...');
    setMascotMood('nodding');

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          tags,
          author: {
            id: 'user-active',
            name: authorName.trim() || 'Community Contributor',
            handle: formattedHandle,
            badge: 'Author',
          },
        }),
      });

      if (res.ok) {
        sessionStorage.removeItem('nod_draft_title');
        sessionStorage.removeItem('nod_draft_content');
        announce('Story published successfully!');
        router.push('/');
      }
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsPublishing(false);
      setMascotMood('idle');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Editorial Guidance */}
      <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-green" />
          <span className="text-brand-text font-bold">
            Assisted Writing Studio (Low-Bandwidth Shorthand Engine)
          </span>
        </div>
        <span className="text-brand-muted hidden sm:inline">
          Type rough bullet points or fragments, and NOD expands them cleanly.
        </span>
      </div>

      <form onSubmit={handlePublish} className="space-y-4">
        {/* Author Handle & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              Your Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Rivera"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs sm:text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-green"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              Your Handle / Pseudonym
            </label>
            <input
              type="text"
              required
              placeholder="e.g. @jordan_r"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs sm:text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="article-title" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
            Story Headline
          </label>
          <input
            id="article-title"
            type="text"
            required
            placeholder="e.g. How I organize tasks with ADHD-friendly spatial cues..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-brand-surface border border-brand-border focus:border-brand-green rounded-2xl text-base sm:text-lg font-bold text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-green/20 shadow-xs"
          />
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider mr-1">
            Topic:
          </span>
          {(['strategies', 'stories', 'technology', 'discussion'] as const).map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`touch-target px-3.5 py-1 text-xs rounded-full border transition-all ${
                category === cat
                  ? 'border-brand-green bg-brand-green text-white font-bold shadow-xs'
                  : 'border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isRecording
                  ? 'border-rose-500 bg-rose-50 text-rose-700 animate-pulse'
                  : 'border-brand-border bg-brand-surface text-brand-text hover:bg-brand-surface-elevated'
              }`}
              title="Dictate speech to text"
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-brand-green" />}
              <span>{isRecording ? 'Listening...' : 'Dictate'}</span>
            </button>

            <button
              type="button"
              onClick={handleExpandIntent}
              disabled={isExpanding || !content.trim()}
              className="touch-target px-4 py-1.5 rounded-full text-xs font-bold bg-brand-green-muted hover:bg-brand-green hover:text-white text-brand-green-text border border-brand-green/20 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Expand telegraphic shorthand notes into fluent paragraphs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExpanding ? 'Expanding...' : 'Expand Notes with NOD'}</span>
            </button>
          </div>

          <div className="text-xs text-brand-muted flex items-center gap-2">
            <span>Clarity:</span>
            <span className="font-semibold text-brand-green">{metrics.clarityGrade}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div>
          <textarea
            required
            rows={10}
            placeholder="Type your ideas here. You can write in fragments, bullet points, or stream-of-consciousness..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 sm:p-5 bg-brand-surface border border-brand-border focus:border-brand-green rounded-2xl text-base text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-green/20 leading-relaxed font-sans shadow-xs"
          />
        </div>

        {/* Tags input */}
        <div>
          <label htmlFor="tags-input" className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
            Tags (comma-separated)
          </label>
          <input
            id="tags-input"
            type="text"
            placeholder="adhd, focus, reading, accommodations"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-green shadow-xs"
          />
        </div>

        {/* Submit & Publish CTA */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isPublishing || !title.trim() || !content.trim()}
            className="touch-target px-7 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-extrabold text-sm sm:text-base rounded-full flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-40"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Story'}</span>
          </button>
        </div>
      </form>

      {/* Binary Review Modal */}
      {proposedText && (
        <BinaryReviewModal
          original={content}
          proposal={proposedText}
          onAccept={(accepted) => {
            setContent(accepted);
            setProposedText(null);
            announce('Accepted agent proposal.');
          }}
          onReject={() => {
            setProposedText(null);
            announce('Rejected proposal and kept original text.');
          }}
        />
      )}
    </div>
  );
}
