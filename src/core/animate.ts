// ─── Easing Functions ─────────────────────────────────────────

export const ease = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutBack: (t: number) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  spring: (t: number) => {
    return 1 - Math.cos(t * Math.PI * 2) * Math.exp(-t * 6);
  },
};

// ─── Value Animation ──────────────────────────────────────────

export function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
  easingFn: (t: number) => number = ease.easeOutCubic
): () => void {
  const start = performance.now();
  let cancelled = false;

  function tick(now: number) {
    if (cancelled) return;
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const easedT = easingFn(t);
    const value = from + (to - from) * easedT;
    onUpdate(value);

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(tick);
  return () => { cancelled = true; };
}

// ─── Multi-Value Animation ────────────────────────────────────

export function animateValues(
  from: Record<string, number>,
  to: Record<string, number>,
  duration: number,
  onUpdate: (values: Record<string, number>) => void,
  onComplete?: () => void,
  easingFn: (t: number) => number = ease.easeOutCubic
): () => void {
  const keys = Object.keys(from);
  const start = performance.now();
  let cancelled = false;

  function tick(now: number) {
    if (cancelled) return;
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const easedT = easingFn(t);

    const values: Record<string, number> = {};
    for (const key of keys) {
      values[key] = from[key] + (to[key] - from[key]) * easedT;
    }
    onUpdate(values);

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(tick);
  return () => { cancelled = true; };
}

// ─── SVG Element Animation ────────────────────────────────────

export function animateEl(
  el: SVGElement | HTMLElement,
  properties: Record<string, [number, number]>,
  duration: number = 400,
  easingFn: (t: number) => number = ease.easeOutCubic
): Promise<void> {
  return new Promise((resolve) => {
    const from: Record<string, number> = {};
    const to: Record<string, number> = {};
    for (const [key, [a, b]] of Object.entries(properties)) {
      from[key] = a;
      to[key] = b;
    }

    animateValues(from, to, duration, (values) => {
      for (const [key, value] of Object.entries(values)) {
        if (key === 'opacity') {
          (el as HTMLElement).style.opacity = String(value);
        } else {
          el.setAttribute(key, String(value));
        }
      }
    }, resolve, easingFn);
  });
}

// ─── Stagger Helper ───────────────────────────────────────────

export function stagger(
  elements: (SVGElement | HTMLElement)[],
  animateFn: (el: SVGElement | HTMLElement, index: number) => Promise<void>,
  delay: number = 30
): Promise<void> {
  return new Promise((resolve) => {
    let completed = 0;
    elements.forEach((el, i) => {
      setTimeout(() => {
        animateFn(el, i).then(() => {
          completed++;
          if (completed === elements.length) resolve();
        });
      }, i * delay);
    });
    if (elements.length === 0) resolve();
  });
}
