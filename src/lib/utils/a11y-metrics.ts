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
