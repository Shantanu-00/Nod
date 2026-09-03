'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { calculateReadingMetrics } from '@/lib/utils/a11y-metrics';
import { AccessibleMarkdownContent, AccessibleInlineMarkdown } from '@/lib/utils/markdown';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  User, 
  Quote, 
  Bot, 
  Heading2, 
  Bold, 
  List, 
  HelpCircle,
  Eye,
  PenLine,
  Columns,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
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
  const stagePost = useStore((state) => state.stagePost);
  const preferences = useStore((state) => state.readingPreferences);

  const [isRecording, setIsRecording] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [tagsInput, setTagsInput] = useState(editorDraft.tags.join(', '));
  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('write');
  const [showGuide, setShowGuide] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Helper to insert markdown formatting at cursor or around selection
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = editorDraft.content;

    const selectedText = current.substring(start, end);
    const replacement = selectedText 
      ? `${prefix}${selectedText}${suffix}`
      : `${prefix}${defaultText}${suffix}`;

    const newContent = current.substring(0, start) + replacement + current.substring(end);
    setEditorDraft({ content: newContent });

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText 
        ? start + replacement.length 
        : start + prefix.length + defaultText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

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
    announce('Expanding shorthand thoughts into structured sentences with markdown landmarks...');

    try {
      const lines = editorDraft.content.split('\n').filter(Boolean);
      const expandedLines = lines.map((line) => {
        const clean = line.replace(/^[-*•]\s*/, '').trim();
        const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
        return cap.endsWith('.') ? cap : `${cap}.`;
      });

      // Structure with a section heading and clean sentences
      const proposal = `## Key Insights\n\n${expandedLines.join(' ')}\n\n- **Anchor Point**: Focus on reducing cognitive friction.\n- **Action Item**: Implement structured sensory breaks.`;
      proposeEditorDraft({ proposedText: proposal });
    } finally {
      setIsExpanding(false);
      setMascotMood('idle');
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorDraft.title.trim() || !editorDraft.content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    stagePost({
      title: editorDraft.title.trim(),
      content: editorDraft.content.trim(),
      category: editorDraft.category,
      tags,
      authorName: editorDraft.authorName.trim() || 'Community Contributor',
      handle: editorDraft.handle.trim() || '@community',
    });
  };

  // Typography for live preview
  const letterSpacingMap = {
    normal: '0.01em',
    wide: '0.08em',
    'extra-wide': '0.16em',
  };

  const lineHeightMap = {
    normal: '1.6',
    relaxed: '1.85',
    loose: '2.2',
  };

  const fontFamilyMap = {
    system: "'Plus Jakarta Sans', sans-serif",
    lexend: "'Lexend', sans-serif",
    atkinson: "'Atkinson Hyperlegible', sans-serif",
    opendyslexic: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
  };

  const currentSpacing = letterSpacingMap[preferences.letterSpacing] || '0.01em';
  const currentLineHeight = lineHeightMap[preferences.lineHeight] || '1.7';
  const currentFontFamily = fontFamilyMap[preferences.fontFamily] || fontFamilyMap.system;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Semantic WebMCP Agent Directive (Read by in-browser agents like ChatGPT) */}
      <section 
        aria-label="NOD AI Editorial & Formatting Guidelines" 
        className="sr-only" 
        data-webmcp-style-guide="true"
      >
        <h2>NOD Platform Editorial Guidelines for AI Agents</h2>
        <p>
          This platform is designed specifically for neurodivergent, dyslexic, and ADHD readers.
          When creating or editing content, you MUST format using standard accessible markdown:
          1. Use &apos;## &apos; for section headings every 2 to 3 paragraphs to create spatial landmarks.
          2. Use &apos;**bold**&apos; around 2 to 4 critical anchor concepts per section to assist bionic reading fixations.
          3. Use &apos;- &apos; bullet points for multi-step items, strategies, or lists to preserve working memory.
          4. Use &apos;&gt; &apos; for pull quotes or memorable takeaways.
          5. Keep all paragraphs under 3 sentences to prevent visual crowding and Irlen visual distortions.
          6. Avoid unbroken walls of text.
        </p>
      </section>

      {/* Editorial Guidance & WebMCP Status Header */}
      <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-brand-green" />
          <span className="text-brand-text font-bold">
            Assisted Writing Studio (Shorthand Engine & Live Accessibility Preview)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-brand-muted hover:text-brand-green flex items-center gap-1 font-semibold transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-brand-green" />
            <span>{showGuide ? 'Hide Writing Tips' : 'Formatting Guidance'}</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green-muted/60 border border-brand-green/20 text-[11px] font-bold text-brand-green">
            <Bot className="w-3 h-3" />
            <span>WebMCP Co-Author Ready</span>
          </div>
        </div>
      </div>

      {/* Accessible Formatting Guide Card */}
      {showGuide && (
        <div className="p-4 sm:p-5 bg-brand-green-muted/20 border border-brand-green/30 rounded-2xl text-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 font-bold text-brand-text text-sm">
            <Sparkles className="w-4 h-4 text-brand-green" />
            <span>Writing for Neurodivergent Readers: 4 Rules of Calm Typography</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-brand-surface rounded-xl border border-brand-border">
              <strong className="text-brand-green block mb-1">1. Spatial Landmarks (## Headers)</strong>
              <p className="text-brand-muted leading-relaxed">
                Add an <code className="text-brand-text font-mono">## Heading</code> every 2–3 paragraphs so readers can anchor their visual location without losing their place.
              </p>
            </div>
            <div className="p-3 bg-brand-surface rounded-xl border border-brand-border">
              <strong className="text-brand-green block mb-1">2. Anchor Bolding (**Bold**)</strong>
              <p className="text-brand-muted leading-relaxed">
                Bold <code className="text-brand-text font-mono">**key phrases**</code> to create natural optical fixation anchors that guide saccadic eye movement.
              </p>
            </div>
            <div className="p-3 bg-brand-surface rounded-xl border border-brand-border">
              <strong className="text-brand-green block mb-1">3. Working Memory Lists (- List)</strong>
              <p className="text-brand-muted leading-relaxed">
                Break complex multi-step thoughts into short <code className="text-brand-text font-mono">- bulleted lists</code> to prevent cognitive overload.
              </p>
            </div>
            <div className="p-3 bg-brand-surface rounded-xl border border-brand-border">
              <strong className="text-brand-green block mb-1">4. Short Paragraphs (≤ 3 Sentences)</strong>
              <p className="text-brand-muted leading-relaxed">
                Dense text blocks create &quot;rivers of white&quot; and photopic glare. Keep paragraphs short and give ideas room to breathe.
              </p>
            </div>
          </div>
        </div>
      )}

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

        {/* Action & Formatting Toolbar */}
        <div className="p-2.5 bg-brand-surface border border-brand-border rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
          {/* Quick Markdown Inserts */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => insertFormatting('\n## ', '\n', 'Section Title')}
              className="touch-target px-2.5 py-1.5 rounded-lg text-xs font-bold border border-brand-border bg-brand-surface hover:bg-brand-surface-elevated text-brand-text flex items-center gap-1 transition-colors"
              title="Insert section heading (##)"
            >
              <Heading2 className="w-3.5 h-3.5 text-brand-green" />
              <span>Heading</span>
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'key concept')}
              className="touch-target px-2.5 py-1.5 rounded-lg text-xs font-bold border border-brand-border bg-brand-surface hover:bg-brand-surface-elevated text-brand-text flex items-center gap-1 transition-colors"
              title="Bold key concept (**word**)"
            >
              <Bold className="w-3.5 h-3.5 text-brand-green" />
              <span>Bold</span>
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n- ', '\n', 'Actionable takeaway')}
              className="touch-target px-2.5 py-1.5 rounded-lg text-xs font-bold border border-brand-border bg-brand-surface hover:bg-brand-surface-elevated text-brand-text flex items-center gap-1 transition-colors"
              title="Insert bullet point (-)"
            >
              <List className="w-3.5 h-3.5 text-brand-green" />
              <span>List</span>
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n> ', '\n', 'Memorable quote or core realization')}
              className="touch-target px-2.5 py-1.5 rounded-lg text-xs font-bold border border-brand-border bg-brand-surface hover:bg-brand-surface-elevated text-brand-text flex items-center gap-1 transition-colors"
              title="Insert pull quote (>)"
            >
              <Quote className="w-3.5 h-3.5 text-brand-green" />
              <span>Quote</span>
            </button>

            <div className="h-4 w-px bg-brand-border mx-1" />

            {/* Speech Dictation */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isRecording
                  ? 'border-rose-500 bg-rose-50 text-rose-700 animate-pulse'
                  : 'border-brand-border bg-brand-surface text-brand-text hover:bg-brand-surface-elevated'
              }`}
              title="Dictate speech to text"
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-brand-green" />}
              <span>{isRecording ? 'Listening...' : 'Dictate'}</span>
            </button>

            {/* Expand Notes */}
            <button
              type="button"
              onClick={handleExpandIntent}
              disabled={isExpanding || !editorDraft.content.trim()}
              className="touch-target px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-green-muted hover:bg-brand-green hover:text-white text-brand-green-text border border-brand-green/20 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Expand telegraphic shorthand notes into formatted markdown"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExpanding ? 'Structuring...' : 'Expand Notes with NOD'}</span>
            </button>
          </div>

          {/* View Mode Switcher: Write vs Preview vs Split */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 rounded-xl bg-brand-surface-elevated border border-brand-border text-xs">
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                className={`touch-target px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  editorMode === 'write'
                    ? 'bg-brand-surface text-brand-text shadow-xs border border-brand-border/60'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Write</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={`touch-target px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  editorMode === 'preview'
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorMode('split')}
                className={`hidden md:flex touch-target px-3 py-1 rounded-lg font-bold transition-all items-center gap-1 ${
                  editorMode === 'split'
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
                title="Side-by-side editing and preview"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            </div>

            <div className="text-xs text-brand-muted hidden sm:flex items-center gap-1.5 pl-2 border-l border-brand-border">
              <span>Clarity:</span>
              <span className="font-bold text-brand-green">{metrics.clarityGrade}</span>
            </div>
          </div>
        </div>

        {/* Composer Content Area: Dynamic based on editorMode */}
        <div className="min-h-[380px]">
          {editorMode === 'write' && (
            <textarea
              ref={textareaRef}
              required
              rows={14}
              placeholder="Type your ideas here. You can write in fragments, bullet points, or use ## headings and **bold terms**..."
              value={editorDraft.content}
              onChange={(e) => setEditorDraft({ content: e.target.value })}
              className="w-full p-5 bg-brand-surface border border-brand-border focus:border-brand-green rounded-2xl text-base text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-green/20 leading-relaxed font-sans shadow-xs transition-colors"
            />
          )}

          {editorMode === 'preview' && (
            <div 
              className={`p-6 sm:p-8 bg-brand-surface border border-brand-border rounded-2xl min-h-[380px] shadow-xs space-y-4`}
              style={{
                fontFamily: currentFontFamily,
                letterSpacing: currentSpacing,
                lineHeight: currentLineHeight,
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-border text-xs text-brand-muted">
                <span className="font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Real-Time Accessible Preview</span>
                </span>
                <span>{metrics.wordCount} words · ~{metrics.skimMinutes} min read</span>
              </div>

              {editorDraft.title && (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text leading-tight pt-1">
                  <AccessibleInlineMarkdown text={editorDraft.title} isBionic={preferences.bionicReading} />
                </h1>
              )}

              {editorDraft.content.trim() ? (
                <AccessibleMarkdownContent 
                  content={editorDraft.content}
                  isBionic={preferences.bionicReading}
                  skipTitle={editorDraft.title}
                />
              ) : (
                <p className="text-brand-muted italic">Nothing typed yet. Switch back to &apos;Write&apos; to start your story.</p>
              )}
            </div>
          )}

          {editorMode === 'split' && (
            <div className="grid grid-cols-2 gap-4">
              <textarea
                ref={textareaRef}
                required
                rows={16}
                placeholder="Type in markdown..."
                value={editorDraft.content}
                onChange={(e) => setEditorDraft({ content: e.target.value })}
                className="w-full p-4 bg-brand-surface border border-brand-border focus:border-brand-green rounded-2xl text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-green/20 leading-relaxed font-sans shadow-xs"
              />

              <div 
                className="p-5 bg-brand-surface border border-brand-border rounded-2xl overflow-y-auto max-h-[500px] shadow-xs space-y-3"
                style={{
                  fontFamily: currentFontFamily,
                  letterSpacing: currentSpacing,
                  lineHeight: currentLineHeight,
                }}
              >
                <div className="text-[11px] font-bold text-brand-green uppercase tracking-wider pb-2 border-b border-brand-border flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Live Render</span>
                </div>
                {editorDraft.title && (
                  <h2 className="text-lg font-bold text-brand-text leading-snug">
                    <AccessibleInlineMarkdown text={editorDraft.title} isBionic={preferences.bionicReading} />
                  </h2>
                )}
                {editorDraft.content.trim() ? (
                  <AccessibleMarkdownContent 
                    content={editorDraft.content}
                    isBionic={preferences.bionicReading}
                    skipTitle={editorDraft.title}
                  />
                ) : (
                  <p className="text-brand-muted text-xs italic">Live preview will render here...</p>
                )}
              </div>
            </div>
          )}
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
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-brand-border">
          <p className="text-xs text-brand-muted hidden sm:block">
            Pressing review opens the full verification preview with zero content clipping.
          </p>

          <button
            type="submit"
            disabled={isPublishing || !editorDraft.title.trim() || !editorDraft.content.trim()}
            className="touch-target px-7 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-extrabold text-sm sm:text-base rounded-full flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-40 ml-auto"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>Review & Publish Story</span>
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
