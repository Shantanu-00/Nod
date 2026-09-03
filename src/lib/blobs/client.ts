import { getStore } from '@netlify/blobs';
import { FeedItem, ArticleDetail, CommentItem } from '@/types';
import { calculateReadingMetrics } from '@/lib/utils/a11y-metrics';

const SEED_ARTICLES_RAW = [
  {
    id: 'seed-001',
    title: 'Why Letter Spacing and Visual Saccades Matter More Than Dyslexia Fonts',
    summary: 'Clinical trials show that character tracking (+0.12em) and generous line leading reduce visual crowding far more effectively than bottom-heavy fonts.',
    author: {
      id: 'author-1',
      name: 'Dr. Maya Chen',
      handle: '@maya_neuro',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      badge: 'Cognitive Scientist',
    },
    category: 'strategies' as const,
    tags: ['neuroscience', 'spacing', 'dyslexia', 'typography'],
    likesCount: 38,
    commentCount: 4,
    coverImage: 'https://images.unsplash.com/photo-1507842229458-57790dd40237?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Why Letter Spacing and Visual Saccades Matter More Than Dyslexia Fonts

For decades, typographers believed bottom-heavy fonts were the single answer to reading difficulties. However, clinical trials in cognitive neuroscience demonstrate a different reality: **crowding reduction** is the true therapeutic lever.

## The Visual Crowding Phenomenon
When letterforms sit too close together, the foveal field experiences character interference. Letters appear to merge, shimmer, or shift positions.

By expanding character tracking by **+0.12em** and word spacing by **+0.20em**, we give each glyph distinct spatial boundaries. Readers can identify words without cognitive exhaustion.

## Key Recommendations
1. Increase line spacing to at least 1.8x.
2. Avoid pure black text on stark white backgrounds to prevent photopic glare.
3. Use variable typefaces like Lexend engineered specifically for track modulation.`,
      agentSummary: 'Research proves that spacing out letters and lines helps dyslexic reading far more than heavy fonts. Warm background tints prevent eye glare and visual distortion.',
      keyTakeaways: [
        'Inter-letter spacing (+0.12em) eliminates character collision.',
        '1.8x line height prevents accidental line skipping.',
        'Calibrated warm cream backgrounds eliminate photopic glare.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'seed-002',
    title: 'Writing at 10 WPM: Overcoming Motor Fatigue with Shorthand Expansion',
    summary: 'When typing is physically exhausting, hunting for keys drains creative working memory. Here is how telegraphic note-taking changes everything.',
    author: {
      id: 'author-2',
      name: 'Alex Rivera',
      handle: '@alex_creates',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      badge: 'Community Voice',
    },
    category: 'stories' as const,
    tags: ['motor-fatigue', 'shorthand', 'assistive-ai'],
    likesCount: 52,
    commentCount: 7,
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Writing at 10 WPM: Overcoming Motor Fatigue with Shorthand Expansion

When typing requires intense physical effort, your brain spends all its energy finding keys rather than shaping ideas. For those of us writing at 8 to 12 words per minute, traditional document editors are exhausting.

## Moving from Key-Hunting to Intent
Instead of wrestling with full sentences, I write raw fragments:
- "bus ramp broken 4th street need city fix"
- "called transit 3x no reply"

With assistive agents, these fragments expand into complete, well-reasoned advocacy letters without losing my authentic voice.

## Single-Key Review
Editing with a mouse requires fine motor drag. A binary review system—tapping Space to accept a proposal or Backspace to keep my original phrasing—saves thousands of keystrokes each week.`,
      agentSummary: 'Typing slowly depletes mental energy. Writing fragmented notes and having an agent expand them while preserving your voice keeps your energy focused on ideas.',
      keyTakeaways: [
        'Physical key hunting starves creative working memory.',
        'Telegraphic fragments expand cleanly into structured prose.',
        'Binary keyboard review eliminates painful mouse dragging.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'seed-003',
    title: 'Why URL Routing Triggers Spatial Anchor Amnesia for ADHD Minds',
    summary: 'Navigating to a completely new webpage wipes mental coordinates. An in-place synthesis modal preserves spatial orientation seamlessly.',
    author: {
      id: 'author-3',
      name: 'Sam Oakley',
      handle: '@sam_adhd',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
      badge: 'Product Designer',
    },
    category: 'technology' as const,
    tags: ['adhd', 'ux', 'spatial-memory'],
    likesCount: 29,
    commentCount: 3,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Why URL Routing Triggers Spatial Anchor Amnesia for ADHD Minds

In web design, navigating to a new URL is taken for granted. But for individuals with ADHD or traumatic brain injury, wiping the screen clean destroys their mental map.

## The Cognitive Cost of Losing Context
When the previous page disappears, working memory has to reconstruct where you were. You wonder: *Did I finish reading that other post? How many items were in that list?*

## The In-Place Quick Peek Solution
By previewing synthesis in a centered modal while keeping the parent feed visible in the background, your mental spatial landmark remains anchored.`,
      agentSummary: 'Full-page navigation reloads wipe out mental coordinates for ADHD readers. In-place modals preserve context and prevent disorientation.',
      keyTakeaways: [
        'Page hops trigger spatial anchor amnesia.',
        'Centered peek previews maintain working memory.',
        'Instant dismissal restores the exact previous scroll position.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

const SEED_ARTICLES: ArticleDetail[] = SEED_ARTICLES_RAW.map((raw) => ({
  ...raw,
  metrics: calculateReadingMetrics(raw.content.rawMarkdown),
}));

// In-memory fallback for development
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

export async function getFeedItems(limit = 20, category = 'all'): Promise<FeedItem[]> {
  if (hasNetlifyBlobs()) {
    try {
      const feedStore = getStore('feed');
      const { blobs } = await feedStore.list();
      const topKeys = blobs.slice(0, limit).map((b) => b.key);
      const items = await Promise.all(
        topKeys.map(async (key) => (await feedStore.get(key, { type: 'json' })) as FeedItem | null)
      );
      const validItems = items.filter(Boolean) as FeedItem[];
      return category === 'all' 
        ? validItems 
        : validItems.filter((item) => item.category === category);
    } catch {
      // fallback
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
      const articlesStore = getStore('articles');
      const article = await articlesStore.get(id, { type: 'json' });
      if (article) return article as ArticleDetail;
    } catch {
      // fallback
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
