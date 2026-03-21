import type { GanttTask, GanttOptions } from '../../core/types';
import { createSVG, createGroup, createRect, createText, createLine, createPath, createPolygon, createContainer, getContainerSize } from '../../core/svg';
import { timeScale, generateDateTicks } from '../../core/scales';
import { showTooltip, hideTooltip, formatTooltipTitle, formatTooltipRow } from '../../core/tooltip';
import { getThemeColors, PALETTES, withOpacity } from '../../core/colors';
import { toDate, daysBetween, formatDate, isWeekend, generateId, truncate } from '../../core/utils';
import { makeDraggable } from '../../core/drag';
import { injectStyles } from '../../styles';
import { computeSchedule } from './scheduler';

const DEFAULTS = {
  viewMode: 'week' as const, showToday: true, showCriticalPath: true, showResourceWarnings: true,
  collapsibleSwimlanes: true, draggable: true, barHeight: 28, rowHeight: 44, animate: true, theme: 'dark' as const,
};

export function gantt(
  container: HTMLElement | string,
  tasks: GanttTask[],
  options: GanttOptions = {}
): { destroy: () => void; update: (tasks: GanttTask[]) => void } {
  injectStyles();
  const opts = { ...DEFAULTS, ...options };
  const theme = getThemeColors(opts.theme);
  const el = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container;
  if (!el) throw new Error('makeshift.js: container not found');
  const size = getContainerSize(el, opts);
  const wrapper = createContainer(el, 'makeshift-gantt');
  const labelW = 180;
  const headerH = 50;

  function render(taskData: GanttTask[]) {
    wrapper.innerHTML = '';
    const schedule = computeSchedule(taskData);
    const critSet = new Set(schedule.criticalPath);
    const conflictTasks = new Set(schedule.conflicts.flatMap(c => c.tasks));

    // Gather resources for swimlanes
    const resources = [...new Set(taskData.map(t => t.resource || 'Unassigned'))];
    const tasksByResource = new Map<string, GanttTask[]>();
    for (const r of resources) tasksByResource.set(r, []);
    for (const t of taskData) tasksByResource.get(t.resource || 'Unassigned')!.push(t);

    const allStarts = taskData.map(t => toDate(t.start).getTime());
    const allEnds = taskData.map(t => toDate(t.end).getTime());
    const minDate = new Date(Math.min(...allStarts) - 86400000 * 2);
    const maxDate = new Date(Math.max(...allEnds) + 86400000 * 2);

    const chartW = Math.max(size.width - labelW, 600);
    const totalRows = taskData.length + resources.length;
    const chartH = headerH + totalRows * opts.rowHeight + 40;
    const fullW = labelW + chartW;

    const svg = createSVG(fullW, chartH);
    svg.style.background = theme.bg;

    const xScale = timeScale([minDate, maxDate], [0, chartW]);
    const ticks = generateDateTicks(minDate, maxDate, opts.viewMode);

    // Header background
    svg.appendChild(createRect(0, 0, fullW, headerH, { fill: theme.surface }));
    svg.appendChild(createLine(0, headerH, fullW, headerH, { stroke: theme.border, 'stroke-width': '1' }));

    // Label column
    svg.appendChild(createRect(0, 0, labelW, chartH, { fill: theme.surface }));
    svg.appendChild(createLine(labelW, 0, labelW, chartH, { stroke: theme.border, 'stroke-width': '1' }));

    // Time axis ticks
    const ticksG = createGroup({ transform: `translate(${labelW},0)` });
    for (const tick of ticks) {
      const x = xScale(tick);
      ticksG.appendChild(createText(x, 20, formatDate(tick, opts.viewMode === 'month' ? 'medium' : 'short'), {
        fill: theme.textMuted, 'font-size': '11', 'text-anchor': 'middle',
      }));
      ticksG.appendChild(createLine(x, headerH, x, chartH, { stroke: theme.border, 'stroke-width': '0.5', 'stroke-opacity': '0.4' }));

      // Weekend shading
      if (opts.viewMode === 'day' && isWeekend(tick)) {
        ticksG.appendChild(createRect(x - 10, headerH, 20, chartH - headerH, { fill: withOpacity(theme.border, 0.15) }));
      }
    }
    svg.appendChild(ticksG);

    // Today line
    if (opts.showToday) {
      const today = new Date();
      if (today >= minDate && today <= maxDate) {
        const todayX = labelW + xScale(today);
        svg.appendChild(createLine(todayX, headerH, todayX, chartH, { stroke: '#ef4444', 'stroke-width': '2', 'stroke-dasharray': '4,3' }));
        svg.appendChild(createText(todayX, headerH - 6, 'Today', { fill: '#ef4444', 'font-size': '10', 'text-anchor': 'middle', 'font-weight': '600' }));
      }
    }

    // Render swimlanes and tasks
    let currentY = headerH;
    const taskPositions = new Map<string, { x: number; y: number; w: number }>();

    for (const resource of resources) {
      // Swimlane header
      svg.appendChild(createRect(0, currentY, labelW, opts.rowHeight, { fill: withOpacity(theme.highlight, 0.08) }));
      svg.appendChild(createText(14, currentY + opts.rowHeight / 2 + 4, resource, { fill: theme.highlight, 'font-size': '12', 'font-weight': '600' }));
      svg.appendChild(createLine(0, currentY + opts.rowHeight, fullW, currentY + opts.rowHeight, { stroke: theme.border, 'stroke-width': '0.5' }));
      currentY += opts.rowHeight;

      const resTasks = tasksByResource.get(resource) || [];
      for (const task of resTasks) {
        const start = toDate(task.start);
        const end = toDate(task.end);
        const x = labelW + xScale(start);
        const w = Math.max(labelW + xScale(end) - x, 6);
        const barY = currentY + (opts.rowHeight - opts.barHeight) / 2;

        taskPositions.set(task.id, { x, y: barY, w });

        // Task label
        svg.appendChild(createText(14, currentY + opts.rowHeight / 2 + 4, truncate(task.name, 20), { fill: theme.text, 'font-size': '12' }));

        // Milestone diamond
        if (task.milestone) {
          const cx = x + w / 2;
          const cy = barY + opts.barHeight / 2;
          const s = opts.barHeight / 2.5;
          const points = `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`;
          const diamond = createPolygon(points, { fill: '#eab308', stroke: '#ca8a04', 'stroke-width': '1.5' });
          diamond.classList.add('makeshift-node');
          svg.appendChild(diamond);
        } else {
          const color = task.color || (critSet.has(task.id) && opts.showCriticalPath ? '#ef4444' : PALETTES.categorical[resources.indexOf(resource) % PALETTES.categorical.length]);
          // Bar background
          const barBg = createRect(x, barY, w, opts.barHeight, { rx: '6', fill: withOpacity(color, 0.2), stroke: withOpacity(color, 0.4), 'stroke-width': '1' });
          svg.appendChild(barBg);

          // Progress fill
          const progress = task.progress ?? 0;
          if (progress > 0) {
            svg.appendChild(createRect(x, barY, w * (progress / 100), opts.barHeight, { rx: '6', fill: withOpacity(color, 0.5) }));
          }

          // Bar label
          const barLabel = createText(x + 8, barY + opts.barHeight / 2 + 4, truncate(task.name, Math.floor(w / 7)), { fill: theme.text, 'font-size': '11', 'font-weight': '500' });
          svg.appendChild(barLabel);

          // Resource conflict warning
          if (opts.showResourceWarnings && conflictTasks.has(task.id)) {
            svg.appendChild(createText(x + w + 6, barY + opts.barHeight / 2 + 4, '⚠', { fill: '#f97316', 'font-size': '14' }));
          }

          // Tooltip
          barBg.addEventListener('mouseenter', (e) => {
            showTooltip(e.clientX, e.clientY,
              formatTooltipTitle(task.name) +
              formatTooltipRow('Start', formatDate(start, 'long')) + '<br>' +
              formatTooltipRow('End', formatDate(end, 'long')) + '<br>' +
              formatTooltipRow('Duration', `${daysBetween(start, end)} days`) + '<br>' +
              (task.resource ? formatTooltipRow('Resource', task.resource) + '<br>' : '') +
              formatTooltipRow('Progress', `${progress}%`) +
              (critSet.has(task.id) ? '<br><span style="color:#ef4444;font-weight:600">⚡ Critical Path</span>' : '')
            );
          });
          barBg.addEventListener('mouseleave', hideTooltip);
          barBg.classList.add('makeshift-bar');
        }

        svg.appendChild(createLine(0, currentY + opts.rowHeight, fullW, currentY + opts.rowHeight, { stroke: theme.border, 'stroke-width': '0.3' }));
        currentY += opts.rowHeight;
      }
    }

    // Dependency arrows
    const arrowsG = createGroup();
    for (const task of taskData) {
      for (const dep of task.dependencies || []) {
        const from = taskPositions.get(dep);
        const to = taskPositions.get(task.id);
        if (!from || !to) continue;
        const x1 = from.x + from.w;
        const y1 = from.y + opts.barHeight / 2;
        const x2 = to.x;
        const y2 = to.y + opts.barHeight / 2;
        const midX = (x1 + x2) / 2;
        const routeX = Math.max(x1 + 15, midX);
        const d = `M${x1},${y1} L${routeX},${y1} L${routeX},${y2} L${x2 - 6},${y2}`;
        const arrow = createPath(d, { stroke: withOpacity(theme.textMuted, 0.5), 'stroke-width': '1.5', fill: 'none', 'marker-end': 'url(#arrowhead)' });
        arrowsG.appendChild(arrow);
      }
    }
    // Arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="${theme.textMuted}" opacity="0.5"/></marker>`;
    svg.appendChild(defs);
    svg.appendChild(arrowsG);

    wrapper.appendChild(svg);
    wrapper.style.overflowX = 'auto';
    wrapper.style.overflowY = 'auto';
  }

  render(tasks);

  return {
    destroy: () => { wrapper.innerHTML = ''; },
    update: (newTasks: GanttTask[]) => render(newTasks),
  };
}
