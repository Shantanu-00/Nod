import { create } from 'zustand';
import { 
  ReadingPreferences, 
  SimplifiedView, 
  MascotMood, 
  ArticleDetail,
  StagedPost 
} from '@/types';
import { tokenizeWords } from '@/lib/utils/rsvp';
import { calculateReadingMetrics, extractArticleSummary } from '@/lib/utils/a11y-metrics';

interface AppState {
  // Reading & Ergonomics
  readingPreferences: ReadingPreferences;
  setReadingPreferences: (prefs: Partial<ReadingPreferences>) => void;
  resetReadingPreferences: () => void;

  // Active Article Reading State
  activeArticle: ArticleDetail | null;
  setActiveArticle: (article: ArticleDetail | null) => void;

  // In-Place Plain English Simplification
  simplifiedView: SimplifiedView;
  setSimplifiedView: (view: Partial<SimplifiedView>) => void;
  toggleSimplifiedView: () => void;

  // Zero-Disorientation Inline Peek Drawer
  peekArticleId: string | null;
  setPeekArticleId: (id: string | null) => void;

  // Mascot Physical State
  mascotMood: MascotMood;
  setMascotMood: (mood: MascotMood) => void;

  // Accessibility Live Announcer (Screen Reader Bridge)
  liveAnnouncement: string;
  announce: (message: string) => void;

  // WebMCP Active Status
  isWebMCPAvailable: boolean;
  registeredToolCount: number;
  setWebMCPStatus: (available: boolean, count: number) => void;

  // Agent Simulator Drawer (for demos without Chrome 149+)
  isSimulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;

  // Accessibility Dock & Timed Confirmation Toast
  isDockOpen: boolean;
  setDockOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Zero-Saccade Focal Reader (RSVP with ORP)
  focalReader: {
    isOpen: boolean;
    isPlaying: boolean;
    words: string[];
    currentIndex: number;
    wpm: number;
    rawText: string;
  };
  openFocalReader: (text?: string, wpm?: number) => void;
  closeFocalReader: () => void;
  playFocalReader: () => void;
  pauseFocalReader: () => void;
  toggleFocalReaderPlay: () => void;
  setFocalReaderSpeed: (wpm: number) => void;
  setFocalReaderIndex: (index: number) => void;
  stepFocalReader: (delta: number) => void;

  // Assisted Writing Studio & Agent Draft State
  editorDraft: {
    title: string;
    content: string;
    category: 'strategies' | 'stories' | 'technology' | 'discussion';
    tags: string[];
    authorName: string;
    handle: string;
    proposedText: string | null;
    proposedTitle: string | null;
  };
  setEditorDraft: (draft: Partial<AppState['editorDraft']>) => void;
  proposeEditorDraft: (proposal: { proposedText: string; proposedTitle?: string }) => void;
  acceptEditorProposal: () => void;
  rejectEditorProposal: () => void;
  insertPullQuote: (quote: string, attribution?: string) => void;
  
  // Two-Step Publishing Approval State & Human-in-the-Loop Actions
  stagedPost: StagedPost | null;
  stagePost: (post: {
    title: string;
    content: string;
    summary?: string;
    category?: StagedPost['category'];
    tags?: string[];
    authorName?: string;
    handle?: string;
  }) => StagedPost;
  confirmPublishStagedPost: () => Promise<{ success: boolean; id?: string; error?: string }>;
  cancelStagedPost: () => void;
}

const defaultPreferences: ReadingPreferences = {
  fontFamily: 'system',
  bionicReading: false,
  contrastTheme: 'soft-cream',
  letterSpacing: 'normal',
  lineHeight: 'normal',
  fontSizeRem: 1.0625,
  readingRuler: false,
  focusMode: false,
};

