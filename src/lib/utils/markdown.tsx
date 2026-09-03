'use client';

import React from 'react';
import { splitWordBionic } from '@/lib/utils/bionic';

interface InlineProps {
  text: string;
  isBionic?: boolean;
}

/**
 * Renders a single text segment with Bionic reading fixation if enabled
 */
function renderBionicWords(text: string, isBionic: boolean): React.ReactNode {
  if (!isBionic || !text) return text;

  const tokens = text.split(/(\s+)/);
  return tokens.map((token, idx) => {
    if (/^\s+$/.test(token)) {
      return token;
    }
    const { fixation, rest } = splitWordBionic(token);
    return (
      <span key={idx} className="inline">
        <strong className="bionic-fixation">{fixation}</strong>
        {rest}
      </span>
    );
  });
}

/**
 * Parses inline markdown: **bold**, *italic*, `code`, [links](url), stripping stray heading symbols
 */
export function AccessibleInlineMarkdown({ text, isBionic = false }: InlineProps): JSX.Element {
  if (!text) return <></>;

  // Strip any stray heading hashes at start of line
  const cleanInput = text.replace(/^#{1,6}\s+/, '');

  // Regex to match markdown inline tokens:
  // 1: Bold: **...** or __...__
  // 2: Italic: *...* or _..._
  // 3: Inline code: `...`
  // 4: Links: [text](url)
  const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/g;
  const parts = cleanInput.split(tokenRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Bold: **text** or __text__
        if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
            (part.startsWith('__') && part.endsWith('__') && part.length >= 4)) {
          const content = part.slice(2, -2);
          return (
            <strong key={index} className="font-bold text-inherit">
              {renderBionicWords(content, isBionic)}
            </strong>
          );
        }

        // Italic: *text* or _text_
        if ((part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
            (part.startsWith('_') && part.endsWith('_') && part.length >= 2)) {
          const content = part.slice(1, -1);
          return (
            <em key={index} className="italic text-inherit">
              {renderBionicWords(content, isBionic)}
            </em>
          );
        }

        // Code: `code`
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          const content = part.slice(1, -1);
          return (
            <code 
              key={index} 
              className="px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono bg-black/10 dark:bg-white/10 border border-current/20"
            >
              {content}
            </code>
          );
        }

        // Link: [label](url)
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          const [, label, url] = linkMatch;
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-green hover:underline font-medium inline-flex items-center gap-0.5"
            >
              {renderBionicWords(label, isBionic)}
            </a>
          );
        }

        // Standard text
        return <React.Fragment key={index}>{renderBionicWords(part, isBionic)}</React.Fragment>;
      })}
    </>
  );
}

export interface MarkdownBlock {
  type: 'heading' | 'blockquote' | 'ul' | 'ol' | 'code' | 'paragraph';
  level?: number;
  text?: string;
  items?: string[];
  code?: string;
}

/**
 * Robust line-by-line block parser that correctly isolates headings (even with single newlines),
 * numbered lists, bullet lists, code blocks, and paragraphs.
 */
