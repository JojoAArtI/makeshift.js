export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatNumber(value: number, opts?: { currency?: boolean; compact?: boolean; decimals?: number }): string {
  if (opts?.currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: opts.decimals ?? 0, maximumFractionDigits: opts.decimals ?? 0 }).format(value);
  }
  if (opts?.compact) {
    if (Math.abs(value) >= 1e9) return `${round(value / 1e9, 1)}B`;
    if (Math.abs(value) >= 1e6) return `${round(value / 1e6, 1)}M`;
    if (Math.abs(value) >= 1e3) return `${round(value / 1e3, 1)}K`;
    return String(round(value, opts.decimals ?? 0));
  }
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: opts?.decimals ?? 0, maximumFractionDigits: opts?.decimals ?? 2 }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${round(value, decimals)}%`;
}

export function formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'short'): string {
  switch (format) {
    case 'short': return `${date.getMonth() + 1}/${date.getDate()}`;
    case 'medium': return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'long': return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

export function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

let _idCounter = 0;
export function generateId(prefix: string = 'ms'): string {
  return `${prefix}-${++_idCounter}-${Math.random().toString(36).substring(2, 7)}`;
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }) as T;
}

export function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): T {
  let inThrottle = false;
  return ((...args: any[]) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => { inThrottle = false; }, limit); } }) as T;
}

export function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : text.substring(0, maxLength - 1) + '\u2026';
}

export function resolveMargin(m?: Partial<{ top: number; right: number; bottom: number; left: number }>) {
  return { top: m?.top ?? 40, right: m?.right ?? 40, bottom: m?.bottom ?? 40, left: m?.left ?? 60 };
}
