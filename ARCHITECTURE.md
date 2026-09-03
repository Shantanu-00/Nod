# NOD — Full-Stack System Architecture Specification
# Next.js + WebMCP + Zustand + Netlify Blobs
# Project: Accessible Social Article Publishing Platform for People with Disabilities

> **MANDATORY REFERENCE FOR IMPLEMENTATION & AGENTS:**
> This document defines the end-to-end technical architecture, data storage engine, WebMCP integration, API routes, and state flow for **NOD**. All development on this repository must align with the contracts and patterns established here.

---

## 1. High-Level Architecture Overview

NOD is an agent-native, accessible social article publishing platform. It unifies client-side assistive AI actuation with serverless edge persistence into a single Next.js codebase deployed to Netlify.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BROWSER SESSION (Client)                        │
│                                                                        │
│   [ Human User ]               [ Browser AI Agent (ChatGPT/Chrome) ]   │
│         │                                        │                     │
│         │ (interacts via UI)                     │ (calls WebMCP tool) │
│         ▼                                        ▼                     │
│  ┌──────────────┐                       ┌─────────────────┐            │
│  │ UI Component │                       │ WebMCP Handler  │            │
│  └──────┬───────┘                       └────────┬────────┘            │
│         │                                        │                     │
│         ▼                                        ▼                     │
│  ┌────────────────────────────────────────────────────────┐            │
│  │               Zustand Client Store                     │            │
│  │  - Reading preferences (font, bionic, contrast)        │            │
│  │  - Active article state & draft buffer                 │            │
│  │  - ARIA Live Announcements (screen reader friendly)    │            │
│  └──────────────────────────┬─────────────────────────────┘            │
│                             │                                          │
│                             ▼                                          │
│                  fetch('/api/articles', ...)                           │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │ HTTPS Request
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│             NETLIFY SERVERLESS COMPUTE (Next.js App Router)            │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Route Handlers: app/api/articles/route.ts, app/api/feed/route.ts │  │
│  │  - Input validation (Zod)                                        │  │
│  │  - Accessibility scoring calculation (Flesch-Kincaid / metrics)  │  │
│  │  - Ambient Netlify Blobs authentication                          │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ @netlify/blobs SDK
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NETLIFY BLOBS (Distributed Storage)                  │
│                                                                        │
│   Namespace: "feed"                       Namespace: "articles"        │
│   ┌─────────────────────────────┐         ┌────────────────────────┐   │
│   │ Key: <InvertedTime>_<UUID>  │         │ Key: <UUID>            │   │
│   │ 300-byte preview metadata   │         │ Full content AST/HTML  │   │
│   │ (Parallel feed lists <40ms) │         │ (Read on detail view)  │   │
│   └─────────────────────────────┘         └────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Three Tiers

### 2.1. Frontend Tier (Browser Context)
- **Framework**: Next.js App Router (`app/` directory) with React Server Components for initial shell and Client Components (`"use client"`) for dynamic interactive surfaces.
- **Rich Text Editor**: Accessible lightweight block/markdown editor (TipTap / Lexical / custom clean accessible contentEditable) with speech-to-text, phonetic auto-correct hooks, and dyslexia-friendly formatting shortcuts.
- **State Store**: Zustand store (`src/lib/store/useStore.ts`) managing:
  - Reading preferences (font, bionic reading, letter spacing, line height, contrast mode).
  - Draft editor buffer and active article cache.
  - ARIA Live Region announcements (`aria-live="polite"`) triggered whenever either the human or the AI agent makes a mutation.