export const useStore = create<AppState>((set, get) => ({
  readingPreferences: defaultPreferences,
  setReadingPreferences: (prefs) =>
    set((state) => ({
      readingPreferences: { ...state.readingPreferences, ...prefs },
    })),
  resetReadingPreferences: () =>
    set({ readingPreferences: defaultPreferences }),

  activeArticle: null,
  setActiveArticle: (article) => set({ activeArticle: article }),

  simplifiedView: {
    simplifiedContent: '',
    keyTakeaways: [],
    isActive: false,
    articleId: undefined,
  },
  setSimplifiedView: (view) =>
    set((state) => ({
      simplifiedView: { ...state.simplifiedView, ...view },
    })),
  toggleSimplifiedView: () =>
    set((state) => ({
      simplifiedView: {
        ...state.simplifiedView,
        isActive: !state.simplifiedView.isActive,
      },
    })),

  peekArticleId: null,
  setPeekArticleId: (id) => set({ peekArticleId: id }),

  mascotMood: 'idle',
  setMascotMood: (mood) => set({ mascotMood: mood }),

  liveAnnouncement: '',
  announce: (message) => {
    // Clear and re-set to force assistive technology to announce duplicate messages
    set({ liveAnnouncement: '' });
    setTimeout(() => {
      set({ liveAnnouncement: message });
    }, 50);
  },

  isWebMCPAvailable: false,
  registeredToolCount: 0,
  setWebMCPStatus: (available, count) =>
    set({ isWebMCPAvailable: available, registeredToolCount: count }),

  isSimulatorOpen: false,
  setSimulatorOpen: (open) => set({ isSimulatorOpen: open }),

  isDockOpen: false,
  setDockOpen: (open) => set({ isDockOpen: open }),

  toastMessage: null,
  showToast: (msg: string) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set((state) => (state.toastMessage === msg ? { toastMessage: null } : {}));
    }, 3500);
  },

  // Zero-Saccade Focal Reader State & Actions
  focalReader: {
    isOpen: false,
    isPlaying: false,
    words: [],
    currentIndex: 0,
    wpm: 250,
    rawText: '',
  },
  openFocalReader: (text, wpm) => {
    const rawText = text || get().activeArticle?.content.rawMarkdown || get().activeArticle?.summary || '';
    const words = tokenizeWords(rawText);
    const targetWpm = wpm && wpm > 0 ? wpm : (get().focalReader.wpm || 250);
    set({
      focalReader: {
        isOpen: true,
        isPlaying: false,
        words,
        currentIndex: 0,
        wpm: targetWpm,
        rawText,
      },
    });
    get().announce(`Zero-Saccade Focal Reader ready at ${targetWpm} words per minute. Press Space to start.`);
  },
  closeFocalReader: () => {
    set((state) => ({
      focalReader: {
        ...state.focalReader,
        isOpen: false,
        isPlaying: false,
      },
    }));
    get().announce('Focal reader closed.');
  },
  playFocalReader: () => {
    set((state) => ({
      focalReader: {
        ...state.focalReader,
        isPlaying: true,
      },
    }));
  },
  pauseFocalReader: () => {
    set((state) => ({
      focalReader: {
        ...state.focalReader,
        isPlaying: false,
      },
    }));
  },
  toggleFocalReaderPlay: () => {
    set((state) => ({
      focalReader: {
        ...state.focalReader,
        isPlaying: !state.focalReader.isPlaying,
      },
    }));
  },
  setFocalReaderSpeed: (wpm) => {
    const safeWpm = Math.max(75, Math.min(1000, wpm));
    set((state) => ({
      focalReader: {
        ...state.focalReader,
        wpm: safeWpm,
      },
    }));
    get().announce(`Reading pace set to ${safeWpm} words per minute.`);
  },
  setFocalReaderIndex: (index) => {
    set((state) => {
      const maxIdx = Math.max(0, state.focalReader.words.length - 1);
      const safeIndex = Math.max(0, Math.min(maxIdx, index));
      return {
        focalReader: {
          ...state.focalReader,
          currentIndex: safeIndex,
        },
      };
    });
  },
  stepFocalReader: (delta) => {
    set((state) => {
      const maxIdx = Math.max(0, state.focalReader.words.length - 1);
      const safeIndex = Math.max(0, Math.min(maxIdx, state.focalReader.currentIndex + delta));
      return {
        focalReader: {
          ...state.focalReader,
          currentIndex: safeIndex,
        },
      };
    });
  },

  // Assisted Writing Studio Implementation
  editorDraft: {
    title: '',
    content: '',
    category: 'strategies',
    tags: [],
    authorName: 'Alex M.',
    handle: '@curator',
    proposedText: null,
    proposedTitle: null,
  },
  setEditorDraft: (draft) =>
    set((state) => ({
      editorDraft: { ...state.editorDraft, ...draft },
    })),
  proposeEditorDraft: ({ proposedText, proposedTitle }) => {
    set((state) => ({
      editorDraft: {
        ...state.editorDraft,
        proposedText,
        proposedTitle: proposedTitle || state.editorDraft.proposedTitle,
      },
    }));
    get().announce('NOD Agent proposed an article expansion. Gatekeeper binary review opened.');
    get().setMascotMood('nodding');
    get().showToast('✨ NOD Agent proposed an expansion for review');
    setTimeout(() => get().setMascotMood('idle'), 2500);
  },
  acceptEditorProposal: () => {
    const { proposedText, proposedTitle } = get().editorDraft;
    if (!proposedText) return;
    set((state) => ({
      editorDraft: {
        ...state.editorDraft,
        content: proposedText,
        title: proposedTitle || state.editorDraft.title,
        proposedText: null,
        proposedTitle: null,
      },
    }));
    get().announce('Accepted agent proposal. Draft updated.');
    get().showToast('✓ Proposal accepted into draft');
    get().setMascotMood('nodding');
    setTimeout(() => get().setMascotMood('idle'), 1500);
  },
  rejectEditorProposal: () => {
    set((state) => ({
      editorDraft: {
        ...state.editorDraft,
        proposedText: null,
        proposedTitle: null,
      },
    }));
    get().announce('Rejected proposal and kept original text.');
    get().showToast('Original draft retained');
  },
  insertPullQuote: (quote: string, attribution?: string) => {
    const cleanQuote = quote.trim().replace(/^["']|["']$/g, '');
    const cleanAuthor = attribution ? attribution.trim() : 'Author Note';
    const formattedQuote = `\n\n> "${cleanQuote}"\n> — ${cleanAuthor}\n\n`;

    set((state) => {
      const existing = state.editorDraft.content;
      const updated = existing ? `${existing.trimEnd()}${formattedQuote}` : formattedQuote.trim();
      return {
        editorDraft: {
          ...state.editorDraft,
          content: updated,
        },
      };
    });
    get().announce('Pull quote inserted into article draft.');
    get().showToast('✓ Pull quote inserted by NOD Agent');
    get().setMascotMood('nodding');
    setTimeout(() => get().setMascotMood('idle'), 1500);
  },

  // Two-Step Publishing Approval Flow
  stagedPost: null,
  stagePost: (post) => {
    const cleanTitle = post.title.trim();
    const cleanContent = post.content.trim();
    const metrics = calculateReadingMetrics(cleanContent);
    const category = post.category || 'strategies';
    const tags = post.tags && post.tags.length > 0 ? post.tags : ['community', 'accessibility'];
    const authorName = post.authorName || get().editorDraft.authorName || 'Community Contributor';
    const handle = post.handle || get().editorDraft.handle || '@community';
    const summary = post.summary?.trim() || extractArticleSummary(cleanContent, cleanTitle);

    const staged: StagedPost = {
      title: cleanTitle,
      content: cleanContent,
      summary,
      category,
      tags,
      authorName,
      handle,
      metrics,
      isSubmitting: false,
    };

    set({ stagedPost: staged });
    get().announce(`Post titled "${cleanTitle}" has been staged. Publishing Approval Card opened on screen. Press Enter to confirm.`);
    get().showToast('📋 Post staged for review — Approval Card open');
    get().setMascotMood('nodding');
    setTimeout(() => get().setMascotMood('idle'), 2000);
    return staged;
  },

  confirmPublishStagedPost: async () => {
    const staged = get().stagedPost;
    if (!staged) return { success: false, error: 'No post currently staged.' };

    set((state) => ({
      stagedPost: state.stagedPost ? { ...state.stagedPost, isSubmitting: true } : null,
    }));
    get().announce('Confirming publication and saving story to community feed...');

    try {
      const formattedHandle = staged.handle.startsWith('@') ? staged.handle : `@${staged.handle}`;
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: staged.title,
          content: staged.content,
          summary: staged.summary,
          category: staged.category,
          tags: staged.tags,
          author: {
            id: 'author-user',
            name: staged.authorName,
            handle: formattedHandle,
            badge: 'Author',
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to publish: HTTP ${res.status}`);
      }

      const result = await res.json();
      set({
        stagedPost: null,
        editorDraft: {
          title: '',
          content: '',
          category: 'strategies',
          tags: [],
          authorName: staged.authorName,
          handle: staged.handle,
          proposedText: null,
          proposedTitle: null,
        },
      });

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nod_draft_title');
        sessionStorage.removeItem('nod_draft_content');
        window.dispatchEvent(new CustomEvent('nod:feed-updated'));
      }

      get().announce(`Your story "${staged.title}" has been published successfully.`);
      get().showToast(`✓ Published: "${staged.title}"`);
      get().setMascotMood('completed');
      setTimeout(() => get().setMascotMood('idle'), 3000);

      return { success: true, id: result.id };
    } catch (err: any) {
      set((state) => ({
        stagedPost: state.stagedPost ? { ...state.stagedPost, isSubmitting: false } : null,
      }));
      get().showToast(`Failed to publish: ${err.message}`);
      get().announce('Publishing failed. Please try again.');
      return { success: false, error: err.message };
    }
  },

  cancelStagedPost: () => {
    set({ stagedPost: null });
    get().announce('Publication cancelled. Story retained in editor.');
    get().showToast('Publication cancelled');
  },
}));
