import type { OrgNode, OrgChartOptions, OrgEdge } from '../../core/types';
import { createSVG, createGroup, createRect, createText, createLine, createCircle, createPath, createContainer, getContainerSize } from '../../core/svg';
import { showTooltip, hideTooltip, formatTooltipTitle, formatTooltipRow } from '../../core/tooltip';
import { treeLayout, forceLayout, LayoutNode, ForceNode, ForceEdge } from '../../core/layout';
import { getThemeColors, PALETTES, withOpacity, getCategoryColor } from '../../core/colors';
import { linearScale } from '../../core/scales';
import { truncate, generateId } from '../../core/utils';
import { injectStyles } from '../../styles';

const DEFAULTS = {
  mode: 'hierarchy' as const, nodeRadius: 28, theme: 'dark' as const, animate: true,
};

export function orgChart(
  container: HTMLElement | string,
  nodes: OrgNode[],
  options: OrgChartOptions = {}
): { destroy: () => void; setMode: (mode: 'hierarchy' | 'influence') => void } {
  injectStyles();
  const opts = { ...DEFAULTS, ...options };
  const theme = getThemeColors(opts.theme);
  const el = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container;
  if (!el) throw new Error('makeshift.js: container not found');
  const size = getContainerSize(el, opts);
  const wrapper = createContainer(el, 'makeshift-org-chart');
  let currentMode = opts.mode;

  // Build hierarchy
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  function findChildren(parentId: string): OrgNode[] {
    return nodes.filter(n => n.manager === parentId);
  }
  const roots = nodes.filter(n => !n.manager || !nodeMap.has(n.manager));

  function renderHierarchy() {
    wrapper.innerHTML = '';
    addModeButtons();

    const nodeW = 160;
    const nodeH = 64;

    function toLayoutNode(org: OrgNode): LayoutNode {
      const children = findChildren(org.id).map(toLayoutNode);
      return { id: org.id, children, x: 0, y: 0, mod: 0, width: nodeW, height: nodeH, data: org };
    }

    const root = roots[0];
    if (!root) return;
    const layoutRoot = toLayoutNode(root);
    treeLayout(layoutRoot, nodeW, nodeH, 80, 30);

    let maxX = 0, maxY = 0;
    function findMax(n: LayoutNode) { maxX = Math.max(maxX, n.x); maxY = Math.max(maxY, n.y); n.children.forEach(findMax); }
    findMax(layoutRoot);

    const w = maxX + nodeW + 80;
    const h = maxY + nodeH + 80;
    const svgW = Math.max(size.width, w);
    const svgH = Math.max(size.height, h);
    const oX = (svgW - w) / 2 + 40;
    const oY = 60;

    const svg = createSVG(svgW, svgH);
    svg.style.background = theme.bg;

    // Title
    svg.appendChild(createText(svgW / 2, 30, 'Organization Hierarchy', { fill: theme.text, 'font-size': '16', 'font-weight': '600', 'text-anchor': 'middle' }));

    function renderEdges(n: LayoutNode) {
      for (const child of n.children) {
        const x1 = oX + n.x + nodeW / 2;
        const y1 = oY + n.y + nodeH;
        const x2 = oX + child.x + nodeW / 2;
        const y2 = oY + child.y;
        const midY = (y1 + y2) / 2;
        const d = `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
        svg.appendChild(createPath(d, { stroke: theme.border, 'stroke-width': '1.5', fill: 'none', 'stroke-opacity': '0.5' }));
        renderEdges(child);
      }
    }

    function renderNodes(n: LayoutNode) {
      const org = n.data as OrgNode;
      const x = oX + n.x;
      const y = oY + n.y;
      const g = createGroup({ transform: `translate(${x},${y})` });
      g.classList.add('makeshift-node');

      const depth = Math.round(n.y / (nodeH + 80));
      const color = getCategoryColor(depth);

      g.appendChild(createRect(0, 0, nodeW, nodeH, { rx: '10', fill: theme.surface, stroke: withOpacity(color, 0.4), 'stroke-width': '1.5' }));
      g.appendChild(createRect(0, 0, 4, nodeH, { rx: '2', fill: color }));
      g.appendChild(createText(16, 24, truncate(org.name, 18), { fill: theme.text, 'font-size': '13', 'font-weight': '600' }));
      g.appendChild(createText(16, 44, truncate(org.title || '', 20), { fill: theme.textMuted, 'font-size': '11' }));

      g.addEventListener('mouseenter', (e) => {
        let html = formatTooltipTitle(org.name);
        if (org.title) html += formatTooltipRow('Title', org.title) + '<br>';
        if (org.metrics) {
          for (const [k, v] of Object.entries(org.metrics)) {
            html += formatTooltipRow(k, String(v)) + '<br>';
          }
        }
        const reports = findChildren(org.id);
        html += formatTooltipRow('Direct Reports', reports.length);
        showTooltip(e.clientX, e.clientY, html);
      });
      g.addEventListener('mouseleave', hideTooltip);

      svg.appendChild(g);
      n.children.forEach(renderNodes);
    }

    renderEdges(layoutRoot);
    renderNodes(layoutRoot);
    wrapper.appendChild(svg);
    wrapper.style.overflowX = 'auto';
    wrapper.style.overflowY = 'auto';
  }

  function renderInfluence() {
    wrapper.innerHTML = '';
    addModeButtons();

    const w = size.width;
    const h = size.height;
    const edges: OrgEdge[] = opts.influenceEdges || [];

    // Map metrics for node sizing
    const sizeMetric = opts.sizeMetric || (nodes[0]?.metrics ? Object.keys(nodes[0].metrics)[0] : '');
    const metricValues = nodes.map(n => n.metrics?.[sizeMetric] ?? 1);
    const maxMetric = Math.max(...metricValues, 1);
    const minR = 16, maxR = 44;
    const sizeScale = linearScale([0, maxMetric], [minR, maxR]);

    const forceNodes: ForceNode[] = nodes.map(n => ({
      id: n.id, x: 0, y: 0, vx: 0, vy: 0,
      radius: sizeScale(n.metrics?.[sizeMetric] ?? 1),
      data: n,
    }));

    const forceEdges: ForceEdge[] = edges.map(e => ({ source: e.source, target: e.target, weight: e.weight ?? 1 }));
    // Also add hierarchy edges as weak connections
    for (const n of nodes) {
      if (n.manager && nodeMap.has(n.manager)) {
        const existing = forceEdges.find(e => (e.source === n.manager && e.target === n.id) || (e.source === n.id && e.target === n.manager));
        if (!existing) forceEdges.push({ source: n.manager, target: n.id, weight: 0.3 });
      }
    }

    forceLayout(forceNodes, forceEdges, w - 80, h - 100, 150);

    const svg = createSVG(w, h);
    svg.style.background = theme.bg;
    svg.appendChild(createText(w / 2, 30, 'Influence Network', { fill: theme.text, 'font-size': '16', 'font-weight': '600', 'text-anchor': 'middle' }));

    const fnMap = new Map(forceNodes.map(n => [n.id, n]));

    // Edges
    const maxWeight = Math.max(...forceEdges.map(e => e.weight), 1);
    for (const edge of forceEdges) {
      const s = fnMap.get(edge.source);
      const t = fnMap.get(edge.target);
      if (!s || !t) continue;
      const strokeW = 1 + (edge.weight / maxWeight) * 3;
      svg.appendChild(createLine(s.x, s.y, t.x, t.y, {
        stroke: withOpacity(theme.highlight, 0.3), 'stroke-width': String(strokeW),
      }));
    }

    // Nodes
    for (const fn of forceNodes) {
      const org = fn.data as OrgNode;
      const g = createGroup({ transform: `translate(${fn.x},${fn.y})` });
      g.classList.add('makeshift-node');
      g.appendChild(createCircle(0, 0, fn.radius, {
        fill: withOpacity(PALETTES.categorical[nodes.indexOf(org) % PALETTES.categorical.length], 0.3),
        stroke: PALETTES.categorical[nodes.indexOf(org) % PALETTES.categorical.length],
        'stroke-width': '2',
      }));
      g.appendChild(createText(0, 4, truncate(org.name.split(' ')[0], 10), {
        fill: theme.text, 'font-size': String(Math.max(10, fn.radius * 0.4)),
        'text-anchor': 'middle', 'font-weight': '500',
      }));

      g.addEventListener('mouseenter', (e) => {
        let html = formatTooltipTitle(org.name);
        if (org.title) html += formatTooltipRow('Title', org.title) + '<br>';
        if (sizeMetric && org.metrics?.[sizeMetric] !== undefined) {
          html += formatTooltipRow(sizeMetric, String(org.metrics[sizeMetric])) + '<br>';
        }
        const connections = forceEdges.filter(e => e.source === org.id || e.target === org.id);
        html += formatTooltipRow('Connections', connections.length);
        showTooltip(e.clientX, e.clientY, html);
      });
      g.addEventListener('mouseleave', hideTooltip);

      svg.appendChild(g);
    }

    wrapper.appendChild(svg);
  }

  function addModeButtons() {
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'position:absolute;top:8px;right:8px;display:flex;gap:6px;z-index:5;';
    const btnH = document.createElement('button');
    btnH.className = `makeshift-btn${currentMode === 'hierarchy' ? ' active' : ''}`;
    btnH.textContent = '🏢 Hierarchy';
    btnH.addEventListener('click', () => { currentMode = 'hierarchy'; renderHierarchy(); });
    const btnI = document.createElement('button');
    btnI.className = `makeshift-btn${currentMode === 'influence' ? ' active' : ''}`;
    btnI.textContent = '🔗 Influence';
    btnI.addEventListener('click', () => { currentMode = 'influence'; renderInfluence(); });
    btnContainer.appendChild(btnH);
    btnContainer.appendChild(btnI);
    wrapper.appendChild(btnContainer);
  }

  if (currentMode === 'hierarchy') renderHierarchy();
  else renderInfluence();

  return {
    destroy: () => { wrapper.innerHTML = ''; },
    setMode: (mode) => { currentMode = mode; if (mode === 'hierarchy') renderHierarchy(); else renderInfluence(); },
  };
}