export function parseMarkdownBlocks(content: string, skipTitle?: string): MarkdownBlock[] {
  if (!content) return [];

  const lines = content.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];

  let i = 0;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const cleanTitle = skipTitle ? skipTitle.trim().toLowerCase().replace(/[#*`_]/g, '') : '';

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code', code: codeBuffer.join('\n') });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      i++;
      continue;
    }

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // 1. Heading: starts with # (1 to 6)
    const headingMatch = line.match(/^(#{1,6})\s*(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      // Check if this heading is identical to the top-level article title already rendered in h1
      const normalizedHeading = text.toLowerCase().replace(/[#*`_]/g, '');
      if (cleanTitle && (normalizedHeading === cleanTitle || cleanTitle.includes(normalizedHeading))) {
        i++;
        continue;
      }

      blocks.push({ type: 'heading', level, text });
      i++;
      continue;
    }

    // 2. Blockquote: starts with >
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    // 3. Unordered list: starts with - , * , or • 
    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // 4. Ordered list: starts with 1. , 2. , etc.
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // 5. Standard paragraph: collect lines until a new block or blank line
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !/^#{1,6}\s*/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('>') &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return blocks;
}

interface MarkdownBlockProps {
  content: string;
  isBionic?: boolean;
  lineHeight?: string;
  letterSpacing?: string;
  landmarks?: string[];
  skipTitle?: string;
}

/**
 * Parses and renders full markdown content into accessible HTML components
 */
export function AccessibleMarkdownContent({
  content,
  isBionic = false,
  lineHeight,
  letterSpacing,
  landmarks = ['✦', '◈', '⬡', '❖', '▲'],
  skipTitle,
}: MarkdownBlockProps): JSX.Element {
  if (!content) return <></>;

  const blocks = parseMarkdownBlocks(content, skipTitle);

  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => {
        const landmark = landmarks[idx % landmarks.length];

        // Headings: h1, h2, h3, h4
        if (block.type === 'heading') {
          const level = block.level || 2;
          const headingText = block.text || '';

          if (level === 1) {
            return (
              <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold mt-8 mb-4 tracking-tight" style={{ color: 'var(--canvas-text)' }}>
                <AccessibleInlineMarkdown text={headingText} isBionic={isBionic} />
              </h2>
            );
          }
          if (level === 2) {
            return (
              <h2 key={idx} className="text-xl sm:text-2xl font-bold mt-7 mb-3 tracking-tight" style={{ color: 'var(--canvas-text)' }}>
                <AccessibleInlineMarkdown text={headingText} isBionic={isBionic} />
              </h2>
            );
          }
          return (
            <h3 key={idx} className="text-lg sm:text-xl font-bold mt-6 mb-2" style={{ color: 'var(--canvas-text)' }}>
              <AccessibleInlineMarkdown text={headingText} isBionic={isBionic} />
            </h3>
          );
        }

        // Blockquote
        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={idx}
              className="my-6 pl-4 sm:pl-6 py-3 border-l-4 border-brand-green bg-brand-surface-elevated/60 rounded-r-2xl shadow-xs"
            >
              <div className="font-medium italic text-base sm:text-lg" style={{ color: 'var(--canvas-text)', lineHeight }}>
                <AccessibleInlineMarkdown text={block.text || ''} isBionic={isBionic} />
              </div>
            </blockquote>
          );
        }

        // Unordered bullet list
        if (block.type === 'ul' && block.items) {
          return (
            <ul key={idx} className="my-4 space-y-2.5 pl-6 list-disc marker:text-brand-green">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-base sm:text-lg" style={{ color: 'var(--canvas-text)', lineHeight, letterSpacing }}>
                  <AccessibleInlineMarkdown text={item} isBionic={isBionic} />
                </li>
              ))}
            </ul>
          );
        }

        // Ordered numbered list
        if (block.type === 'ol' && block.items) {
          return (
            <ol key={idx} className="my-4 space-y-2.5 pl-6 list-decimal marker:text-brand-green">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-base sm:text-lg" style={{ color: 'var(--canvas-text)', lineHeight, letterSpacing }}>
                  <AccessibleInlineMarkdown text={item} isBionic={isBionic} />
                </li>
              ))}
            </ol>
          );
        }

        // Fenced Code Block
        if (block.type === 'code' && block.code) {
          return (
            <pre
              key={idx}
              className="my-4 p-4 sm:p-5 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto border shadow-xs"
              style={{
                backgroundColor: 'var(--canvas-bg)',
                borderColor: 'var(--canvas-border)',
                color: 'var(--canvas-text)',
              }}
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        // Standard Paragraph
        return (
          <div key={idx} className="relative group">
            <span
              className="hidden md:block absolute -left-7 top-1 text-xs text-brand-green opacity-40 group-hover:opacity-100 select-none font-mono"
              title="Visual landmark anchor"
              aria-hidden="true"
            >
              {landmark}
            </span>
            <p className="text-base sm:text-lg" style={{ color: 'var(--canvas-text)', lineHeight, letterSpacing }}>
              <AccessibleInlineMarkdown text={block.text || ''} isBionic={isBionic} />
            </p>
          </div>
        );
      })}
    </div>
  );
}
