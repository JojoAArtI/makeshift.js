// Longest Common Subsequence for word diffing

export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(w => w.length > 0);
}

export function lcs(a: string[], b: string[]): string[] {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const result: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) { result.unshift(a[i - 1]); i--; j--; }
    else if (dp[i - 1][j] > dp[i][j - 1]) i--;
    else j--;
  }
  return result;
}

export interface DiffResult {
  added: string[];
  removed: string[];
  unchanged: string[];
}

export function diffWords(before: string[], after: string[]): DiffResult {
  const common = new Set(lcs(before, after).map(w => w.toLowerCase()));
  const removed = before.filter(w => !common.has(w.toLowerCase()));
  const added = after.filter(w => !common.has(w.toLowerCase()));
  return { added, removed, unchanged: [...common] };
}

export function wordFrequency(words: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const w of words) {
    const key = w.toLowerCase();
    freq.set(key, (freq.get(key) || 0) + 1);
  }
  return freq;
}

export function frequencyDelta(
  before: Map<string, number>,
  after: Map<string, number>
): { word: string; delta: number; before: number; after: number }[] {
  const allWords = new Set([...before.keys(), ...after.keys()]);
  const results: { word: string; delta: number; before: number; after: number }[] = [];
  for (const word of allWords) {
    const b = before.get(word) || 0;
    const a = after.get(word) || 0;
    results.push({ word, delta: a - b, before: b, after: a });
  }
  return results.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}