- **UI Design System**: Conforms strictly to [FRONTEND_DESIGN.md](file:///c:/Users/Admin/Desktop/hackathon/nod/FRONTEND_DESIGN.md) (Obsidian `#0A0B0E` Brand Shell + Electric Lime `#B4F040` Accent + 100% User-Variable Content Canvas).

### 2.2. WebMCP Tier (Browser Context)
- Exposes assistive tools directly via `document.modelContext.registerTool()`.
- **Zero Server Overhead**: The tools run client-side in the user's browser session.
- **Direct Bridge**: When the agent executes a tool like `publish_article` or `adjust_reading_mode`, it calls the exact same local state and HTTP fetch routines as a human clicking a button on screen.
- Conforms strictly to [AGENTS.md](file:///c:/Users/Admin/Desktop/hackathon/nod/AGENTS.md) for schemas, security annotations (`untrustedContentHint: true` on feed reads), and `AbortController` lifecycles.

### 2.3. Backend Tier (Serverless Compute on Netlify)
- **Next.js App Router Handlers**: `app/api/.../route.ts` executed as Netlify Serverless Functions via `@netlify/plugin-nextjs`.
- **Zero-Config Credentials**: In Netlify's execution environment, `@netlify/blobs` automatically picks up ambient site credentials (`NETLIFY_BLOBS_CONTEXT`) without manual token provisioning.
- **Payload Validation**: Zod schemas validate article payloads, word counts, and metadata before persisting.

---

## 3. The Netlify Blobs Storage Engine

Netlify Blobs is an unindexed key-value store. To prevent data corruption, race conditions, and serverless timeouts, the backend implements three mandatory architectural patterns:

### 3.1. Pattern 1: Race-Condition-Free Writes (No Shared File Arrays)
- **The Problem**: Appending posts to a shared `feed.json` file causes fatal race conditions: if User A and User B (or an AI agent) publish concurrently, both read `[1, 2]`. User A writes `[A, 1, 2]`, and User B writes `[B, 1, 2]`, completely erasing Post A.
- **The Solution**: Every article writes to its **own independent key**. Because Article A writes to `feed/keyA` and Article B writes to `feed/keyB`, they touch isolated files. Write collisions and clobbering are physically impossible.

### 3.2. Pattern 2: Two-Store Architecture (Bypassing $N+1$ Serverless Timeouts)
- **The Problem**: If `GET /api/feed` had to fetch full article documents (containing deep document ASTs, base64 images, and detailed revisions) just to render a 20-item feed, 20 outbound requests would transfer megabytes of data, causing serverless CPU/memory exhaustion and slow page loads (>1,500ms).
- **The Solution**: Two distinct Blobs namespaces:

| Namespace | Key Format | Data Stored | Read Scenario | Size |
| :--- | :--- | :--- | :--- | :--- |
| **`feed`** | `${invertedTimestamp}_${articleId}` | **Preview Metadata Only**: ID, title, summary, author, category, tags, a11yScore, readingTime, createdAt | Homepage, topic feeds, search previews | ~300 bytes |
| **`articles`** | `${articleId}` | **Full Article Payload**: Complete body, HTML/markdown, AST blocks, revision history, audio link | Article detail page (`/articles/[id]`) | 5KB – 100KB |

### 3.3. Pattern 3: Inverted Timestamp Keys (Sub-40ms Feed Sorting)
- **The Problem**: Netlify Blobs does not have an `ORDER BY createdAt DESC` SQL query. Its `.list()` API returns keys in standard **lexicographical (ascending alphabetical) order**. A normal timestamp would list the oldest posts first.
- **The Solution**: Invert the timestamp when constructing the key:
  $$\text{InvertedTimestamp} = 9999999999999 - \text{Date.now()}$$
  - A newer post has a *larger* `Date.now()`, which produces a *smaller* inverted number.
  - Because lexicographical sort orders lower numbers first, the **newest posts are naturally at the very beginning of the key list**.
  - When `GET /api/feed` is requested:
    1. Call `feedStore.list({ paginate: false })`.
    2. Slice the top 20 keys.
    3. Call `Promise.all()` to download the 20 tiny 300-byte metadata snippets in parallel.
    4. Return the sorted feed in under **40 milliseconds**.

---

## 4. Canonical Data Schemas

### 4.1. `FeedItem` Schema (Namespace: `feed`)
Stored at: `feed/${invertedTimestamp}_${articleId}`
```typescript
export interface FeedItem {
  id: string;                      // UUIDv4
  title: string;                   // Max 120 chars
  summary: string;                 // Plain-language 1-2 sentence teaser (max 200 chars)
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: 'community' | 'creator' | 'specialist';
  };
  category: 'tips' | 'stories' | 'questions' | 'resources' | 'discussion';
  tags: string[];                  // e.g. ['dyslexia', 'screen-reader', 'adhd']
  a11yMetrics: {
    readingEaseScore: number;      // 0-100 (Flesch-Kincaid derived)
    readingTimeMinutes: number;
    hasAudio: boolean;
    simplificationAvailable: boolean;
  };
  createdAt: string;               // ISO 8601 string
}
```

### 4.2. `ArticleDetail` Schema (Namespace: `articles`)
Stored at: `articles/${articleId}`
```typescript
export interface ArticleDetail {
  id: string;                      // UUIDv4 matching feed item
  title: string;
  summary: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: 'tips' | 'stories' | 'questions' | 'resources' | 'discussion';
  tags: string[];
  content: {
    rawMarkdown: string;           // Canonical text format
    htmlContent: string;           // Sanitized semantic HTML
    simplifiedSummary?: string;    // Pre-computed plain-English cognitive simplification
    audioUrl?: string;             // Text-to-speech audio if generated
  };
  a11yMetrics: {
    readingEaseScore: number;
    readingTimeMinutes: number;
    wordCount: number;
    sentenceCount: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. Backend Route Specifications (App Router)

### 5.1. `GET /api/feed`
- **Purpose**: Fetch paginated community feed sorted newest-first.
- **Query Params**: `?limit=20&category=all`
- **Implementation**:
  ```typescript
  import { getStore } from '@netlify/blobs';

  export async function GET(request: Request) {
    const feedStore = getStore('feed');
    const { blobs } = await feedStore.list();
    
    // Grab the top N keys (already sorted newest-first due to inverted timestamp)
    const topKeys = blobs.slice(0, 20).map(b => b.key);
    
    // Fetch 300-byte metadata snippets in parallel
    const items = await Promise.all(
      topKeys.map(async (key) => await feedStore.get(key, { type: 'json' }))
    );

    return Response.json({
      count: items.length,
      items: items.filter(Boolean)
    });
  }
  ```

### 5.2. `POST /api/articles`
- **Purpose**: Create a new article with atomic dual-store persistence.
- **Request Body**: `{ title, summary, content, category, tags, author }`
- **Implementation**:
  ```typescript
  import { getStore } from '@netlify/blobs';
  import { v4 as uuidv4 } from 'uuid';

  export async function POST(request: Request) {
    const body = await request.json();
    const id = uuidv4();
    const now = Date.now();
    const invertedTime = String(9999999999999 - now).padStart(13, '0');
    const feedKey = `${invertedTime}_${id}`;

    const feedStore = getStore('feed');
    const articlesStore = getStore('articles');

    // Calculate accessibility metrics
    const wordCount = body.content.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
    
    const feedItem: FeedItem = {
      id,
      title: body.title,
      summary: body.summary || body.content.slice(0, 160) + '...',
      author: body.author || { id: 'anon', name: 'Anonymous' },
      category: body.category,
      tags: body.tags || [],
      a11yMetrics: {
        readingEaseScore: calculateReadingEase(body.content),
        readingTimeMinutes,
        hasAudio: false,
        simplificationAvailable: true
      },
      createdAt: new Date(now).toISOString()
    };

    const articleDetail: ArticleDetail = {
      ...feedItem,
      content: {
        rawMarkdown: body.content,
        htmlContent: sanitizeAndRenderHtml(body.content),
        simplifiedSummary: body.simplifiedSummary
      },
      a11yMetrics: {
        ...feedItem.a11yMetrics,
        wordCount,
        sentenceCount: countSentences(body.content)
      },
      updatedAt: new Date(now).toISOString()
    };

    // Dual-store write: independent keys, no race condition
    await Promise.all([
      feedStore.setJSON(feedKey, feedItem),
      articlesStore.setJSON(id, articleDetail)
    ]);

    return Response.json({ success: true, id, feedKey }, { status: 201 });
  }
  ```

### 5.3. `GET /api/articles/[id]`
- **Purpose**: Fetch full article detail for reading canvas.
- **Returns**: Full `ArticleDetail` object.

---

## 6. Client WebMCP Tools Specification

WebMCP tools run exclusively inside the browser tab, registered via `document.modelContext.registerTool()`.

### 6.1. Tool 1: `publish_article`
- **Side Effect**: Mutation. Prompts agent confirmation (deliberately NO `readOnlyHint`).
- **Handler Behavior**:
  1. Fires `POST /api/articles`.
  2. Updates Zustand store with newly created post.
  3. Triggers screen reader announcement: `"Your article [Title] has been published to the community feed."`
  4. Dispatches custom event `'nod:feed-updated'` so the feed re-renders live in front of the watching user.

### 6.2. Tool 2: `adjust_reading_mode`
- **Side Effect**: UI Mutation.
- **Handler Behavior**:
  1. Mutates Zustand `readingPreferences` state (`fontFamily`, `bionicReading`, `contrastTheme`, `letterSpacing`, `lineHeight`, `readingRuler`).
  2. The UI reactively applies CSS custom properties to the Adaptive User Canvas without page reload.
  3. Mascot "Nod" performs a head tilt animation.

### 6.3. Tool 3A: `get_active_article` (Read into Context)
- **Side Effect**: Read (`readOnlyHint: true, untrustedContentHint: true`).
- **Handler Behavior**:
  1. Reads the currently opened article from the Zustand store (`id`, `title`, `rawMarkdown`, `readingEaseScore`).
  2. Injects the raw text directly into the browser agent's LLM context window so the agent can apply cognitive lexical and syntactic simplification.

### 6.4. Tool 3B: `render_simplified_view` (Live DOM Canvas Mutation)
- **Side Effect**: UI Mutation (deliberately NO `readOnlyHint`).
- **Handler Behavior**:
  1. Receives `{ simplifiedContent, keyTakeaways }` directly from the browser AI agent.
  2. Injects the simplified text into the active reading canvas, mounting the non-destructive comparison pill: `[ Original ] ● [ ✨ Simplified by NOD ]`.
  3. Triggers screen reader announcement: `"Article has been simplified into plain English."`
  4. Triggers mascot "Nod" affirmative tilt animation.


### 6.5. Tool 4: `assist_draft_content`
- **Side Effect**: Transform (`readOnlyHint: true`).
- **Handler Behavior**: Takes rough or phonetic speech/text, normalizes spelling and punctuation, and preserves authentic voice.

### 6.6. Tool 5: `search_community_feed`
- **Side Effect**: Read (`readOnlyHint: true, untrustedContentHint: true`).
- **Handler Behavior**: Searches feed items by topic, tag, or reading ease score. Returns `{ query, resultCount, results: [...] }`.

---

## 7. State Management & Accessibility Bridge (Zustand)

The Zustand store binds WebMCP tool execution, human UI clicks, and assistive device notifications:

```typescript
// src/lib/store/useStore.ts
import { create } from 'zustand';

interface ReadingPreferences {
  fontFamily: 'lexend' | 'atkinson-hyperlegible' | 'opendyslexic' | 'system';
  bionicReading: boolean;
  contrastTheme: 'standard' | 'soft-cream' | 'warm-peach' | 'calming-sage' | 'dark' | 'yellow-on-black';
  letterSpacing: 'normal' | 'wide' | 'extra-wide';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  readingRuler: boolean;
}

interface SimplifiedView {
  simplifiedContent: string;
  keyTakeaways: string[];
  isActive: boolean;
}

interface AppState {
  readingPreferences: ReadingPreferences;
  activeArticle: any | null;
  simplifiedView: SimplifiedView;
  mascotMood: 'idle' | 'listening' | 'nodding';
  liveAnnouncement: string;
  setReadingPreferences: (prefs: Partial<ReadingPreferences>) => void;
  setActiveArticle: (article: any) => void;
  setSimplifiedView: (view: Partial<SimplifiedView>) => void;
  setMascotMood: (mood: 'idle' | 'listening' | 'nodding') => void;
  announce: (message: string) => void;
}

export const useStore = create<AppState>((set) => ({
  readingPreferences: {
    fontFamily: 'lexend',
    bionicReading: false,
    contrastTheme: 'soft-cream',
    letterSpacing: 'wide',
    lineHeight: 'relaxed',
    readingRuler: false,
  },
  activeArticle: null,
  simplifiedView: {
    simplifiedContent: '',
    keyTakeaways: [],
    isActive: false,
  },
  mascotMood: 'idle',
  liveAnnouncement: '',
  setReadingPreferences: (prefs) =>
    set((state) => ({
      readingPreferences: { ...state.readingPreferences, ...prefs }
    })),
  setActiveArticle: (article) => set({ activeArticle: article }),
  setSimplifiedView: (view) =>
    set((state) => ({
      simplifiedView: { ...state.simplifiedView, ...view }
    })),
  setMascotMood: (mood) => set({ mascotMood: mood }),
  announce: (message) => set({ liveAnnouncement: message }),
}));
```

### Screen Reader Live Region
Included in root layout (`app/layout.tsx`):
```tsx
<div 
  aria-live="polite" 
  aria-atomic="true" 
  className="sr-only" 
  id="a11y-announcer"
>
  {liveAnnouncement}
</div>
```
Whenever an agent executes an action (e.g. adjusts font or posts an article), `announce("...")` ensures visually impaired users are immediately notified through their screen reader.

---

## 8. Netlify Deployment Architecture

### 8.1. Build Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Security & WebMCP permissions headers
[[headers]]
  for = "/*"
  [headers.values]
    Origin-Agent-Cluster = "?1"
    Permissions-Policy = "tools=(self)"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 8.2. Zero-Config Environment
When deployed to Netlify:
- `@netlify/plugin-nextjs` automatically builds API routes into Netlify Functions.
- `@netlify/blobs` automatically connects using ambient platform tokens.
- For local development, running `npx netlify dev` emulates the Blobs environment locally without needing any cloud credentials.

---

## 9. File Tree Map (Implementation Target)

```
nod/
├── app/
│   ├── layout.tsx                # Root layout with Announcer, Theme Provider, Font loader
│   ├── page.tsx                  # Home feed page (Read, Write, Publish pillars)
│   ├── articles/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Full article reader canvas (Two-Layer Architecture)
│   │   └── new/
│   │       └── page.tsx          # Accessible article composer & assistive draft workspace
│   └── api/
│       ├── feed/
│       │   └── route.ts          # Sub-40ms feed reader from "feed" Blobs store
│       └── articles/
│           ├── route.ts          # Dual-store article creator (POST)
│           └── [id]/
│               └── route.ts      # Full article detail fetcher (GET)
├── src/
│   ├── components/
│   │   ├── brand/
│   │   │   ├── Logo.tsx          # NOD brand logo with responsive signal waves
│   │   │   ├── Mascot.tsx        # Nod 3D mascot avatar with interactive mood states
│   │   │   └── Header.tsx        # Obsidian/Lime brand header & WebMCP status badge
│   │   ├── accessibility/
│   │   │   ├── AccessibilityDock.tsx # Floating bottom dock (Aa ---●--- ☀️)
│   │   │   ├── ReadingRuler.tsx      # Cursor-tracking guide bar
│   │   │   └── BionicText.tsx        # Saccadic fixation word renderer
│   │   ├── feed/
│   │   │   ├── FeedList.tsx      # Community post stream with accessibility badges
│   │   │   └── ArticleCard.tsx   # Card preview with reading ease score
│   │   └── editor/
│   │       ├── AccessibleEditor.tsx # Voice/text composer with assist panel
│   │       └── AssistPanel.tsx   # Live simplification & phonetic proofreader
│   ├── lib/
│   │   ├── webmcp/
│   │   │   ├── register.ts       # Imperative document.modelContext registration loop
│   │   │   ├── tools.ts          # Definitions for 5 canonical accessibility tools
│   │   │   └── useWebMCP.ts      # React lifecycle hook (AbortController cleanup)
│   │   ├── store/
│   │   │   └── useStore.ts       # Zustand store for reading prefs & a11y announcements
│   │   └── utils/
│   │       ├── a11y-metrics.ts   # Flesch-Kincaid & sentence complexity parser
│   │       └── bionic.ts         # Fast bionic reading text transformer
│   └── styles/
│       └── globals.css           # Brand shell tokens & Adaptive canvas CSS variables
├── assets/
│   └── brand/                    # Visual identity renders (mascot, brand board)
├── AGENTS.md                     # WebMCP AI alignment contract & schemas
├── FRONTEND_DESIGN.md            # Brand design tokens & two-layer canvas ideology
├── ARCHITECTURE.md               # This document (Technical Architecture Specification)
├── netlify.toml                  # Netlify deployment & permissions policy headers
└── package.json                  # Next.js, @netlify/blobs, zustand, lucide-react
```

---

## 10. Execution Checklist for Developers & Agents

Before committing changes, verify:
- [ ] Writes write to individual keys (`feed/<key>` and `articles/<id>`). No shared JSON array appending.
- [ ] Feed keys use inverted timestamps: `(9999999999999 - Date.now()).toString()`.
- [ ] Feed items are compact (~300 bytes). Full content lives only in the `articles` namespace.
- [ ] Client WebMCP tools are registered via `document.modelContext.registerTool(..., { signal })`.
- [ ] Any mutation tool dispatches visible UI updates and updates the Zustand store.
- [ ] Screen reader announcements are triggered for agent actuation via `#a11y-announcer`.
- [ ] Content reading canvas respects CSS custom variables and avoids pure `#000` on `#FFF`.
