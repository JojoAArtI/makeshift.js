import type { TextVersion, WordDiffOptions } from '../../core/types';
import { createSVG, createGroup, createRect, createText, createLine, createContainer, getContainerSize } from '../../core/svg';
import { showTooltip, hideTooltip, formatTooltipTitle, formatTooltipRow } from '../../core/tooltip';
import { getThemeColors, withOpacity } from '../../core/colors';
import { generateId, resolveMargin, truncate } from '../../core/utils';
import { linearScale } from '../../core/scales';
import { injectStyles } from '../../styles';
import { tokenize, diffWords, wordFrequency, frequencyDelta } from './diff';

const DEFAULTS = {
  mode: 'column' as const, addedColor: '#22c55e', removedColor: '#ef4444', unchangedColor: '#94a3b8',
  maxFontSize: 48, minFontSize: 10, showConnectors: true, theme: 'dark' as const, animate: true,
};

export function wordDiff(
  container: HTMLElement | string,
  texts: TextVersion[],
  options: WordDiffOptions = {}
): { destroy: () => void; setMode: (mode: 'column' | 'cloud') => void } {
  injectStyles();
  const opts = { ...DEFAULTS, ...options };
  const theme = getThemeColors(opts.theme);
  const el = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container;
  if (!el) throw new Error('makeshift.js: container not found');
  const size = getContainerSize(el, opts);
  const wrapper = createContainer(el, 'makeshift-word-diff');
  let currentMode = opts.mode;

  function renderColumn() {
    wrapper.innerHTML = '';
    addModeButtons();

    const margin = resolveMargin(opts.margin);
    const w = size.width;
    const colW = (w - margin.left - margin.right) / texts.length;
    const lineH = 22;

    // Tokenize all
    const tokenized = texts.map(t => tokenize(t.text));
    const maxWords = Math.max(...tokenized.map(t => t.length));
    const h = Math.max(size.height, margin.top + maxWords * lineH + margin.bottom + 60);

    const svg = createSVG(w, h);
    svg.style.background = theme.bg;

    // Column headers
    texts.forEach((v, i) => {
      const x = margin.left + i * colW + colW / 2;
      svg.appendChild(createText(x, margin.top - 10, v.label, {
        fill: theme.highlight, 'font-size': '14', 'font-weight': '600', 'text-anchor': 'middle',
      }));
      if (i > 0) {
        svg.appendChild(createLine(margin.left + i * colW, margin.top, margin.left + i * colW, h - margin.bottom, {
          stroke: theme.border, 'stroke-width': '1', 'stroke-opacity': '0.3',
        }));
      }
    });

    // Render words per column and connections
    for (let i = 0; i < texts.length; i++) {
      const words = tokenized[i];
      const x = margin.left + i * colW;

      // Compare with previous version
      let diff: ReturnType<typeof diffWords> | null = null;
      if (i > 0) diff = diffWords(tokenized[i - 1], words);
      const addedSet = diff ? new Set(diff.added.map(w => w.toLowerCase())) : new Set<string>();
      const removedPrev = diff ? new Set(diff.removed.map(w => w.toLowerCase())) : new Set<string>();

      words.forEach((word, j) => {
        const wordY = margin.top + 20 + j * lineH;
        const isAdded = addedSet.has(word.toLowerCase());
        const color = isAdded ? opts.addedColor : theme.text;

        // Background highlight for added words
        if (isAdded) {
          svg.appendChild(createRect(x + 8, wordY - 13, colW - 16, lineH - 2, {
            rx: '4', fill: withOpacity(opts.addedColor, 0.1),
          }));
        }

        const text = createText(x + 14, wordY, truncate(word, 20), {
          fill: color, 'font-size': '12',
          'font-weight': isAdded ? '600' : '400',
        });
        text.addEventListener('mouseenter', (e) => {
          showTooltip(e.clientX, e.clientY,
            formatTooltipTitle(word) + formatTooltipRow('Version', texts[i].label) +
            (isAdded ? '<br><span style="color:#22c55e">✚ Added in this version</span>' : '')
          );
        });
        text.addEventListener('mouseleave', hideTooltip);
        svg.appendChild(text);
      });

      // Show removed words from previous
      if (i > 0 && diff) {
        const removedWords = diff.removed;
        if (removedWords.length > 0) {
          const prevX = margin.left + (i - 1) * colW;
          removedWords.forEach((word, j) => {
            const wordY = margin.top + 20 + (tokenized[i - 1].length + j + 1) * lineH;
            if (wordY < h - margin.bottom) {
              svg.appendChild(createText(prevX + 14, wordY, truncate(word, 20), {
                fill: withOpacity(opts.removedColor, 0.5), 'font-size': '12',
                'text-decoration': 'line-through',
              }));
            }
          });
        }
      }

      // Connectors between shared words
      if (i > 0 && opts.showConnectors && diff) {
        const unchanged = diff.unchanged;
        const prevWords = tokenized[i - 1];
        unchanged.forEach(word => {
          const prevIdx = prevWords.findIndex(w => w.toLowerCase() === word.toLowerCase());
          const currIdx = words.findIndex(w => w.toLowerCase() === word.toLowerCase());
          if (prevIdx >= 0 && currIdx >= 0) {
            const y1 = margin.top + 16 + prevIdx * lineH;
            const y2 = margin.top + 16 + currIdx * lineH;
            const x1 = margin.left + (i - 1) * colW + colW - 10;
            const x2 = margin.left + i * colW + 10;
            svg.appendChild(createLine(x1, y1, x2, y2, {
              stroke: withOpacity(opts.unchangedColor, 0.15), 'stroke-width': '1',
            }));
          }
        });
      }
    }

    wrapper.appendChild(svg);
    wrapper.style.overflowY = 'auto';
  }

  function renderCloud() {
    wrapper.innerHTML = '';
    addModeButtons();

    const w = size.width;
    const h = size.height;
    const svg = createSVG(w, h);
    svg.style.background = theme.bg;

    // Compare first and last
    const first = tokenize(texts[0].text);
    const last = tokenize(texts[texts.length - 1].text);
    const freqBefore = wordFrequency(first);
    const freqAfter = wordFrequency(last);
    const deltas = frequencyDelta(freqBefore, freqAfter);

    const maxDelta = Math.max(...deltas.map(d => Math.abs(d.delta)), 1);
    const fontScale = linearScale([0, maxDelta], [opts.minFontSize, opts.maxFontSize]);

    // Title
    svg.appendChild(createText(w / 2, 30, `Word Changes: ${texts[0].label} → ${texts[texts.length - 1].label}`, {
      fill: theme.text, 'font-size': '15', 'font-weight': '600', 'text-anchor': 'middle',
    }));

    // Simple spiral-ish placement
    const cx = w / 2;
    const cy = h / 2;
    let angle = 0;
    let radius = 0;
    const placed: { x: number; y: number; w: number; h: number }[] = [];

    deltas.slice(0, 60).forEach((item, i) => {
      if (item.delta === 0) return;
      const fontSize = fontScale(Math.abs(item.delta));
      const color = item.delta > 0 ? opts.addedColor : opts.removedColor;
      const wordW = item.word.length * fontSize * 0.6;
      const wordH = fontSize * 1.2;

      // Spiral placement
      let x: number, y: number;
      let attempts = 0;
      do {
        x = cx + Math.cos(angle) * radius - wordW / 2;
        y = cy + Math.sin(angle) * radius;
        angle += 0.5;
        radius += 1.5;
        attempts++;
      } while (attempts < 200 && placed.some(p =>
        x < p.x + p.w && x + wordW > p.x && y - wordH < p.y && y > p.y - p.h
      ));

      placed.push({ x, y, w: wordW, h: wordH });

      const text = createText(x + wordW / 2, y, item.word, {
        fill: withOpacity(color, 0.8 + Math.abs(item.delta) / maxDelta * 0.2),
        'font-size': String(Math.round(fontSize)),
        'font-weight': Math.abs(item.delta) > maxDelta * 0.5 ? '700' : '400',
        'text-anchor': 'middle',
      });
      text.classList.add('makeshift-node');
      text.addEventListener('mouseenter', (e) => {
        showTooltip(e.clientX, e.clientY,
          formatTooltipTitle(item.word) +
          formatTooltipRow('Before', item.before) + '<br>' +
          formatTooltipRow('After', item.after) + '<br>' +
          formatTooltipRow('Change', (item.delta > 0 ? '+' : '') + item.delta) +
          `<br><span style="color:${color};font-weight:600">${item.delta > 0 ? '▲ Added/Increased' : '▼ Removed/Decreased'}</span>`
        );
      });
      text.addEventListener('mouseleave', hideTooltip);
      svg.appendChild(text);
    });

    // Legend
    const ly = h - 30;
    svg.appendChild(createRect(w / 2 - 120, ly - 12, 14, 14, { rx: '3', fill: opts.addedColor }));
    svg.appendChild(createText(w / 2 - 100, ly, 'Added / Grew', { fill: theme.textMuted, 'font-size': '11' }));
    svg.appendChild(createRect(w / 2 + 20, ly - 12, 14, 14, { rx: '3', fill: opts.removedColor }));
    svg.appendChild(createText(w / 2 + 40, ly, 'Removed / Shrank', { fill: theme.textMuted, 'font-size': '11' }));

    wrapper.appendChild(svg);
  }

  function addModeButtons() {
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'position:absolute;top:8px;right:8px;display:flex;gap:6px;z-index:5;';
    const btnC = document.createElement('button');
    btnC.className = `makeshift-btn${currentMode === 'column' ? ' active' : ''}`;
    btnC.textContent = '📄 Column';
    btnC.addEventListener('click', () => { currentMode = 'column'; renderColumn(); });
    const btnW = document.createElement('button');
    btnW.className = `makeshift-btn${currentMode === 'cloud' ? ' active' : ''}`;
    btnW.textContent = '☁️ Cloud';
    btnW.addEventListener('click', () => { currentMode = 'cloud'; renderCloud(); });
    btnContainer.appendChild(btnC);
    btnContainer.appendChild(btnW);
    wrapper.appendChild(btnContainer);
  }

  if (currentMode === 'column') renderColumn(); else renderCloud();

  return {
    destroy: () => { wrapper.innerHTML = ''; },
    setMode: (mode) => { currentMode = mode; if (mode === 'column') renderColumn(); else renderCloud(); },
  };
}
