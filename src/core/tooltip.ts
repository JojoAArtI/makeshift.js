// ─── Tooltip System ───────────────────────────────────────────

let tooltipEl: HTMLDivElement | null = null;

function ensureTooltip(): HTMLDivElement {
  if (tooltipEl && document.body.contains(tooltipEl)) return tooltipEl;

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'makeshift-tooltip';
  tooltipEl.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 99999;
    padding: 8px 12px;
    background: rgba(15, 15, 35, 0.95);
    color: #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    line-height: 1.5;
    max-width: 300px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.2);
    backdrop-filter: blur(8px);
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
    white-space: pre-line;
  `;
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

export function showTooltip(
  x: number,
  y: number,
  content: string | HTMLElement
): void {
  const tip = ensureTooltip();
  if (typeof content === 'string') {
    tip.innerHTML = content;
  } else {
    tip.innerHTML = '';
    tip.appendChild(content);
  }

  // Position intelligently
  const pad = 12;
  const rect = tip.getBoundingClientRect();
  let left = x + pad;
  let top = y - pad;

  if (left + rect.width > window.innerWidth - pad) {
    left = x - rect.width - pad;
  }
  if (top + rect.height > window.innerHeight - pad) {
    top = y - rect.height - pad;
  }
  if (top < pad) top = pad;
  if (left < pad) left = pad;

  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  tip.style.opacity = '1';
  tip.style.transform = 'translateY(0)';
}

export function moveTooltip(x: number, y: number): void {
  if (!tooltipEl) return;
  const rect = tooltipEl.getBoundingClientRect();
  const pad = 12;
  let left = x + pad;
  let top = y - pad;

  if (left + rect.width > window.innerWidth - pad) {
    left = x - rect.width - pad;
  }
  if (top + rect.height > window.innerHeight - pad) {
    top = y - rect.height - pad;
  }
  if (top < pad) top = pad;
  if (left < pad) left = pad;

  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

export function hideTooltip(): void {
  if (!tooltipEl) return;
  tooltipEl.style.opacity = '0';
  tooltipEl.style.transform = 'translateY(4px)';
}

export function formatTooltipRow(label: string, value: string | number): string {
  return `<span style="color:#94a3b8">${label}:</span> <strong>${value}</strong>`;
}

export function formatTooltipTitle(title: string): string {
  return `<div style="font-weight:600;margin-bottom:4px;color:#a5b4fc">${title}</div>`;
}
