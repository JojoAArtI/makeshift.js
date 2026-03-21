// ─── Linear Scale ─────────────────────────────────────────────

export function linearScale(
  domain: [number, number],
  range: [number, number]
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

export function linearScaleInvert(
  domain: [number, number],
  range: [number, number]
): (pixel: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = r1 - r0 || 1;
  return (pixel: number) => d0 + ((pixel - r0) / span) * (d1 - d0);
}

// ─── Band Scale (for categories) ──────────────────────────────

export function bandScale(
  domain: string[],
  range: [number, number],
  padding: number = 0.1
): { (value: string): number; bandwidth: () => number } {
  const n = domain.length;
  const totalRange = range[1] - range[0];
  const step = totalRange / (n + (n - 1) * padding + padding * 2);
  const bandwidth = step;
  const paddingOuter = step * padding;
  const map = new Map<string, number>();

  domain.forEach((d, i) => {
    map.set(d, range[0] + paddingOuter + i * step * (1 + padding));
  });

  const fn = (value: string) => map.get(value) ?? range[0];
  fn.bandwidth = () => bandwidth;
  return fn;
}

// ─── Time Scale ───────────────────────────────────────────────

export function timeScale(
  domain: [Date, Date],
  range: [number, number]
): (date: Date) => number {
  const [d0, d1] = domain;
  const t0 = d0.getTime();
  const t1 = d1.getTime();
  const scale = linearScale([t0, t1], range);
  return (date: Date) => scale(date.getTime());
}

export function timeScaleInvert(
  domain: [Date, Date],
  range: [number, number]
): (pixel: number) => Date {
  const [d0, d1] = domain;
  const t0 = d0.getTime();
  const t1 = d1.getTime();
  const invert = linearScaleInvert([t0, t1], range);
  return (pixel: number) => new Date(invert(pixel));
}

// ─── Color Scale ──────────────────────────────────────────────

export function colorScale(
  domain: [number, number],
  colors: string[]
): (value: number) => string {
  const [d0, d1] = domain;
  const n = colors.length - 1;
  return (value: number) => {
    const t = Math.max(0, Math.min(1, (value - d0) / (d1 - d0 || 1)));
    const i = Math.min(Math.floor(t * n), n - 1);
    const f = t * n - i;
    return interpolateColor(colors[i], colors[i + 1], f);
  };
}

function interpolateColor(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function parseHex(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ];
}

// ─── Tick Generation ──────────────────────────────────────────

export function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

export function generateTicks(
  min: number,
  max: number,
  count: number = 8
): number[] {
  const range = niceNum(max - min, false);
  const step = niceNum(range / (count - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
    ticks.push(parseFloat(v.toFixed(10)));
  }
  return ticks;
}

export function generateDateTicks(
  start: Date,
  end: Date,
  viewMode: 'day' | 'week' | 'month'
): Date[] {
  const ticks: Date[] = [];
  const current = new Date(start);

  switch (viewMode) {
    case 'day':
      while (current <= end) {
        ticks.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      break;
    case 'week':
      current.setDate(current.getDate() - current.getDay());
      while (current <= end) {
        ticks.push(new Date(current));
        current.setDate(current.getDate() + 7);
      }
      break;
    case 'month':
      current.setDate(1);
      while (current <= end) {
        ticks.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
      }
      break;
  }
  return ticks;
}
