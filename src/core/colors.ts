// ─── Default Color Palettes ───────────────────────────────────

export const PALETTES = {
  categorical: [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
    '#a855f7', '#f59e0b', '#84cc16', '#10b981', '#06b6d4',
  ],
  warm: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'],
  cool: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
  red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
  heatmap: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9'],
  heatmapGreen: ['#0a0a0a', '#064e3b', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  heatmapBlue: ['#0f172a', '#1e293b', '#334155', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#f1f5f9'],
  diverging: ['#dc2626', '#ef4444', '#f87171', '#fecaca', '#f5f5f5', '#dbeafe', '#93c5fd', '#3b82f6'],
  waterfall: {
    positive: '#22c55e',
    negative: '#ef4444',
    total: '#6366f1',
  },
  accent: ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4'],
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
        bg: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #0f0f23 100%)',
        surface: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        border: 'rgba(99,102,241,0.3)',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
        grid: 'rgba(99,102,241,0.15)',
        highlight: '#818cf8',
        accent: '#a855f7',
      }
    : {
        bg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        surface: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: '#e2e8f0',
        text: '#1e293b',
        textMuted: '#64748b',
        grid: '#e2e8f0',
        highlight: '#6366f1',
        accent: '#8b5cf6',
      };
}
