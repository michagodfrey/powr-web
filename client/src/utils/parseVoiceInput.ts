// Parses a spoken phrase like "135 for 8" or "8 reps at 135" into a weight/reps pair.
export interface ParsedSet {
  weight: number;
  reps: number;
}

const REP_KEYWORDS = /\b(rep|reps)\b/i;

// Matches a number optionally followed by a decimal part, e.g. "135", "137.5"
const NUMBER_REGEX = /\d+(\.\d+)?/g;

export function parseVoiceInput(rawPhrase: string): ParsedSet | null {
  const phrase = rawPhrase.trim().toLowerCase();
  const matches = [...phrase.matchAll(NUMBER_REGEX)];

  if (matches.length < 2) {
    return null;
  }

  const numbers = matches.map((m) => ({
    value: parseFloat(m[0]),
    index: m.index ?? 0,
  }));

  const [first, second] = numbers;

  // If a "rep(s)" keyword appears closer to one number than the other, treat that number as reps.
  const repKeywordMatch = phrase.match(REP_KEYWORDS);
  if (repKeywordMatch && repKeywordMatch.index !== undefined) {
    const repKeywordIndex = repKeywordMatch.index;
    const distanceToFirst = Math.abs(first.index - repKeywordIndex);
    const distanceToSecond = Math.abs(second.index - repKeywordIndex);

    return distanceToFirst < distanceToSecond
      ? { weight: second.value, reps: first.value }
      : { weight: first.value, reps: second.value };
  }

  // Default: lifters typically say weight first, e.g. "135 for 8", "135 8".
  return { weight: first.value, reps: second.value };
}
