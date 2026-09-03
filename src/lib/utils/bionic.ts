export interface BionicWordSegment {
  fixation: string;
  rest: string;
}

export function splitWordBionic(word: string): BionicWordSegment {
  // Strip trailing punctuation for length calculation
  const match = word.match(/^([a-zA-Z0-9]+)(.*)$/);
  if (!match) {
    return { fixation: '', rest: word };
  }

  const alpha = match[1];
  const trailing = match[2];
  const len = alpha.length;

  let fixationLen = 1;
  if (len === 1) fixationLen = 1;
  else if (len <= 3) fixationLen = 1;
  else if (len <= 6) fixationLen = 2;
  else if (len <= 9) fixationLen = 3;
  else fixationLen = Math.ceil(len * 0.4);

  return {
    fixation: alpha.slice(0, fixationLen),
    rest: alpha.slice(fixationLen) + trailing,
  };
}
