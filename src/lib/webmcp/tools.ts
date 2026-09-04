import { useStore } from '@/lib/store/useStore';
import { ContrastTheme, FontFamilyPreference, LetterSpacing, LineHeight } from '@/types';

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: any) => Promise<any>;
}

// Handler for reading mode and typography adaptation
async function executeAdaptReadingView(params: {
  fontFamily?: FontFamilyPreference;
  bionicReading?: boolean;
  letterSpacing?: LetterSpacing;
  lineHeight?: LineHeight;
  contrastTheme?: ContrastTheme;
  readingRuler?: boolean;
}) {
  const store = useStore.getState();
  store.setReadingPreferences(params);
  store.setDockOpen(false);
  store.showToast('✓ Reading mode configuration applied by NOD Agent');
  store.announce('Reading mode and typography adjusted.');
  store.setMascotMood('nodding');
  setTimeout(() => store.setMascotMood('idle'), 2000);
  return {
    success: true,
    message: 'Reading mode and typography updated live on canvas.',
    activePreferences: useStore.getState().readingPreferences,
  };
}

// Handler for RSVP / Zero-Saccade focal reader
async function executeControlRsvpReader({
  action = 'start',
  wpm,
  text,
}: {
  action?: 'start' | 'pause' | 'resume' | 'stop' | 'set_speed';
  wpm?: number;
  text?: string;
}) {
  const store = useStore.getState();

  if (action === 'start') {
    const targetText = text || store.activeArticle?.content.rawMarkdown || store.activeArticle?.summary || '';
    if (!targetText || targetText.trim().length === 0) {
      throw new Error('Cannot start RSVP reader: No text provided and no active article is currently open.');
    }
    const targetWpm = wpm && wpm >= 50 ? wpm : 250;
    store.openFocalReader(targetText, targetWpm);
    store.showToast(`✓ Zero-Saccade Reader started (${targetWpm} WPM)`);
    store.setMascotMood('nodding');
    setTimeout(() => store.setMascotMood('idle'), 2000);
    return {
      success: true,
      action: 'start',
      wpm: targetWpm,
      wordCount: useStore.getState().focalReader.words.length,
      message: 'Zero-Saccade stationary RSVP reader launched and streaming.',
    };
  }

  if (action === 'pause') {
    store.pauseFocalReader();
    store.showToast('RSVP Reader paused');
    return {
      success: true,
      action: 'pause',
      currentIndex: store.focalReader.currentIndex,
      totalWords: store.focalReader.words.length,
      message: 'RSVP reader paused.',
    };
  }

  if (action === 'resume') {
    store.playFocalReader();
    store.showToast('RSVP Reader resumed');
    return {
      success: true,
      action: 'resume',
      currentIndex: store.focalReader.currentIndex,
      totalWords: store.focalReader.words.length,
      message: 'RSVP reader resumed.',
    };
  }

  if (action === 'stop') {
    store.closeFocalReader();
    store.showToast('RSVP Reader closed');
    return {
      success: true,
      action: 'stop',
      message: 'RSVP reader closed.',
    };
  }

  if (action === 'set_speed') {
    if (!wpm || wpm < 50 || wpm > 1200) {
      throw new Error('Speed (wpm) is required and must be between 50 and 1200.');
    }
    store.setFocalReaderSpeed(wpm);
    store.showToast(`Pace updated to ${wpm} WPM`);
    return {
      success: true,
      action: 'set_speed',
      wpm,
      message: `Reading speed adjusted to ${wpm} words per minute.`,
    };
  }

  throw new Error(`Unknown action "${action}". Valid actions: start, pause, resume, stop, set_speed.`);
}

