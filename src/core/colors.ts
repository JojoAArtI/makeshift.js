// ─── Default Color Palettes ───────────────────────────────────

export const PALETTES = {
  categorical: [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  ],
  warm: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309'],
  cool: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2'],
  green: ['#f0fdf4', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
  red: ['#fef2f2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
  heatmap: ['#1e1b4b', '#312e81', '#4338ca', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
  heatmapGreen: ['#0a0a0a', '#064e3b', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'],
  diverging: ['#dc2626', '#f87171', '#fecaca', '#f5f5f5', '#bfdbfe', '#60a5fa', '#2563eb'],
  waterfall: {
    positive: '#22c55e',
    negative: '#ef4444',
    total: '#6366f1',
  },
} as const;

// ─── Color Utilities ──────────────────────────────────────────

export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function withOpacity(color: string, opacity: number): string {
  const [r, g, b] = hexToRgb(color);
  return `rgba(${r},${g},${b},${opacity})`;
}

export function lighten(color: string, amount: number): string {
  const [r, g, b] = hexToRgb(color);
  return rgbToHex(
    Math.min(255, Math.round(r + (255 - r) * amount)),
    Math.min(255, Math.round(g + (255 - g) * amount)),
    Math.min(255, Math.round(b + (255 - b) * amount))
  );
}

export function darken(color: string, amount: number): string {
  const [r, g, b] = hexToRgb(color);
  return rgbToHex(
    Math.max(0, Math.round(r * (1 - amount))),
    Math.max(0, Math.round(g * (1 - amount))),
    Math.max(0, Math.round(b * (1 - amount)))
  );
}

export function getCategoryColor(index: number): string {
  return PALETTES.categorical[index % PALETTES.categorical.length];
}

export function getThemeColors(theme: 'light' | 'dark') {
  return theme === 'dark'
    ? {
        bg: '#0f0f23',
        surface: '#1a1a2e',
        border: '#2d2d44',
        text: '#e2e8f0',
        textMuted: '#94a3b8',
        grid: '#2d2d44',
        highlight: '#6366f1',
      }
    : {
        bg: '#ffffff',
        surface: '#f8fafc',
        border: '#e2e8f0',
        text: '#1e293b',
        textMuted: '#64748b',
        grid: '#e2e8f0',
        highlight: '#6366f1',
      };
}
