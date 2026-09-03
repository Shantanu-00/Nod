'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { calculateReadingMetrics } from '@/lib/utils/a11y-metrics';
import { Mic, MicOff, Sparkles, Send, User, Quote, Bot } from 'lucide-react';
import { BinaryReviewModal } from './BinaryReviewModal';

export function AccessibleEditor() {
  const router = useRouter();
  const announce = useStore((state) => state.announce);
  const setMascotMood = useStore((state) => state.setMascotMood);
  const editorDraft = useStore((state) => state.editorDraft);
  const setEditorDraft = useStore((state) => state.setEditorDraft);
  const proposeEditorDraft = useStore((state) => state.proposeEditorDraft);
  const acceptEditorProposal = useStore((state) => state.acceptEditorProposal);
  const rejectEditorProposal = useStore((state) => state.rejectEditorProposal);
  const insertPullQuote = useStore((state) => state.insertPullQuote);

  const [isRecording, setIsRecording] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [tagsInput, setTagsInput] = useState(editorDraft.tags.join(', '));

  useEffect(() => {
    const savedTitle = sessionStorage.getItem('nod_draft_title');
    const savedContent = sessionStorage.getItem('nod_draft_content');
    if (savedTitle && !editorDraft.title) {
      setEditorDraft({ title: savedTitle });
    }
    if (savedContent && !editorDraft.content) {
      setEditorDraft({ content: savedContent });
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('nod_draft_title', editorDraft.title);
    sessionStorage.setItem('nod_draft_content', editorDraft.content);
  }, [editorDraft.title, editorDraft.content]);

  const metrics = calculateReadingMetrics(editorDraft.content || 'Start typing...');

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
        setEditorDraft({
          content: editorDraft.content ? `${editorDraft.content} ${transcript}` : transcript,
        });
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
    if (!editorDraft.content.trim()) return;

    setIsExpanding(true);
    setMascotMood('nodding');
    announce('Expanding shorthand thoughts into structured sentences...');

    try {
      const lines = editorDraft.content.split('\n').filter(Boolean);
      const expandedLines = lines.map((line) => {
        const clean = line.replace(/^[-*•]\s*/, '').trim();
        const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
        return cap.endsWith('.') ? cap : `${cap}.`;
      });

      const proposal = expandedLines.join(' ');
      proposeEditorDraft({ proposedText: proposal });
    } finally {
      setIsExpanding(false);
      setMascotMood('idle');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorDraft.title.trim() || !editorDraft.content.trim()) return;

    setIsPublishing(true);
    announce('Publishing your article...');
    setMascotMood('nodding');

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const formattedHandle = editorDraft.handle.startsWith('@') ? editorDraft.handle : `@${editorDraft.handle}`;

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editorDraft.title.trim(),
          content: editorDraft.content.trim(),
          category: editorDraft.category,
          tags,
          author: {
            id: 'user-active',
            name: editorDraft.authorName.trim() || 'Community Contributor',
            handle: formattedHandle,
            badge: 'Author',
          },
        }),
      });

      if (res.ok) {
        sessionStorage.removeItem('nod_draft_title');
        sessionStorage.removeItem('nod_draft_content');
        setEditorDraft({ title: '', content: '', proposedText: null });
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
      {/* Editorial Guidance & WebMCP Status */}
      <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-green" />
          <span className="text-brand-text font-bold">
            Assisted Writing Studio (Low-Bandwidth Shorthand Engine)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-brand-muted hidden md:inline">
            Type fragments; agent expands cleanly.
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green-muted/60 border border-brand-green/20 text-[11px] font-bold text-brand-green">
            <Bot className="w-3 h-3" />
            <span>WebMCP Co-Author Connected</span>
          </div>
        </div>
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
              value={editorDraft.authorName}
              onChange={(e) => setEditorDraft({ authorName: e.target.value })}
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
              value={editorDraft.handle}
              onChange={(e) => setEditorDraft({ handle: e.target.value })}
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
            value={editorDraft.title}
            onChange={(e) => setEditorDraft({ title: e.target.value })}
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
              onClick={() => setEditorDraft({ category: cat })}
              className={`touch-target px-3.5 py-1 text-xs rounded-full border transition-all ${
                editorDraft.category === cat
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
          <div className="flex flex-wrap items-center gap-2">
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
              disabled={isExpanding || !editorDraft.content.trim()}
              className="touch-target px-4 py-1.5 rounded-full text-xs font-bold bg-brand-green-muted hover:bg-brand-green hover:text-white text-brand-green-text border border-brand-green/20 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Expand telegraphic shorthand notes into fluent paragraphs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExpanding ? 'Expanding...' : 'Expand Notes with NOD'}</span>
            </button>

            <button
              type="button"
              onClick={() => insertPullQuote("Focus isn't about working harder; it's about reducing visual and cognitive friction.", editorDraft.authorName)}
              className="touch-target px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-surface-elevated transition-all"
              title="Insert a formatted pull quote into draft"
            >
              <Quote className="w-3.5 h-3.5 text-brand-green" />
              <span>+ Pull Quote</span>
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
            value={editorDraft.content}
            onChange={(e) => setEditorDraft({ content: e.target.value })}
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
            onChange={(e) => {
              setTagsInput(e.target.value);
              setEditorDraft({
                tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              });
            }}
            className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-green shadow-xs"
          />
        </div>

        {/* Submit & Publish CTA */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isPublishing || !editorDraft.title.trim() || !editorDraft.content.trim()}
            className="touch-target px-7 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-extrabold text-sm sm:text-base rounded-full flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-40"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Story'}</span>
          </button>
        </div>
      </form>

      {/* Binary Review Modal (Driven by WebMCP or In-App Expand) */}
      {editorDraft.proposedText && (
        <BinaryReviewModal
          original={editorDraft.content}
          proposal={editorDraft.proposedText}
          onAccept={() => acceptEditorProposal()}
          onReject={() => rejectEditorProposal()}
        />
      )}
    </div>
  );
}
