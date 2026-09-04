import { NextRequest, NextResponse } from 'next/server';
import { ensureBlobsSeeded, cleanupDuplicateFeedBlobs } from '@/lib/blobs/client';
import { SEED_ARTICLES } from '@/lib/blobs/seeds';
import { getStore } from '@netlify/blobs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const clean = searchParams.get('clean') === 'true';

    // Explicit cleanup action: removes duplicate keys from feedStore
    if (clean) {
      const result = await cleanupDuplicateFeedBlobs();
      return NextResponse.json({
        success: true,
        message: `Deduplication complete. Deleted ${result.deletedKeys.length} duplicate feed keys.`,
        deletedKeys: result.deletedKeys,
        remainingUniqueArticles: result.keptCount,
      });
    }

    // If force is requested and in Netlify environment, clean previous seed entries first
    if (force && (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT)) {
      const feedStore = getStore('feed');
      const articlesStore = getStore('articles');
      const commentsStore = getStore('comments');

      // 1. Remove any existing keys for seed articles in feedStore to guarantee idempotency
      try {
        const { blobs } = await feedStore.list();
        const seedIds = new Set(SEED_ARTICLES.map((a) => a.id));
        for (const b of blobs) {
          const underscoreIdx = b.key.indexOf('_');
          const articleId = underscoreIdx !== -1 ? b.key.slice(underscoreIdx + 1) : b.key;
          if (seedIds.has(articleId)) {
            await feedStore.delete(b.key).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Could not clear prior seed keys:', err);
      }

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
        message: `Forced re-seeding completed with ${SEED_ARTICLES.length} unique articles!`,
        count: SEED_ARTICLES.length,
      });
    }

    await ensureBlobsSeeded();
    const cleanupResult = await cleanupDuplicateFeedBlobs();

    return NextResponse.json({
      success: true,
      message: `Verified Netlify Blobs seeding with ${SEED_ARTICLES.length} articles.`,
      count: SEED_ARTICLES.length,
      deletedDuplicates: cleanupResult.deletedKeys.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
