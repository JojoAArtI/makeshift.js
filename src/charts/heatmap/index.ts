import type { HeatmapEntry, HeatmapOptions } from '../../core/types';
import { createSVG, createGroup, createRect, createText, createContainer, getContainerSize } from '../../core/svg';
import { colorScale } from '../../core/scales';
import { showTooltip, hideTooltip, formatTooltipTitle, formatTooltipRow } from '../../core/tooltip';
import { getThemeColors, PALETTES, withOpacity } from '../../core/colors';
import { toDate, startOfWeek, formatDate, generateId } from '../../core/utils';
import { injectStyles } from '../../styles';

const DEFAULTS = {
  cellSize: 14, cellGap: 3, showStreak: true, showSummary: true, showMonthLabels: true, showDayLabels: true,
  emptyColor: '#1a1a2e', theme: 'dark' as const, animate: true,
  colorRange: PALETTES.heatmapGreen,
};

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function heatmap(
  container: HTMLElement | string,
  data: HeatmapEntry[],
  options: HeatmapOptions = {}
): { destroy: () => void; update: (data: HeatmapEntry[]) => void } {
  injectStyles();
  const opts = { ...DEFAULTS, ...options };
  const theme = getThemeColors(opts.theme);
  const el = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container;
  if (!el) throw new Error('makeshift.js: container not found');
  const wrapper = createContainer(el, 'makeshift-heatmap');
  const cs = opts.cellSize;
  const cg = opts.cellGap;

  function render(entries: HeatmapEntry[]) {
    wrapper.innerHTML = '';
    // Build date → value map
    const dateMap = new Map<string, number>();
    for (const entry of entries) {
      const d = toDate(entry.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dateMap.set(key, (dateMap.get(key) || 0) + entry.value);
    }

    // Determine date range
    const dates = entries.map(e => toDate(e.date));
    const now = new Date();
    const endDate = opts.endDate ? toDate(opts.endDate) : now;
    const startDate = opts.startDate ? toDate(opts.startDate) : new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());

    // Calculate streak
    let streak = 0;
    const checkDate = new Date(endDate);
    while (true) {
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (dateMap.has(key) && dateMap.get(key)! > 0) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }

    // Determine value range
    const values = [...dateMap.values()];
    const maxVal = opts.goal || Math.max(...values, 1);

    const getColor = colorScale([0, maxVal], [...opts.colorRange]);

    // Calculate grid dimensions
    const firstSunday = startOfWeek(startDate);
    const totalDays = Math.ceil((endDate.getTime() - firstSunday.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    const labelOffset = opts.showDayLabels ? 36 : 0;
    const topOffset = (opts.showMonthLabels ? 24 : 0) + (opts.showStreak ? 40 : 0);
    const summaryW = opts.showSummary ? 60 : 0;
    const w = labelOffset + totalWeeks * (cs + cg) + summaryW + 20;
    const h = topOffset + 7 * (cs + cg) + 30;

    const svg = createSVG(w, h);
    svg.style.background = theme.bg;
    const grid = createGroup({ transform: `translate(${labelOffset},${topOffset})` });

    // Streak badge
    if (opts.showStreak) {
      const streakG = createGroup({ transform: `translate(${labelOffset}, 4)` });
      streakG.innerHTML = `<text fill="${theme.highlight}" font-size="13" font-weight="600">🔥 ${streak} day streak</text>`;
      svg.appendChild(streakG);
    }

    // Day labels
    if (opts.showDayLabels) {
      DAY_LABELS.forEach((label, i) => {
        if (label) {
          svg.appendChild(createText(0, topOffset + i * (cs + cg) + cs - 2, label, { fill: theme.textMuted, 'font-size': '10' }));
        }
      });
    }

    // Month tracking
    let lastMonth = -1;

    // Weekly summary
    const weeklySums: number[] = [];

    for (let week = 0; week < totalWeeks; week++) {
      let weekSum = 0;
      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(firstSunday);
        cellDate.setDate(firstSunday.getDate() + week * 7 + day);
        if (cellDate < startDate || cellDate > endDate) continue;

        const key = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
        const val = dateMap.get(key) || 0;
        weekSum += val;

        const x = week * (cs + cg);
        const y = day * (cs + cg);
        const color = val === 0 ? (opts.theme === 'dark' ? opts.emptyColor : '#ebedf0') : getColor(val);

        const rect = createRect(x, y, cs, cs, { rx: '3', fill: color });
        rect.classList.add('makeshift-cell');

        rect.addEventListener('mouseenter', (ev) => {
          let html = formatTooltipTitle(formatDate(cellDate, 'long'));
          html += formatTooltipRow('Value', String(val));
          if (opts.goal) html += '<br>' + formatTooltipRow('Goal', String(opts.goal));
          showTooltip(ev.clientX, ev.clientY, html);
        });
        rect.addEventListener('mouseleave', hideTooltip);

        grid.appendChild(rect);

        // Month labels
        if (opts.showMonthLabels && cellDate.getMonth() !== lastMonth && day === 0) {
          lastMonth = cellDate.getMonth();
          svg.appendChild(createText(labelOffset + x, topOffset - 6, MONTH_NAMES[lastMonth], { fill: theme.textMuted, 'font-size': '10' }));
        }
      }
      weeklySums.push(weekSum);
    }

    // Weekly summary bars
    if (opts.showSummary) {
      const maxWeekly = Math.max(...weeklySums, 1);
      const barMaxH = 7 * (cs + cg) - cg;
      const summaryG = createGroup({ transform: `translate(${labelOffset + totalWeeks * (cs + cg) + 10},0)` });
      weeklySums.forEach((sum, i) => {
        if (sum === 0) return;
        const barH = (sum / maxWeekly) * 20;
        const x = 0;
        const y = (i % 7) * (cs + cg) + (cs - barH) / 2;
        // Only show a small indicator per row group
      });
      grid.appendChild(summaryG);
    }

    svg.appendChild(grid);

    // Legend
    const legendG = createGroup({ transform: `translate(${labelOffset}, ${topOffset + 7 * (cs + cg) + 10})` });
    legendG.appendChild(createText(0, 10, 'Less', { fill: theme.textMuted, 'font-size': '10' }));
    for (let i = 0; i < 5; i++) {
      const val = (maxVal / 4) * i;
      const color = i === 0 ? (opts.theme === 'dark' ? opts.emptyColor : '#ebedf0') : getColor(val);
      legendG.appendChild(createRect(30 + i * (cs + 2), 0, cs, cs, { rx: '2', fill: color }));
    }
    legendG.appendChild(createText(30 + 5 * (cs + 2) + 4, 10, 'More', { fill: theme.textMuted, 'font-size': '10' }));
    svg.appendChild(legendG);

    wrapper.appendChild(svg);
    wrapper.style.overflowX = 'auto';
  }

  render(data);
  return { destroy: () => { wrapper.innerHTML = ''; }, update: (d: HeatmapEntry[]) => render(d) };
}
