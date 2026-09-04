import { getStore } from '@netlify/blobs';
import { FeedItem, ArticleDetail, CommentItem } from '@/types';
import { SEED_ARTICLES } from './seeds';

// In-memory fallback for local development
const memoryFeedStore = new Map<string, FeedItem>();
const memoryArticlesStore = new Map<string, ArticleDetail>();
const memoryCommentsStore = new Map<string, CommentItem[]>();

SEED_ARTICLES.forEach((article) => {
  const invertedTime = String(9999999999999 - new Date(article.createdAt).getTime()).padStart(13, '0');
  const feedKey = `${invertedTime}_${article.id}`;
  
  const feedItem: FeedItem = {
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

  memoryFeedStore.set(feedKey, feedItem);
  memoryArticlesStore.set(article.id, article);
  memoryCommentsStore.set(article.id, [
    {
      id: `c-${article.id}-1`,
      articleId: article.id,
      author: { id: 'reader-1', name: 'Jordan K.', handle: '@jordan_k' },
      content: 'The clarity metrics and spacing adjustments make such a tangible difference!',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);
});

function hasNetlifyBlobs(): boolean {
  return typeof process !== 'undefined' && Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
}

// Automatically populates Netlify Blobs on first access if the store is empty
let isSeedingInProgress = false;

// Cleanup duplicate feed keys in Netlify Blobs (e.g., if seed was run multiple times)
export async function cleanupDuplicateFeedBlobs(): Promise<{ deletedKeys: string[]; keptCount: number }> {
  if (!hasNetlifyBlobs()) {
    const seenIds = new Set<string>();
    const deletedKeys: string[] = [];
    for (const [key, item] of Array.from(memoryFeedStore.entries())) {
      if (seenIds.has(item.id)) {
        memoryFeedStore.delete(key);
        deletedKeys.push(key);
      } else {
        seenIds.add(item.id);
      }
    }
    return { deletedKeys, keptCount: memoryFeedStore.size };
  }

  try {
    const feedStore = getStore('feed');
    const { blobs } = await feedStore.list();
    if (!blobs || blobs.length === 0) {
      return { deletedKeys: [], keptCount: 0 };
    }

    // Group keys by articleId (format: ${invertedTime}_${articleId})
    const keysByArticleId = new Map<string, string[]>();
    for (const blob of blobs) {
      const underscoreIdx = blob.key.indexOf('_');
      const articleId = underscoreIdx !== -1 ? blob.key.slice(underscoreIdx + 1) : blob.key;
      const existing = keysByArticleId.get(articleId) || [];
      existing.push(blob.key);
      keysByArticleId.set(articleId, existing);
    }

    const deletedKeys: string[] = [];

    for (const [articleId, keys] of keysByArticleId.entries()) {
      if (keys.length > 1) {
        // Sort keys lexicographically: smaller invertedTime = newer/canonical
        keys.sort((a, b) => a.localeCompare(b));
        // Keep the canonical key, delete all other duplicate keys
        const [keepKey, ...duplicates] = keys;
        for (const dupKey of duplicates) {
          try {
            await feedStore.delete(dupKey);
            deletedKeys.push(dupKey);
          } catch (delErr) {
            console.error(`Failed to delete duplicate feed key ${dupKey}:`, delErr);
          }
        }
      }
    }

    return { deletedKeys, keptCount: keysByArticleId.size };
  } catch (err) {
    console.error('Failed to cleanup duplicate feed blobs:', err);
    return { deletedKeys: [], keptCount: 0 };
  }
}

export async function ensureBlobsSeeded(): Promise<void> {
  if (!hasNetlifyBlobs() || isSeedingInProgress) return;

  try {
    const feedStore = getStore('feed');
    const { blobs } = await feedStore.list();
    if (blobs && blobs.length > 0) {
      // Run background cleanup in case duplicates exist from prior seed runs
      cleanupDuplicateFeedBlobs().catch(console.error);
      return; // Already populated!
    }

    isSeedingInProgress = true;
    const articlesStore = getStore('articles');
    const commentsStore = getStore('comments');

    for (const article of SEED_ARTICLES) {
      const timestamp = new Date(article.createdAt).getTime();
      const invertedTime = String(9999999999999 - timestamp).padStart(13, '0');
      const feedKey = `${invertedTime}_${article.id}`;

      const feedItem: FeedItem = {
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
  } catch (err) {
    console.error('Failed to auto-seed Netlify Blobs:', err);
  } finally {
    isSeedingInProgress = false;
  }
}

export async function getFeedItems(limit = 20, category = 'all'): Promise<FeedItem[]> {
  if (hasNetlifyBlobs()) {
    try {
      await ensureBlobsSeeded();
      const feedStore = getStore('feed');
      const { blobs } = await feedStore.list();

      // Deduplicate keys by articleId before fetching so duplicates don't displace items
      const seenArticleIds = new Set<string>();
      const uniqueKeys: string[] = [];
      const duplicateKeys: string[] = [];

      for (const blob of blobs) {
        const underscoreIdx = blob.key.indexOf('_');
        const articleId = underscoreIdx !== -1 ? blob.key.slice(underscoreIdx + 1) : blob.key;
        if (!seenArticleIds.has(articleId)) {
          seenArticleIds.add(articleId);
          uniqueKeys.push(blob.key);
        } else {
          duplicateKeys.push(blob.key);
        }
      }

      // Proactively purge any duplicate keys in the background
      if (duplicateKeys.length > 0) {
        Promise.all(duplicateKeys.map((k) => feedStore.delete(k).catch(() => {}))).catch(() => {});
      }

      const keysToFetch = category === 'all' 
        ? uniqueKeys.slice(0, limit) 
        : uniqueKeys.slice(0, Math.max(limit * 3, 50));

      const items = await Promise.all(
        keysToFetch.map(async (key) => (await feedStore.get(key, { type: 'json' })) as FeedItem | null)
      );
      const validItems = items.filter(Boolean) as FeedItem[];

      // Ensure strict uniqueness by item.id
      const dedupMap = new Map<string, FeedItem>();
      for (const item of validItems) {
        if (!dedupMap.has(item.id)) {
          dedupMap.set(item.id, item);
        }
      }
      const uniqueItems = Array.from(dedupMap.values());

      const filtered = category === 'all'
        ? uniqueItems.slice(0, limit)
        : uniqueItems.filter((item) => item.category === category).slice(0, limit);

      if (filtered.length > 0) {
        return filtered;
      }
    } catch {
      // fallback to memory
    }
  }

  // Deduplicate in-memory store
  const seenIds = new Set<string>();
  const items: FeedItem[] = [];
  for (const [, item] of Array.from(memoryFeedStore.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      items.push(item);
    }
  }

  return category === 'all'
    ? items.slice(0, limit)
    : items.filter((item) => item.category === category).slice(0, limit);
}

export async function getArticleById(id: string): Promise<ArticleDetail | null> {
  if (hasNetlifyBlobs()) {
    try {
      await ensureBlobsSeeded();
      const articlesStore = getStore('articles');
      const article = await articlesStore.get(id, { type: 'json' });
      if (article) return article as ArticleDetail;
    } catch {
      // fallback to memory
    }
  }

  return memoryArticlesStore.get(id) || null;
}

export async function saveArticle(article: ArticleDetail): Promise<{ feedKey: string }> {
  const timestamp = new Date(article.createdAt).getTime();
  const invertedTime = String(9999999999999 - timestamp).padStart(13, '0');
  const feedKey = `${invertedTime}_${article.id}`;

  const feedItem: FeedItem = {
    id: article.id,
    title: article.title,
    summary: article.summary,
    author: article.author,
    category: article.category,
    tags: article.tags,
    metrics: article.metrics,
    createdAt: article.createdAt,
    likesCount: 0,
    commentCount: 0,
    coverImage: article.coverImage,
  };

  if (hasNetlifyBlobs()) {
    try {
      const feedStore = getStore('feed');
      const articlesStore = getStore('articles');

      // Clean up any older feed keys for this article so updates don't create duplicate entries
      try {
        const { blobs } = await feedStore.list();
        for (const b of blobs) {
          if (b.key.endsWith(`_${article.id}`) && b.key !== feedKey) {
            await feedStore.delete(b.key).catch(() => {});
          }
        }
      } catch {
        // non-blocking
      }

      await Promise.all([
        feedStore.setJSON(feedKey, feedItem),
        articlesStore.setJSON(article.id, article),
      ]);
      return { feedKey };
    } catch {
      // fallback
    }
  }

  // In-memory fallback: delete any older entry for this article
  for (const [k, v] of Array.from(memoryFeedStore.entries())) {
    if (v.id === article.id && k !== feedKey) {
      memoryFeedStore.delete(k);
    }
  }

  memoryFeedStore.set(feedKey, feedItem);
  memoryArticlesStore.set(article.id, article);
  return { feedKey };
}

export async function getCommentsForArticle(articleId: string): Promise<CommentItem[]> {
  if (hasNetlifyBlobs()) {
    try {
      const commentsStore = getStore('comments');
      const list = await commentsStore.get(articleId, { type: 'json' });
      if (list) return list as CommentItem[];
    } catch {
      // fallback
    }
  }

  return memoryCommentsStore.get(articleId) || [];
}

export async function addCommentToArticle(comment: CommentItem): Promise<void> {
  const existing = await getCommentsForArticle(comment.articleId);
  const updated = [...existing, comment];

  if (hasNetlifyBlobs()) {
    try {
      const commentsStore = getStore('comments');
      await commentsStore.setJSON(comment.articleId, updated);
      return;
    } catch {
      // fallback
    }
  }

  memoryCommentsStore.set(comment.articleId, updated);
}
