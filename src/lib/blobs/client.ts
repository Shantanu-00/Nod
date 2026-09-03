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
export async function ensureBlobsSeeded(): Promise<void> {
  if (!hasNetlifyBlobs() || isSeedingInProgress) return;

  try {
    const feedStore = getStore('feed');
    const { blobs } = await feedStore.list();
    if (blobs && blobs.length > 0) {
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
      const topKeys = blobs.slice(0, limit).map((b) => b.key);
      const items = await Promise.all(
        topKeys.map(async (key) => (await feedStore.get(key, { type: 'json' })) as FeedItem | null)
      );
      const validItems = items.filter(Boolean) as FeedItem[];
      if (validItems.length > 0) {
        return category === 'all' 
          ? validItems 
          : validItems.filter((item) => item.category === category);
      }
    } catch {
      // fallback to memory
    }
  }

  const items = Array.from(memoryFeedStore.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .slice(0, limit)
    .map(([, item]) => item);

  return category === 'all'
    ? items
    : items.filter((item) => item.category === category);
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
      await Promise.all([
        feedStore.setJSON(feedKey, feedItem),
        articlesStore.setJSON(article.id, article),
      ]);
      return { feedKey };
    } catch {
      // fallback
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
