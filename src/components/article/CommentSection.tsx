'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CommentItem } from '@/types';
import { MessageSquare, Send } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { BionicText } from '@/components/accessibility/BionicText';

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const announce = useStore((state) => state.announce);
  const showToast = useStore((state) => state.showToast);
  const preferences = useStore((state) => state.readingPreferences);

  const letterSpacingMap = {
    normal: '0.01em',
    wide: '0.08em',
    'extra-wide': '0.16em',
  };

  const fontFamilyMap = {
    system: "'Plus Jakarta Sans', sans-serif",
    lexend: "'Lexend', sans-serif",
    atkinson: "'Atkinson Hyperlegible', sans-serif",
    opendyslexic: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
  };

  const currentSpacing = letterSpacingMap[preferences.letterSpacing] || '0.01em';
  const currentFontFamily = fontFamilyMap[preferences.fontFamily] || fontFamilyMap.system;

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();

    const handleCommentAdded = () => fetchComments();
    window.addEventListener('nod:comment-added', handleCommentAdded);
    return () => window.removeEventListener('nod:comment-added', handleCommentAdded);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          author: {
            id: 'guest-user',
            name: authorName.trim() || 'Friendly Reader',
          },
        }),
      });

      if (res.ok) {
        setNewComment('');
        announce('Your comment has been posted.');
        showToast('✓ Comment published to discussion');
        fetchComments();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      className="mt-8 max-w-[72ch] mx-auto space-y-6 transition-colors"
      style={{
        fontFamily: currentFontFamily,
        letterSpacing: currentSpacing,
      }}
      aria-label="Community Comments"
    >
      <div 
        className="flex items-center gap-2 pb-3 border-b"
        style={{ borderColor: 'var(--canvas-border)' }}
      >
        <MessageSquare className="w-5 h-5 text-brand-green" />
        <h3 className="text-lg font-bold" style={{ color: 'var(--canvas-text)' }}>
          Community Discussion
        </h3>
        <span className="text-xs font-medium" style={{ color: 'var(--canvas-muted)' }}>
          ({comments.length})
        </span>
      </div>

      {/* New Comment Input */}
      <form 
        onSubmit={handleSubmit} 
        className="p-5 rounded-3xl border space-y-3 shadow-xs transition-all"
        style={{
          backgroundColor: 'var(--canvas-surface)',
          borderColor: 'var(--canvas-border)',
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Your name or handle (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="flex-1 max-w-xs px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-brand-green"
            style={{
              backgroundColor: 'var(--canvas-bg)',
              borderColor: 'var(--canvas-border)',
              color: 'var(--canvas-text)',
            }}
          />
        </div>
        <textarea
          rows={3}
          placeholder="Share an accommodation tip, reaction, or encouragement..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-green resize-none leading-relaxed"
          style={{
            backgroundColor: 'var(--canvas-bg)',
            borderColor: 'var(--canvas-border)',
            color: 'var(--canvas-text)',
          }}
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="touch-target px-4 py-1.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-40 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments Stream */}
      <div className="space-y-3">
        {loading ? (
          <div 
            className="h-16 rounded-2xl animate-pulse border" 
            style={{
              backgroundColor: 'var(--canvas-surface)',
              borderColor: 'var(--canvas-border)',
            }}
          />
        ) : comments.length === 0 ? (
          <p className="text-xs italic" style={{ color: 'var(--canvas-muted)' }}>
            No comments yet. Start the conversation!
          </p>
        ) : (
          comments.map((c) => (
            <div 
              key={c.id} 
              className="p-4 rounded-2xl border space-y-1.5 shadow-xs transition-all"
              style={{
                backgroundColor: 'var(--canvas-surface)',
                borderColor: 'var(--canvas-border)',
              }}
            >
              <div 
                className="flex items-center justify-between text-xs"
                style={{ color: 'var(--canvas-muted)' }}
              >
                <span className="font-bold" style={{ color: 'var(--canvas-text)' }}>
                  {c.author.name}
                </span>
                <span className="text-[11px]">
                  {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--canvas-text)' }}>
                <BionicText text={c.content} as="span" />
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

