export interface ReadingMetrics {
  clarityScore: number;           // 0-100 derived clarity
  clarityGrade: 'High Clarity' | 'Conversational' | 'In-Depth';
  skimMinutes: number;            // Quick skim pace (~220 WPM)
  deepReadMinutes: number;        // Deep, thoughtful reading pace (~90-120 WPM)
  wordCount: number;
  sentenceCount: number;
  hasAudio?: boolean;
}

export interface Author {
  id: string;
  name: string;
  handle: string;                 // e.g. @maya_chen or @community
  avatar?: string;
  badge?: string;                 // e.g. 'Contributor', 'Researcher', 'Curator'
}

export interface FeedItem {
  id: string;                     // UUID
  title: string;                  // Max 120 chars
  summary: string;                // Engaging synopsis
  author: Author;
  category: 'neurodiversity' | 'technology' | 'strategies' | 'stories' | 'discussion';
  tags: string[];
  metrics: ReadingMetrics;
  createdAt: string;              // ISO 8601
  commentCount?: number;
  likesCount?: number;
  coverImage?: string;
}

export interface ArticleDetail extends FeedItem {
  content: {
    rawMarkdown: string;
    htmlContent?: string;
    agentSummary?: string;        // WebMCP-generated plain-language synthesis
    keyTakeaways?: string[];      // 3-4 bullet takeaways
    audioUrl?: string;
  };
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  author: Author;
  content: string;
  createdAt: string;
}

export type ContrastTheme = 
  | 'soft-cream' 
  | 'warm-peach' 
  | 'calming-sage' 
  | 'muted-slate' 
  | 'yellow-on-black';

export type FontFamilyPreference = 
  | 'system'
  | 'lexend' 
  | 'atkinson' 
  | 'opendyslexic';

export type LetterSpacing = 'normal' | 'wide' | 'extra-wide';
export type LineHeight = 'normal' | 'relaxed' | 'loose';

export interface ReadingPreferences {
  fontFamily: FontFamilyPreference;
  bionicReading: boolean;
  contrastTheme: ContrastTheme;
  letterSpacing: LetterSpacing;
  lineHeight: LineHeight;
  fontSizeRem: number;
  readingRuler: boolean;
  focusMode: boolean;
}

export interface SimplifiedView {
  simplifiedContent: string;
  keyTakeaways: string[];
  isActive: boolean;
}

export type MascotMood = 'idle' | 'listening' | 'nodding' | 'completed';

export interface StagedPost {
  title: string;
  content: string;
  category: 'neurodiversity' | 'technology' | 'strategies' | 'stories' | 'discussion';
  tags: string[];
  authorName: string;
  handle: string;
  metrics: ReadingMetrics;
  isSubmitting?: boolean;
}
