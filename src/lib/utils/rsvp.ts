/**
 * RSVP (Rapid Serial Visual Presentation) & ORP (Optimal Recognition Point) Utilities
 * Engineered for dyslexic, ADHD, and motor-impaired readers to eliminate ocular saccades.
 */

export interface OrpWordSplit {
  leftSegment: string;
  orpChar: string;
  rightSegment: string;
  orpIndex: number;
}

/**
 * Calculates the Optimal Recognition Point (ORP) character index.
 * Standard Spritz / RSVP formula: Math.floor((length - 1) / 3)
 */
export function calculateOrpIndex(word: string): number {
  if (!word || word.length === 0) return 0;
  return Math.max(0, Math.min(word.length - 1, Math.floor((word.length - 1) / 3)));
}

/**
 * Splits a word into left segment, central ORP character, and right segment.
 */
export function splitWordOrp(word: string): OrpWordSplit {
  if (!word) {
    return { leftSegment: '', orpChar: '', rightSegment: '', orpIndex: 0 };
  }

  const orpIndex = calculateOrpIndex(word);
  return {
    leftSegment: word.slice(0, orpIndex),
    orpChar: word.charAt(orpIndex),
    rightSegment: word.slice(orpIndex + 1),
    orpIndex,
  };
}

/**
 * Calculates the display delay (in milliseconds) for a given word and target WPM.
 * Applies cognitive pausing multipliers for punctuation:
 * - 1.5× for comma, semicolon, colon
 * - 2.2× for period, question mark, exclamation point
 */
export function calculateWordDelay(word: string, wpm: number): number {
  const safeWpm = Math.max(50, Math.min(1200, wpm || 250));
  const baseInterval = (60 / safeWpm) * 1000;

  if (!word) return baseInterval;

  const trimmed = word.trim();

  // Trailing terminal punctuation (. ! ?) optionally followed by quotes/brackets
  if (/[.?!]['"”’)}\]]?$/.test(trimmed)) {
    return Math.round(baseInterval * 2.2);
  }

  // Trailing pause punctuation (, ; :) optionally followed by quotes/brackets
  if (/[,;:]['"”’)}\]]?$/.test(trimmed)) {
    return Math.round(baseInterval * 1.5);
  }

  // Em-dash or hyphen pause
  if (/[-—–]$/.test(trimmed)) {
    return Math.round(baseInterval * 1.3);
  }

  return Math.round(baseInterval);
}

/**
 * Strips markdown and HTML artifacts from raw article text to extract clean readable prose.
 */
export function extractCleanText(rawMarkdownOrHtml: string): string {
  if (!rawMarkdownOrHtml) return '';

  let text = rawMarkdownOrHtml;

  // Remove code blocks (fenced)
  text = text.replace(/```[\s\S]*?```/g, ' ');

  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove images: ![alt](url)
  text = text.replace(/!\[.*?\]\(.*?\)/g, ' ');

  // Convert links [text](url) to text
  text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');

  // Remove headers (# Header)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove blockquotes (> quote)
  text = text.replace(/^>\s+/gm, '');

  // Remove list bullets / numbers (* item, - item, 1. item)
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove horizontal rules
  text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, ' ');

  // Remove bold & italic formatting
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  text = text.replace(/~~(.*?)~~/g, '$1');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Normalize whitespace and collapse multiple spaces/newlines
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Tokenizes text into an array of words for RSVP presentation.
 */
export function tokenizeWords(text: string): string[] {
  const clean = extractCleanText(text);
  if (!clean) return [];
  return clean.split(/\s+/).filter((w) => w.length > 0);
}
