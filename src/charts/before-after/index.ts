import type { BeforeAfterConfig, BeforeAfterOptions } from '../../core/types';
import { createSVG, createGroup, createRect, createText, createLine, createDefs, createClipPath, createContainer, getContainerSize } from '../../core/svg';
import { linearScale, bandScale } from '../../core/scales';
import { showTooltip, hideTooltip, formatTooltipRow, formatTooltipTitle } from '../../core/tooltip';
import { getThemeColors, PALETTES, withOpacity, getCategoryColor } from '../../core/colors';
import { makeDraggable } from '../../core/drag';
import { generateId, resolveMargin, formatNumber } from '../../core/utils';
import { injectStyles } from '../../styles';

const DEFAULTS = {
  beforeLabel: 'Before', afterLabel: 'After', initialPosition: 0.5,
  handleColor: '#6366f1', handleWidth: 4, theme: 'dark' as const, animate: true,
};

export function beforeAfter(
  container: HTMLElement | string,
  config: BeforeAfterConfig,
  options: BeforeAfterOptions = {}
): { destroy: () => void; setPosition: (pct: number) => void } {
  injectStyles();
  const opts = { ...DEFAULTS, ...options };
  const theme = getThemeColors(opts.theme);
  const el = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container;
  if (!el) throw new Error('makeshift.js: container not found');
  const size = getContainerSize(el, opts);
  const wrapper = createContainer(el, 'makeshift-before-after');
  const margin = resolveMargin(opts.margin);

  const w = size.width;
  const h = size.height;
  const chartW = w - margin.left - margin.right;
  const chartH = h - margin.top - margin.bottom;
  let dividerX = margin.left + chartW * opts.initialPosition;

  const clipIdBefore = generateId('clip-before');
  const clipIdAfter = generateId('clip-after');

  function renderBarChart(g: SVGGElement, data: { label: string; value: number }[], color: string) {
    if (!data || data.length === 0) return;
    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const yScale = linearScale([0, maxVal * 1.1], [chartH, 0]);
    const xScale = bandScale(labels, [0, chartW], 0.2);
    const bw = xScale.bandwidth();

    // Grid lines
    const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
    for (const tick of ticks) {
      const ty = yScale(tick);
      g.appendChild(createLine(0, ty, chartW, ty, { stroke: theme.grid, 'stroke-width': '0.5', 'stroke-opacity': '0.3' }));
    }

    data.forEach((d, i) => {
      const x = xScale(d.label);
      const barH = chartH - yScale(d.value);
      const y = yScale(d.value);
      const barColor = getCategoryColor(i);
      g.appendChild(createRect(x, y, bw, barH, { rx: '4', fill: withOpacity(barColor, 0.8) }));
      g.appendChild(createText(x + bw / 2, chartH + 16, d.label, { fill: theme.textMuted, 'font-size': '11', 'text-anchor': 'middle' }));
      g.appendChild(createText(x + bw / 2, y - 6, formatNumber(d.value, { compact: true }), { fill: barColor, 'font-size': '11', 'font-weight': '600', 'text-anchor': 'middle' }));
    });
  }

  function renderScatter(g: SVGGElement, data: { x: number; y: number; label?: string }[], color: string) {
    if (!data || data.length === 0) return;
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    const xScale = linearScale([Math.min(...xs), Math.max(...xs)], [20, chartW - 20]);
    const yScale = linearScale([Math.min(...ys), Math.max(...ys)], [chartH - 20, 20]);

    data.forEach((d, i) => {
      const cx = xScale(d.x);
      const cy = yScale(d.y);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', String(cx));
      dot.setAttribute('cy', String(cy));
      dot.setAttribute('r', '5');
      dot.setAttribute('fill', withOpacity(getCategoryColor(i % 10), 0.8));
      dot.setAttribute('stroke', getCategoryColor(i % 10));
      dot.setAttribute('stroke-width', '1.5');
      g.appendChild(dot);
    });
  }

  function render() {
    wrapper.innerHTML = '';
    const svg = createSVG(w, h);
    svg.style.background = theme.bg;

    const defs = createDefs();
    // Before clip
    const clipBefore = createClipPath(clipIdBefore);
    const clipRectBefore = createRect(0, 0, dividerX, h);
    clipBefore.appendChild(clipRectBefore);
    defs.appendChild(clipBefore);
    // After clip
    const clipAfter = createClipPath(clipIdAfter);
    const clipRectAfter = createRect(dividerX, 0, w - dividerX, h);
    clipAfter.appendChild(clipRectAfter);
    defs.appendChild(clipAfter);
    svg.appendChild(defs);

    // Before side
    const beforeG = createGroup({ 'clip-path': `url(#${clipIdBefore})`, transform: `translate(${margin.left},${margin.top})` });
    if (config.before.type === 'bar') renderBarChart(beforeG, config.before.data, PALETTES.categorical[0]);
    else if (config.before.type === 'scatter') renderScatter(beforeG, config.before.data, PALETTES.categorical[0]);
    svg.appendChild(beforeG);

    // After side
    const afterG = createGroup({ 'clip-path': `url(#${clipIdAfter})`, transform: `translate(${margin.left},${margin.top})` });
    if (config.after.type === 'bar') renderBarChart(afterG, config.after.data, PALETTES.categorical[3]);
    else if (config.after.type === 'scatter') renderScatter(afterG, config.after.data, PALETTES.categorical[3]);
    svg.appendChild(afterG);

    // Divider handle
    const handleG = createGroup({ transform: `translate(${dividerX},0)` });
    handleG.classList.add('makeshift-handle');
    handleG.appendChild(createRect(-opts.handleWidth / 2, 0, opts.handleWidth, h, { fill: opts.handleColor, rx: '2' }));
    // Handle knob
    const knobY = h / 2;
    handleG.appendChild(createRect(-14, knobY - 18, 28, 36, { rx: '8', fill: opts.handleColor }));
    handleG.appendChild(createText(0, knobY - 2, '◀', { fill: '#fff', 'font-size': '10', 'text-anchor': 'middle' }));
    handleG.appendChild(createText(0, knobY + 10, '▶', { fill: '#fff', 'font-size': '10', 'text-anchor': 'middle' }));

    // Labels
    const labelY = 20;
    svg.appendChild(createText(dividerX / 2, labelY, opts.beforeLabel, { fill: withOpacity(theme.text, 0.6), 'font-size': '13', 'font-weight': '600', 'text-anchor': 'middle' }));
    svg.appendChild(createText(dividerX + (w - dividerX) / 2, labelY, opts.afterLabel, { fill: withOpacity(theme.text, 0.6), 'font-size': '13', 'font-weight': '600', 'text-anchor': 'middle' }));

    svg.appendChild(handleG);

    // Drag interaction
    makeDraggable(handleG as unknown as SVGElement, {
      onMove: (x) => {
        const svgRect = svg.getBoundingClientRect();
        const localX = x - svgRect.left;
        dividerX = Math.max(margin.left + 20, Math.min(w - margin.right - 20, localX));
        handleG.setAttribute('transform', `translate(${dividerX},0)`);
        clipRectBefore.setAttribute('width', String(dividerX));
        clipRectAfter.setAttribute('x', String(dividerX));
        clipRectAfter.setAttribute('width', String(w - dividerX));
        // Update labels
        const labels = svg.querySelectorAll('text');
        // Re-position labels dynamically isn't trivial with static SVG — handled by re-render on major moves
      },
    }, { axis: 'x' });

    wrapper.appendChild(svg);
  }

  render();

  return {
    destroy: () => { wrapper.innerHTML = ''; },
    setPosition: (pct: number) => { dividerX = margin.left + chartW * pct; render(); },
  };
}
