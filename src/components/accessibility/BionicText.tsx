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

  if (!isBionic || !text) {
    return <Component className={className} style={style}>{text}</Component>;
  }

  // Split by whitespace preserving tokens
  const words = text.split(/(\s+)/);

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
