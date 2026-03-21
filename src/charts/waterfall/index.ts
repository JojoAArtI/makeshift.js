import type { WaterfallEntry, WaterfallOptions } from '../../core/types';
import { createSVG, createGroup, createRect, createText, createLine, createContainer, getContainerSize } from '../../core/svg';
import { linearScale, generateTicks } from '../../core/scales';
import { showTooltip, hideTooltip, formatTooltipTitle, formatTooltipRow } from '../../core/tooltip';
import { getThemeColors, PALETTES, withOpacity } from '../../core/colors';
import { formatNumber, generateId, resolveMargin } from '../../core/utils';
import { injectStyles } from '../../styles';

const DEFAULTS = {
  showRunningTotal: true, whatIf: false, theme: 'dark' as const, animate: true,
  positiveColor: PALETTES.waterfall.positive, negativeColor: PALETTES.waterfall.negative, totalColor: PALETTES.waterfall.total,
};

export function waterfall(
  container: HTMLElement | string,
  data: WaterfallEntry[],
  options: WaterfallOptions = {}
): { destroy: () => void; update: (data: WaterfallEntry[]) => void } {
  injectStyles();
  const opts = { ...DEFAULTS, ...options };
  const theme = getThemeColors(opts.theme);
  const el = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container;
  if (!el) throw new Error('makeshift.js: container not found');
  const size = getContainerSize(el, opts);
  const wrapper = createContainer(el, 'makeshift-waterfall');
  const margin = resolveMargin(opts.margin);
  const categoryColors = opts.categoryColors || {};

  function render(entries: WaterfallEntry[]) {
    wrapper.innerHTML = '';
    const w = size.width;
    const h = size.height;
    const chartW = w - margin.left - margin.right;
    const chartH = h - margin.top - margin.bottom;

    // Calculate running totals
    let running = 0;
    const items = entries.map(entry => {
      if (entry.isTotal) {
        return { ...entry, start: 0, end: running, barStart: 0, barEnd: running };
      }
      const prev = running;
      running += entry.amount;
      return { ...entry, start: prev, end: running, barStart: Math.min(prev, running), barEnd: Math.max(prev, running) };
    });

    // Scales
    const allValues = items.flatMap(i => [i.barStart!, i.barEnd!]);
    const yMin = Math.min(0, ...allValues);
    const yMax = Math.max(0, ...allValues);
    const yPad = (yMax - yMin) * 0.1;
    const yScale = linearScale([yMin - yPad, yMax + yPad], [chartH, 0]);
    const barW = Math.max((chartW / items.length) * 0.6, 20);
    const gap = (chartW - barW * items.length) / (items.length + 1);

    const svg = createSVG(w, h);
    svg.style.background = theme.bg;
    const chart = createGroup({ transform: `translate(${margin.left},${margin.top})` });

    // Y-axis gridlines
    const ticks = generateTicks(yMin - yPad, yMax + yPad, 6);
    for (const tick of ticks) {
      const ty = yScale(tick);
      chart.appendChild(createLine(0, ty, chartW, ty, { stroke: theme.grid, 'stroke-width': '0.5', 'stroke-opacity': '0.4' }));
      chart.appendChild(createText(-8, ty + 4, formatNumber(tick, { compact: true }), { fill: theme.textMuted, 'font-size': '11', 'text-anchor': 'end' }));
    }

    // Zero line
    const zeroY = yScale(0);
    chart.appendChild(createLine(0, zeroY, chartW, zeroY, { stroke: theme.border, 'stroke-width': '1' }));

    // Bars
    items.forEach((item, i) => {
      const x = gap + i * (barW + gap);
      const barTop = yScale(item.barEnd!);
      const barBottom = yScale(item.barStart!);
      const barH = Math.max(barBottom - barTop, 1);

      let color: string;
      if (item.isTotal) { color = opts.totalColor; }
      else if (item.category && categoryColors[item.category]) { color = categoryColors[item.category]; }
      else { color = item.amount >= 0 ? opts.positiveColor : opts.negativeColor; }

      // Connector line from previous bar
      if (i > 0 && !item.isTotal) {
        const prevEnd = items[i - 1].end!;
        const connY = yScale(prevEnd);
        const prevX = gap + (i - 1) * (barW + gap) + barW;
        chart.appendChild(createLine(prevX, connY, x, connY, { stroke: theme.border, 'stroke-width': '1', 'stroke-dasharray': '3,2' }));
      }

      const rect = createRect(x, barTop, barW, barH, { rx: '4', fill: color });
      rect.classList.add('makeshift-bar');

      // Value label on bar
      const valY = item.amount >= 0 ? barTop - 6 : barBottom + 14;
      const valText = createText(x + barW / 2, valY, formatNumber(item.amount, { compact: true, currency: true }), {
        fill: color, 'font-size': '11', 'font-weight': '600', 'text-anchor': 'middle',
      });

      // X-axis label
      const labelY = chartH + 16;
      const label = createText(x + barW / 2, labelY, item.label, {
        fill: theme.textMuted, 'font-size': '11', 'text-anchor': 'middle',
      });

      // Tooltip with transaction details
      rect.addEventListener('mouseenter', (e) => {
        let html = formatTooltipTitle(item.label) + formatTooltipRow('Amount', formatNumber(item.amount, { currency: true })) + '<br>' +
          formatTooltipRow('Running Total', formatNumber(item.end!, { currency: true }));
        if (item.category) html += '<br>' + formatTooltipRow('Category', item.category);
        if (item.transactions && item.transactions.length > 0) {
          html += '<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px">';
          for (const tx of item.transactions.slice(0, 5)) {
            html += `<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span style="color:#94a3b8">${tx.description}</span><span style="color:${tx.amount >= 0 ? opts.positiveColor : opts.negativeColor}">${formatNumber(tx.amount, { currency: true })}</span></div>`;
          }
          if (item.transactions.length > 5) html += `<div style="font-size:10px;color:#64748b;margin-top:4px">...${item.transactions.length - 5} more</div>`;
          html += '</div>';
        }
        showTooltip(e.clientX, e.clientY, html);
      });
      rect.addEventListener('mouseleave', hideTooltip);

      chart.appendChild(rect);
      chart.appendChild(valText);
      chart.appendChild(label);
    });

    // Running total line
    if (opts.showRunningTotal) {
      let pathD = '';
      items.forEach((item, i) => {
        const x = gap + i * (barW + gap) + barW / 2;
        const y = yScale(item.end!);
        pathD += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
      });
      if (pathD) {
        const totalLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        totalLine.setAttribute('d', pathD);
        totalLine.setAttribute('fill', 'none');
        totalLine.setAttribute('stroke', withOpacity(opts.totalColor, 0.5));
        totalLine.setAttribute('stroke-width', '2');
        totalLine.setAttribute('stroke-dasharray', '6,3');
        chart.appendChild(totalLine);
      }
    }

    svg.appendChild(chart);
    wrapper.appendChild(svg);
  }

  render(data);
  return { destroy: () => { wrapper.innerHTML = ''; }, update: (d: WaterfallEntry[]) => render(d) };
}
