import { ReadingMetrics } from '@/types';

function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;
  
  const matches = clean.match(/[aeiouy]{1,2}/g);
  let count = matches ? matches.length : 1;

  if (clean.endsWith('e') && !clean.endsWith('le')) {
    count = Math.max(1, count - 1);
  }

  return Math.max(1, count);
}

export function calculateReadingMetrics(text: string): ReadingMetrics {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = Math.max(1, words.length);

  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }

  // Flesch Reading Ease Formula
  const rawScore = Math.round(
    206.835 -
      1.015 * (wordCount / sentenceCount) -
      84.6 * (totalSyllables / wordCount)
  );

  const clarityScore = Math.max(20, Math.min(100, rawScore));

  let clarityGrade: 'High Clarity' | 'Conversational' | 'In-Depth' = 'Conversational';
  if (clarityScore >= 75) clarityGrade = 'High Clarity';
  else if (clarityScore < 55) clarityGrade = 'In-Depth';

  // Quick skim: ~220 words per minute
  const skimMinutes = Math.max(1, Math.ceil(wordCount / 220));

  // Deep, thoughtful reading pace: ~100 words per minute
  const deepReadMinutes = Math.max(1, Math.ceil(wordCount / 100));

  return {
    clarityScore,
    clarityGrade,
    skimMinutes,
    deepReadMinutes,
    wordCount,
    sentenceCount,
    hasAudio: true,
  };
}

export function getClarityTagStyle(grade: 'High Clarity' | 'Conversational' | 'In-Depth') {
  switch (grade) {
    case 'High Clarity':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Conversational':
      return { bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-200' };
    case 'In-Depth':
      return { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' };
  }
}

/**
 * Intelligently extracts a concise, accessible summary (1-2 sentences, ~60-160 characters)
 * from markdown content without breaking prematurely on abbreviations (vs., Dr., e.g.) or headings.
 */
export function extractArticleSummary(markdown: string, title?: string): string {
  if (!markdown || typeof markdown !== 'string') return '';

  const lines = markdown.split(/\r?\n/);
  const normalizedTitle = title ? title.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const proseLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check if line is a markdown heading (# Title or ## Subheading)
    if (/^#{1,6}\s+/.test(line)) {
      const headingText = line.replace(/^#{1,6}\s+/, '').trim();
      const normalizedHeading = headingText.toLowerCase().replace(/[^a-z0-9]/g, '');
      // Skip if this heading repeats the title
      if (normalizedTitle && normalizedHeading === normalizedTitle) {
        continue;
      }
      continue;
    }

    // Skip thematic breaks
    if (line.startsWith('---') || line.startsWith('***')) continue;

    // Clean inline formatting: blockquotes, links, bold/italic, backticks
    const cleanLine = line
      .replace(/^>\s*/, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .trim();

    // Skip if line merely echoes the article title
    const normalizedClean = cleanLine.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedTitle && normalizedClean === normalizedTitle) {
      continue;
    }

    if (cleanLine.length > 0) {
      proseLines.push(cleanLine);
      if (proseLines.join(' ').length > 300) break;
    }
  }

  const plainText = (proseLines.length > 0 ? proseLines.join(' ') : markdown.replace(/[#*`_>~]/g, ''))
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) return '';

  // Recognizes common abbreviations and honorifics that end in a period
  const abbreviationPattern = /\b(?:vs|v|dr|mr|mrs|ms|prof|sr|jr|etc|eg|ie|al|st|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\.?$/i;

  const rawSentences: string[] = [];
  let currentSentence = '';
  const tokens = plainText.split(/(\s+)/);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    currentSentence += token;

    if (/[.!?]$/.test(token)) {
      const isAbbr = abbreviationPattern.test(token) || /^[A-Z]\.$/.test(token) || /\d+\.\d+$/.test(token);

      if (!isAbbr) {
        let nextWord = '';
        for (let j = i + 1; j < tokens.length; j++) {
          if (tokens[j].trim().length > 0) {
            nextWord = tokens[j].trim();
            break;
          }
        }

        // Real sentence boundary if followed by whitespace and capital letter or end of text
        if (!nextWord || /^[A-Z"'“‘]/.test(nextWord)) {
          if (currentSentence.trim().length > 0) {
            rawSentences.push(currentSentence.trim());
            currentSentence = '';
          }
        }
      }
    }
  }

  if (currentSentence.trim().length > 0) {
    rawSentences.push(currentSentence.trim());
  }

  // Assemble summary from sentences (aiming for 1-2 complete sentences under 165 chars)
  let summary = '';
  for (const s of rawSentences) {
    if (!summary) {
      summary = s;
    } else if ((summary + ' ' + s).length <= 165) {
      summary += ' ' + s;
    } else {
      break;
    }
  }

  // Graceful guardrails for readability
  if (summary.length < 45 && plainText.length > summary.length) {
    if (plainText.length <= 150) {
      summary = plainText;
    } else {
      const truncated = plainText.slice(0, 145);
      const lastSpace = truncated.lastIndexOf(' ');
      summary = (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated).trim() + '...';
    }
  } else if (summary.length > 185) {
    const truncated = summary.slice(0, 160);
    const lastSpace = truncated.lastIndexOf(' ');
    summary = (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated).trim() + '...';
  }

  return summary.trim();
}