// Handler for peek article
async function executeRenderContentPeek({
  articleId,
  simplifiedContent,
  keyTakeaways,
}: {
  articleId: string;
  simplifiedContent?: string;
  keyTakeaways?: string[];
}) {
  if (!articleId || typeof articleId !== 'string') {
    throw new Error('Article ID is required to generate peek.');
  }
  const store = useStore.getState();

  // 1. Fetch or get article details so activeArticle is populated immediately
  let article = store.activeArticle?.id === articleId ? store.activeArticle : null;
  if (!article) {
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(articleId)}`);
      if (res.ok) {
        article = await res.json();
        store.setActiveArticle(article);
      }
    } catch (err) {
      console.error('Failed to prefetch article for peek:', err);
    }
  }

  // 2. Open Peek in store
  store.setPeekArticleId(articleId);

  // 3. Conflict resolution & population:
  // If agent supplied direct synthesis parameters in this call, set them
  if (simplifiedContent && simplifiedContent.trim().length >= 10) {
    store.setSimplifiedView({
      articleId,
      simplifiedContent: simplifiedContent.trim(),
      keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
      isActive: true,
    });
  } else if (store.simplifiedView.articleId !== articleId) {
    // Switching to a different article: clear stale synthesis from previous article
    if (article?.content?.agentSummary) {
      store.setSimplifiedView({
        articleId,
        simplifiedContent: article.content.agentSummary,
        keyTakeaways: article.content.keyTakeaways || [],
        isActive: true,
      });
    } else {
      store.setSimplifiedView({
        articleId,
        simplifiedContent: '',
        keyTakeaways: [],
        isActive: false,
      });
    }
  }

  const hasLiveSynthesis = Boolean(
    store.simplifiedView.articleId === articleId &&
    store.simplifiedView.isActive &&
    store.simplifiedView.simplifiedContent
  );

  const displayTitle = article?.title || articleId;
  store.showToast(`✓ Quick Peek opened: ${displayTitle}`);
  store.setMascotMood('nodding');
  setTimeout(() => store.setMascotMood('idle'), 2000);

  return {
    success: true,
    articleId,
    title: article?.title || 'Article Preview',
    category: article?.category || 'general',
    clarityGrade: article?.metrics?.clarityGrade || 'Standard',
    content: article?.content?.rawMarkdown || '',
    currentSummary: hasLiveSynthesis
      ? store.simplifiedView.simplifiedContent
      : article?.content?.agentSummary || article?.summary || '',
    keyTakeaways: hasLiveSynthesis
      ? store.simplifiedView.keyTakeaways
      : article?.content?.keyTakeaways || [],
    hasAgentSynthesis: hasLiveSynthesis || Boolean(article?.content?.agentSummary),
    message: hasLiveSynthesis
      ? `Quick Peek opened with active plain-language synthesis for "${displayTitle}". You can refine it with render_simplified_view if desired.`
      : `Quick Peek card opened on screen for "${displayTitle}". Full article markdown is returned above. You can now analyze it and call render_simplified_view({ simplifiedContent, keyTakeaways }) to layer a plain-language summary onto the user's screen.`,
  };
}

// Handler for structuring authoring section
async function executeStructureAuthoringSection({
  rawText,
  proposal,
  title,
  intent = 'expand_telegraphic_shorthand',
}: {
  rawText?: string;
  proposal?: string;
  title?: string;
  intent?: string;
}) {
  const store = useStore.getState();
  const input = proposal || rawText || store.editorDraft.content;
  if (!input || input.trim().length < 3) {
    throw new Error('Input text must be at least 3 characters. Provide raw thoughts or type in editor.');
  }

  // If a ready-made proposal was provided, use it; otherwise perform clean voice-preserving expansion
  let expanded = input.trim();
  if (!proposal && intent === 'expand_telegraphic_shorthand') {
    expanded = input
      .split('\n')
      .map((line) => {
        const clean = line.replace(/^[-*•]\s*/, '').trim();
        if (!clean) return '';
        const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
        return cap.endsWith('.') ? cap : `${cap}.`;
      })
      .filter(Boolean)
      .join(' ');
  }

  store.proposeEditorDraft({ proposedText: expanded, proposedTitle: title });

  return {
    success: true,
    original: input,
    proposal: expanded,
    wordCount: expanded.split(/\s+/).length,
    message: 'Expansion structured and presented in the Binary Review Card on screen.',
  };
}

// Handler for pull quote insertion
async function executeInsertInteractiveQuote({ quote, attribution }: { quote: string; attribution?: string }) {
  if (!quote || quote.trim().length < 3) {
    throw new Error('Quote must contain at least 3 characters.');
  }
  const store = useStore.getState();
  store.insertPullQuote(quote, attribution);
  return {
    success: true,
    message: 'Accessible pull quote formatted with blockquote structure and placed in active draft.',
  };
}

