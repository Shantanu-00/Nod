import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleById } from '@/lib/blobs/client';
import { ReadingCanvas } from '@/components/article/ReadingCanvas';
import { CommentSection } from '@/components/article/CommentSection';
import { ArrowLeft } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 pb-28">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="touch-target inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-muted hover:text-brand-lime transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discussions</span>
        </Link>

        <span className="text-xs font-mono text-brand-muted">
          Article ID: {article.id.slice(0, 8)}
        </span>
      </div>

      {/* Adaptive Reading Canvas (Layer 2) */}
      <ReadingCanvas article={article} />

      {/* Community Comments */}
      <CommentSection articleId={article.id} />
    </div>
  );
}
