'use client';

import React from 'react';
import { useStore } from '@/lib/store/useStore';
import { splitWordBionic } from '@/lib/utils/bionic';

interface BionicTextProps {
  text: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3';
  className?: string;
  style?: React.CSSProperties;
}

export function BionicText({ text, as: Component = 'p', className = '', style }: BionicTextProps) {
  const isBionic = useStore((state) => state.readingPreferences.bionicReading);

  if (!text) return null;

  // Sanitize heading hashes and asterisks so they never leak as raw syntax
  const cleanText = text.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '');

  if (!isBionic) {
    return <Component className={className} style={style}>{cleanText}</Component>;
  }

  // Split by whitespace preserving tokens
  const words = cleanText.split(/(\s+)/);

  return (
    <Component className={className} style={style}>
      {words.map((word, idx) => {
        // If it's pure whitespace, preserve it
        if (/^\s+$/.test(word)) {
          return <React.Fragment key={idx}>{word}</React.Fragment>;
        }

        const { fixation, rest } = splitWordBionic(word);

        return (
          <span key={idx} className="inline">
            <strong className="bionic-fixation">{fixation}</strong>
            {rest}
          </span>
        );
      })}
    </Component>
  );
}