// Handler for two-step staging and publishing
async function executeStageAndPublishPost({
  title,
  content,
  category = 'strategies',
  tags = [],
  immediate = false,
}: {
  title?: string;
  content?: string;
  category?: any;
  tags?: string[];
  immediate?: boolean;
}) {
  const store = useStore.getState();
  const targetTitle = title?.trim() || store.editorDraft.title.trim();
  const targetContent = content?.trim() || store.editorDraft.content.trim();

  if (!targetTitle || targetTitle.length < 3) {
    throw new Error('Post title is required and must contain at least 3 characters.');
  }
  if (!targetContent || targetContent.length < 10) {
    throw new Error('Post content is required and must contain at least 10 characters.');
  }

  // If immediate flag is explicitly set, write directly to Netlify Blobs
  if (immediate) {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: targetTitle,
        content: targetContent,
        category,
        tags,
        author: { id: 'agent-user', name: store.editorDraft.authorName || 'Community Member' },
      }),
    });
    if (!res.ok) throw new Error(`Publish failed: HTTP ${res.status}`);
    const result = await res.json();
    store.announce(`Story "${targetTitle}" published successfully.`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nod:feed-updated'));
    }
    return {
      success: true,
      published: true,
      id: result.id,
      message: `Story "${targetTitle}" published directly to community feed.`,
    };
  }

  // Standard Two-Step Flow: Stage post and mount on-screen Approval Card
  const staged = store.stagePost({
    title: targetTitle,
    content: targetContent,
    category,
    tags,
  });

  return {
    success: true,
    staged: true,
    title: staged.title,
    category: staged.category,
    wordCount: staged.metrics.wordCount,
    clarityGrade: staged.metrics.clarityGrade,
    message: 'Post staged for review. The on-screen Publishing Approval Card is now awaiting the human user\'s confirmation.',
  };
}

