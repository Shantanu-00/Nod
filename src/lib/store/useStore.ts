import { create } from 'zustand';
import { 
  ReadingPreferences, 
  SimplifiedView, 
  MascotMood, 
  ArticleDetail 
} from '@/types';

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

export const useStore = create<AppState>((set) => ({
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
}));
