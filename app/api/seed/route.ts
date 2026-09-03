import { NextRequest, NextResponse } from 'next/server';
import { ensureBlobsSeeded } from '@/lib/blobs/client';
import { SEED_ARTICLES } from '@/lib/blobs/seeds';
import { getStore } from '@netlify/blobs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // If force is requested and in Netlify environment, re-seed even if keys exist
    if (force && (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT)) {
      const feedStore = getStore('feed');
      const articlesStore = getStore('articles');
      const commentsStore = getStore('comments');

      for (const article of SEED_ARTICLES) {
        const timestamp = new Date(article.createdAt).getTime();
        const invertedTime = String(9999999999999 - timestamp).padStart(13, '0');
        const feedKey = `${invertedTime}_${article.id}`;

        const feedItem = {
          id: article.id,
          title: article.title,
          summary: article.summary,
          author: article.author,
          category: article.category,
          tags: article.tags,
          metrics: article.metrics,
          createdAt: article.createdAt,
          likesCount: article.likesCount,
          commentCount: article.commentCount,
          coverImage: article.coverImage,
        };

        await Promise.all([
          feedStore.setJSON(feedKey, feedItem),
          articlesStore.setJSON(article.id, article),
          commentsStore.setJSON(article.id, [
            {
              id: `c-${article.id}-1`,
              articleId: article.id,
              author: { id: 'reader-1', name: 'Jordan K.', handle: '@jordan_k' },
              content: 'The clarity metrics and spacing adjustments make such a tangible difference!',
              createdAt: new Date(Date.now() - 1800000).toISOString(),
            },
          ]),
        ]);
      }

      return NextResponse.json({
        success: true,
        message: `Forced re-seeding completed with ${SEED_ARTICLES.length} articles!`,
        count: SEED_ARTICLES.length,
      });
    }

    await ensureBlobsSeeded();

    return NextResponse.json({
      success: true,
      message: `Verified Netlify Blobs seeding with ${SEED_ARTICLES.length} articles.`,
      count: SEED_ARTICLES.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