// All canonical WebMCP tool definitions
export function createCanonicalWebMCPTools(): WebMCPToolDefinition[] {
  return [
    // 1. ADAPT READING VIEW (Canonical Write-Up Name + adjust_reading_mode)
    {
      name: 'adapt_reading_view',
      description: 'Adapts the active reading environment, typography (Lexend, Atkinson, OpenDyslexic), line/letter spacing, contrast themes (soft-cream, warm-peach, calming-sage, yellow-on-black), bionic reading, and reading ruler to eliminate visual crowding.',
      inputSchema: {
        type: 'object',
        properties: {
          fontFamily: {
            type: 'string',
            enum: ['lexend', 'atkinson', 'opendyslexic', 'system'],
            description: 'Accessible typeface preference to aid character discrimination.'
          },
          bionicReading: {
            type: 'boolean',
            description: 'When true, highlights the initial letters of words to guide eye fixations.'
          },
          letterSpacing: {
            type: 'string',
            enum: ['normal', 'wide', 'extra-wide'],
            description: 'Character tracking to prevent visual crowding.'
          },
          lineHeight: {
            type: 'string',
            enum: ['normal', 'relaxed', 'loose'],
            description: 'Vertical line leading between lines of text.'
          },
          contrastTheme: {
            type: 'string',
            enum: ['soft-cream', 'warm-peach', 'calming-sage', 'muted-slate', 'yellow-on-black'],
            description: 'High-contrast or tinted background to eliminate photopic glare and halation.'
          },
          readingRuler: {
            type: 'boolean',
            description: 'Toggles a translucent horizontal reading guide bar under the cursor.'
          }
        }
      },
      execute: executeAdaptReadingView,
    },
    // Alias: adjust_reading_mode
    {
      name: 'adjust_reading_mode',
      description: 'Controls visual accessibility overlays, contrast themes, and spacing to eliminate visual stress and crowding.',
      inputSchema: {
        type: 'object',
        properties: {
          fontFamily: { type: 'string', enum: ['lexend', 'atkinson', 'opendyslexic', 'system'] },
          bionicReading: { type: 'boolean' },
          letterSpacing: { type: 'string', enum: ['normal', 'wide', 'extra-wide'] },
          lineHeight: { type: 'string', enum: ['normal', 'relaxed', 'loose'] },
          contrastTheme: { type: 'string', enum: ['soft-cream', 'warm-peach', 'calming-sage', 'muted-slate', 'yellow-on-black'] },
          readingRuler: { type: 'boolean' }
        }
      },
      execute: executeAdaptReadingView,
    },

    // 2. ACTIVATE RSVP READER (Canonical Write-Up Name + control_focal_reader)
    {
      name: 'activate_rsvp_reader',
      description: 'Controls the assistive stationary RSVP (Rapid Serial Visual Presentation) reader with fixed Optimal Recognition Point (ORP) optical anchor to eliminate saccadic eye fatigue. Supports pace (180–350+ WPM).',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['start', 'pause', 'resume', 'stop', 'set_speed'],
            description: 'Action to perform: start (defaults to active article or custom text), pause, resume, stop, or set_speed.'
          },
          wpm: {
            type: 'number',
            description: 'Reading pace in words per minute (e.g. 200, 250, 320). Defaults to 250.'
          },
          text: {
            type: 'string',
            description: 'Optional custom text to stream through the focal recognition point.'
          }
        }
      },
      execute: executeControlRsvpReader,
    },
    // Alias: control_focal_reader
    {
      name: 'control_focal_reader',
      description: 'Controls the Zero-Saccade / RSVP focal reader with ORP anchor. Supports start, pause, resume, stop, set_speed.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['start', 'pause', 'resume', 'stop', 'set_speed'] },
          wpm: { type: 'number' },
          text: { type: 'string' }
        }
      },
      execute: executeControlRsvpReader,
    },

    // 3. RENDER CONTENT PEEK (Canonical Write-Up Name + peek_article)
    {
      name: 'render_content_peek',
      description: 'Mounts the in-page Zero-Disorientation Quick Peek modal for an article. Returns the full markdown and existing summary so the agent can inspect or immediately provide a simplified synthesis.',
      inputSchema: {
        type: 'object',
        properties: {
          articleId: {
            type: 'string',
            description: 'The ID of the article to preview (e.g. "seed-001", "seed-002").'
          },
          simplifiedContent: {
            type: 'string',
            description: 'Optional plain-language synthesis to immediately layer onto the peek modal.'
          },
          keyTakeaways: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional 3 to 5 bulleted takeaway points for working memory support.'
          }
        },
        required: ['articleId']
      },
      execute: executeRenderContentPeek,
    },
    // Alias: peek_article
    {
      name: 'peek_article',
      description: 'Opens the centered Zero-Disorientation Quick Peek modal for an article and returns full article content.',
      inputSchema: {
        type: 'object',
        properties: {
          articleId: { type: 'string', description: 'Article ID to preview.' },
          simplifiedContent: { type: 'string', description: 'Optional plain-language synthesis.' },
          keyTakeaways: { type: 'array', items: { type: 'string' }, description: 'Optional bulleted takeaways.' }
        },
        required: ['articleId']
      },
      execute: executeRenderContentPeek,
    },
    {
      name: 'close_peek',
      description: 'Closes the active Zero-Disorientation Quick Peek card or modal.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        useStore.getState().setPeekArticleId(null);
        return { success: true, message: 'Quick Peek card closed.' };
      }
    },

    // 4. STRUCTURE AUTHORING SECTION (Canonical Write-Up Name + propose_editor_expansion)
    {
      name: 'structure_authoring_section',
      description: 'Assists the author by expanding fragmented shorthand thoughts into coherent prose while strictly preserving their authentic voice, and opens the Binary Review card on screen.',
      inputSchema: {
        type: 'object',
        properties: {
          rawText: {
            type: 'string',
            description: 'Unpolished shorthand or fragmented notes. If omitted, uses current composer text.'
          },
          proposal: {
            type: 'string',
            description: "Expanded prose structured in accessible markdown. Use '## ' headings, '**bold**' anchor concepts, short 2-3 sentence paragraphs, and bullet points to eliminate cognitive crowding."
          },
          title: {
            type: 'string',
            description: 'Suggested headline for the piece (optional).'
          },
          intent: {
            type: 'string',
            enum: ['expand_telegraphic_shorthand', 'spelling_grammar_cleanup', 'shorten_and_clarify'],
            description: 'Specific editorial transformation desired.'
          }
        }
      },
      execute: executeStructureAuthoringSection,
    },
    // Alias: propose_editor_expansion
    {
      name: 'propose_editor_expansion',
      description: 'Injects an expanded article draft directly into the author\'s editor and opens the Binary Gatekeeper Review Modal on screen.',
      inputSchema: {
        type: 'object',
        properties: {
          proposal: { 
            type: 'string', 
            description: "The expanded fluent prose in accessible markdown. Use '## ' headings, '**bold**' key terms, and bulleted lists." 
          },
          title: { type: 'string', description: 'Suggested title.' }
        },
        required: ['proposal']
      },
      execute: executeStructureAuthoringSection,
    },
    // Alias: assist_draft_content
    {
      name: 'assist_draft_content',
      description: 'Expands shorthand or phonetic text into clear sentences while preserving voice. Formats output with accessible markdown (##, **, -).',
      inputSchema: {
        type: 'object',
        properties: {
          rawText: { type: 'string' },
          intent: { type: 'string', enum: ['spelling_grammar_cleanup', 'shorten_and_clarify', 'expand_telegraphic_shorthand'] }
        }
      },
      execute: executeStructureAuthoringSection,
    },

    // 5. INSERT INTERACTIVE QUOTE (Canonical Write-Up Name + insert_pull_quote)
    {
      name: 'insert_interactive_quote',
      description: 'Turns an idea into an accessible pull quote with semantic blockquote structure, attribution, and visual emphasis in the active draft.',
      inputSchema: {
        type: 'object',
        properties: {
          quote: {
            type: 'string',
            description: 'The memorable quote statement to highlight.'
          },
          attribution: {
            type: 'string',
            description: 'Speaker, source, or author attribution (optional).'
          }
        },
        required: ['quote']
      },
      execute: executeInsertInteractiveQuote,
    },
    // Alias: insert_pull_quote
    {
      name: 'insert_pull_quote',
      description: 'Inserts an accessible formatted pull quote with attribution into the active article draft.',
      inputSchema: {
        type: 'object',
        properties: {
          quote: { type: 'string' },
          attribution: { type: 'string' }
        },
        required: ['quote']
      },
      execute: executeInsertInteractiveQuote,
    },

    // 6. STAGE AND PUBLISH POST (Canonical Write-Up Name: Two-Step Publishing Approval Flow)
    {
      name: 'stage_and_publish_post',
      description: 'Stages a post and mounts the on-screen Approval Card for explicit human confirmation before persisting to the community feed. Keeps human in full editorial control.',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Accessible title of the post (under 120 characters).'
          },
          content: {
            type: 'string',
            description: "Richly structured markdown for neurodivergent readers. MUST use '## ' section headers every 2-3 paragraphs, '**bold**' on key anchor concepts, '-' for bullet lists, and '>' for quotes. Keep paragraphs under 3 sentences to avoid visual crowding."
          },
          category: {
            type: 'string',
            enum: ['strategies', 'stories', 'technology', 'discussion'],
            description: 'Topic category tag.'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Topic tags (e.g. ["adhd", "focus", "reading"]).'
          }
        },
        required: ['title', 'content']
      },
      execute: executeStageAndPublishPost,
    },
    // Alias: publish_article
    {
      name: 'publish_article',
      description: 'Prepares and publishes an article to the community feed (stages for review by default). Uses structured accessible markdown.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the post (under 120 characters).' },
          content: { 
            type: 'string', 
            description: "Body markdown. MUST format with '## ' headers, '**bold**' anchor concepts, and '-' bullet lists for accessibility." 
          },
          category: { type: 'string', enum: ['strategies', 'stories', 'technology', 'discussion'] },
          tags: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'content']
      },
      execute: executeStageAndPublishPost,
    },

    // 7. GET ACTIVE ARTICLE (Cognitive Reading Support - Read into LLM)
    {
      name: 'get_active_article',
      description: 'Reads the active article markdown content, title, and clarity score directly into the agent context for cognitive analysis or simplification.',
      inputSchema: { type: 'object', properties: {} },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true,
      },
      execute: async () => {
        const store = useStore.getState();
        let article = store.activeArticle;

        // If activeArticle is not yet in store but a peek is active, fetch it
        if (!article && store.peekArticleId) {
          try {
            const res = await fetch(`/api/articles/${encodeURIComponent(store.peekArticleId)}`);
            if (res.ok) {
              article = await res.json();
              store.setActiveArticle(article);
            }
          } catch (err) {
            console.error('get_active_article peek fetch failed:', err);
          }
        }

        if (!article) {
          throw new Error('No article is currently open. Please navigate to an article or call render_content_peek first.');
        }

        const hasLiveSynthesis = Boolean(
          store.simplifiedView.articleId === article.id &&
          store.simplifiedView.isActive &&
          store.simplifiedView.simplifiedContent
        );

        return {
          id: article.id,
          title: article.title,
          summary: article.summary,
          content: article.content.rawMarkdown,
          category: article.category,
          clarityScore: article.metrics.clarityScore,
          clarityGrade: article.metrics.clarityGrade,
          wordCount: article.metrics.wordCount,
          sentenceCount: article.metrics.sentenceCount,
          currentAgentSummary: hasLiveSynthesis
            ? store.simplifiedView.simplifiedContent
            : article.content.agentSummary || null,
          currentKeyTakeaways: hasLiveSynthesis
            ? store.simplifiedView.keyTakeaways
            : article.content.keyTakeaways || [],
        };
      }
    },

    // 8. RENDER SIMPLIFIED VIEW (Plain-English Live Canvas Mutation)
    {
      name: 'render_simplified_view',
      description: 'Renders the agent-simplified plain-English text and key takeaways directly onto the active reading canvas or peek modal with an in-place non-destructive comparison switch.',
      inputSchema: {
        type: 'object',
        properties: {
          simplifiedContent: {
            type: 'string',
            description: 'The plain-language, short-sentence simplified version of the article.'
          },
          keyTakeaways: {
            type: 'array',
            items: { type: 'string' },
            description: '3 to 5 high-level bulleted summary points for working memory support.'
          }
        },
        required: ['simplifiedContent']
      },
      execute: async ({ simplifiedContent, keyTakeaways = [] }: { simplifiedContent: string; keyTakeaways?: string[] }) => {
        if (!simplifiedContent || simplifiedContent.trim().length < 10) {
          throw new Error('Simplified content must contain at least 10 characters.');
        }
        const store = useStore.getState();
        const targetArticleId = store.peekArticleId || store.activeArticle?.id;

        // Detect if this updates an existing synthesis or adds a fresh one
        const isOverwrite = Boolean(
          store.simplifiedView.isActive &&
          store.simplifiedView.simplifiedContent &&
          store.simplifiedView.articleId === targetArticleId
        );

        store.setSimplifiedView({
          articleId: targetArticleId || undefined,
          simplifiedContent: simplifiedContent.trim(),
          keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
          isActive: true,
        });

        const toastMsg = isOverwrite
          ? '✓ Plain-language view refreshed by Agent'
          : '✓ Plain-language view rendered by NOD Agent';

        store.showToast(toastMsg);
        store.announce('Article has been simplified into plain English.');
        store.setMascotMood('nodding');
        setTimeout(() => store.setMascotMood('idle'), 2500);

        return {
          success: true,
          articleId: targetArticleId,
          isOverwrite,
          message: isOverwrite
            ? 'Updated existing plain-language view with refreshed agent synthesis.'
            : 'Simplified view rendered live on canvas with comparison switch.',
        };
      }
    },

    // 9. SEARCH COMMUNITY FEED (Discover Community Strategies)
    {
      name: 'search_community_feed',
      description: 'Searches published community articles, accessibility accommodations, and discussions by keyword and topic category.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search keywords, e.g. "dyslexia", "spacing", "adhd", "screen reader".'
          },
          category: {
            type: 'string',
            enum: ['all', 'strategies', 'stories', 'technology', 'discussion'],
            description: 'Filter by topic tag.'
          }
        },
        required: ['query']
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true,
      },
      execute: async ({ query, category = 'all' }: { query: string; category?: string }) => {
        if (!query || query.trim().length < 2) {
          throw new Error('Query must be at least 2 characters.');
        }
        const res = await fetch(`/api/feed?category=${encodeURIComponent(category)}`);
        const data = await res.json();
        const lowerQ = query.toLowerCase();

        const matched = (data.items || []).filter((item: any) =>
          item.title.toLowerCase().includes(lowerQ) ||
          item.summary.toLowerCase().includes(lowerQ) ||
          (item.tags && item.tags.some((t: string) => t.toLowerCase().includes(lowerQ)))
        );

        return {
          query,
          category,
          resultCount: matched.length,
          results: matched.slice(0, 5),
        };
      }
    },
    // Alias: search_discussions
    {
      name: 'search_discussions',
      description: 'Searches community discussions and resources.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Keywords.' },
          category: { type: 'string', enum: ['all', 'strategies', 'stories', 'technology', 'discussion'] }
        },
        required: ['query']
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async ({ query, category = 'all' }: { query: string; category?: string }) => {
        const res = await fetch(`/api/feed?category=${encodeURIComponent(category)}`);
        const data = await res.json();
        const lowerQ = query.toLowerCase();
        const matched = (data.items || []).filter((item: any) =>
          item.title.toLowerCase().includes(lowerQ) ||
          item.summary.toLowerCase().includes(lowerQ) ||
          (item.tags && item.tags.some((t: string) => t.toLowerCase().includes(lowerQ)))
        );
        return { query, category, resultCount: matched.length, results: matched.slice(0, 5) };
      }
    },

    // 10. POST COMMENT (Social Participation)
    {
      name: 'post_comment',
      description: 'Adds an accessible comment or supportive response to the currently active article.',
      inputSchema: {
        type: 'object',
        properties: {
          articleId: {
            type: 'string',
            description: 'ID of the article being commented on.'
          },
          content: {
            type: 'string',
            description: 'Body text of the comment.'
          }
        },
        required: ['articleId', 'content']
      },
      execute: async ({ articleId, content }: { articleId: string; content: string }) => {
        if (!content || content.trim().length < 2) throw new Error('Comment must not be empty.');

        const res = await fetch(`/api/articles/${articleId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            author: { id: 'user-guest', name: 'Kind Reader' },
          }),
        });

        if (!res.ok) throw new Error('Failed to post comment.');
        const store = useStore.getState();
        store.announce('Comment posted successfully.');
        store.setMascotMood('nodding');
        setTimeout(() => store.setMascotMood('idle'), 2000);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nod:comment-added'));
        }

        return { success: true, message: 'Comment posted.' };
      }
    },

    // 11. GET EDITOR DRAFT (Composer State Read)
    {
      name: 'get_editor_draft',
      description: 'Reads the active composer draft (headline, raw shorthand notes, category, word count) into the agent context.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        const store = useStore.getState();
        const draft = store.editorDraft;
        const wordCount = draft.content ? draft.content.trim().split(/\s+/).filter(Boolean).length : 0;
        return {
          title: draft.title || '',
          content: draft.content || '',
          category: draft.category,
          tags: draft.tags,
          authorName: draft.authorName,
          wordCount,
          hasDraft: Boolean(draft.content && draft.content.trim().length > 0),
        };
      }
    },
  ];
}

/**
 * Returns the optimal 4 to 6 view-scoped WebMCP tools based on active route.
 * Prevents LLM tool selection paralysis and out-of-context execution errors.
 */
export function getViewScopedTools(pathname: string): WebMCPToolDefinition[] {
  const allTools = createCanonicalWebMCPTools();
  const getTool = (name: string) => allTools.find((t) => t.name === name);

  // Authoring / Composer View (/articles/new)
  if (pathname.includes('/articles/new')) {
    return [
      getTool('adapt_reading_view'),
      getTool('get_editor_draft'),
      getTool('structure_authoring_section'),
      getTool('insert_interactive_quote'),
      getTool('stage_and_publish_post'),
    ].filter(Boolean) as WebMCPToolDefinition[];
  }

  // Article Reading View (/articles/[id])
  if (pathname.includes('/articles/') && !pathname.includes('/articles/new')) {
    return [
      getTool('adapt_reading_view'),
      getTool('activate_rsvp_reader'),
      getTool('get_active_article'),
      getTool('render_simplified_view'),
      getTool('post_comment'),
    ].filter(Boolean) as WebMCPToolDefinition[];
  }

  // Feed & Home View (/)
  return [
    getTool('adapt_reading_view'),
    getTool('activate_rsvp_reader'),
    getTool('search_community_feed'),
    getTool('render_content_peek'),
    getTool('get_active_article'),
    getTool('render_simplified_view'),
    getTool('stage_and_publish_post'),
  ].filter(Boolean) as WebMCPToolDefinition[];
}
