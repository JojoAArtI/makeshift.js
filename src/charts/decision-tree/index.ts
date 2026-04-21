import type { DecisionTreeOptions, TreeNode } from '../../core/types';
import { createSVG, createGroup, createRect, createText, createPath, createContainer, getContainerSize } from '../../core/svg';
import { showTooltip, hideTooltip, formatTooltipTitle, formatTooltipRow } from '../../core/tooltip';
import { treeLayout, LayoutNode } from '../../core/layout';
import { getThemeColors, PALETTES } from '../../core/colors';
import { formatPercent, generateId, truncate } from '../../core/utils';
import { injectStyles } from '../../styles';
import { buildTree } from './algorithm';

const DEFAULTS: Required<Pick<DecisionTreeOptions, 'maxDepth' | 'minSamples' | 'nodeWidth' | 'nodeHeight' | 'whatIf' | 'animate' | 'theme'>> = {
  maxDepth: 5, minSamples: 5, nodeWidth: 180, nodeHeight: 70, whatIf: false, animate: true, theme: 'dark',
};

export function decisionTree(
  container: HTMLElement | string,
  data: Record<string, any>[],
  options: DecisionTreeOptions
): { destroy: () => void; update: (data: Record<string, any>[]) => void } {
  injectStyles();
  const opts = { ...DEFAULTS, ...options };
  const theme = getThemeColors(opts.theme ?? 'dark');
  const el = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container;
  if (!el) throw new Error('makeshift.js: container not found');
  const size = getContainerSize(el, opts);
  const wrapper = createContainer(el, 'makeshift-decision-tree');

  let tree = buildTree(data, opts.features, opts.target, opts.maxDepth, opts.minSamples);

  function toLayoutNode(node: TreeNode): LayoutNode {
    const children: LayoutNode[] = [];
    if (node.left && !node.collapsed) children.push(toLayoutNode(node.left));
    if (node.right && !node.collapsed) children.push(toLayoutNode(node.right));
    return { id: node.id, children, x: 0, y: 0, mod: 0, width: opts.nodeWidth, height: opts.nodeHeight, data: node };
  }

  function render() {
    wrapper.innerHTML = '';
    const layoutRoot = toLayoutNode(tree);
    treeLayout(layoutRoot, opts.nodeWidth, opts.nodeHeight, 80, 40);

    let maxX = 0, maxY = 0;
    function findMax(n: LayoutNode) { maxX = Math.max(maxX, n.x); maxY = Math.max(maxY, n.y); n.children.forEach(findMax); }
    findMax(layoutRoot);

    const w = maxX + opts.nodeWidth + 80;
    const h = maxY + opts.nodeHeight + 80;
    const svgW = Math.max(size.width, w);
    const svgH = Math.max(size.height, h);
    const oX = (svgW - w) / 2 + 40;
    const oY = 40;

    const svg = createSVG(svgW, svgH);
    svg.style.background = theme.bg;
    const linksG = createGroup();
    const nodesG = createGroup();
    svg.appendChild(linksG);
    svg.appendChild(nodesG);

    // Add gradient definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const leafGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    leafGradient.setAttribute('id', 'leafGradient');
    leafGradient.setAttribute('x1', '0%');
    leafGradient.setAttribute('y1', '0%');
    leafGradient.setAttribute('x2', '100%');
    leafGradient.setAttribute('y2', '100%');
    leafGradient.innerHTML = `<stop offset="0%" style="stop-color:${PALETTES.categorical[0]};stop-opacity:1" /><stop offset="100%" style="stop-color:${PALETTES.categorical[1]};stop-opacity:1" />`;
    defs.appendChild(leafGradient);

    const nodeGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    nodeGradient.setAttribute('id', 'nodeGradient');
    nodeGradient.setAttribute('x1', '0%');
    nodeGradient.setAttribute('y1', '0%');
    nodeGradient.setAttribute('x2', '100%');
    nodeGradient.setAttribute('y2', '100%');
    nodeGradient.innerHTML = `<stop offset="0%" style="stop-color:${theme.surface.split(',')[1] || '#1e1b4b'};stop-opacity:1" /><stop offset="100%" style="stop-color:${theme.surface.split(',')[2] || '#312e81'};stop-opacity:1" />`;
    defs.appendChild(nodeGradient);
    svg.appendChild(defs);

    function renderLinks(n: LayoutNode) {
      for (const child of n.children) {
        const x1 = oX + n.x + opts.nodeWidth / 2;
        const y1 = oY + n.y + opts.nodeHeight;
        const x2 = oX + child.x + opts.nodeWidth / 2;
        const y2 = oY + child.y;
        const midY = (y1 + y2) / 2;
        const d = `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
        const path = createPath(d, { stroke: theme.border, 'stroke-width': '2', fill: 'none', 'stroke-opacity': '0.6' });
        path.classList.add('makeshift-link');
        linksG.appendChild(path);
        renderLinks(child);
      }
    }

    function renderNodes(n: LayoutNode) {
      const treeNode = n.data as TreeNode;
      const x = oX + n.x;
      const y = oY + n.y;
      const g = createGroup({ transform: `translate(${x},${y})` });
      g.classList.add('makeshift-node');

      const isLeaf = !treeNode.feature;
      const bgColor = isLeaf ? 'url(#leafGradient)' : 'url(#nodeGradient)';
      const borderColor = isLeaf ? PALETTES.categorical[1] : theme.border;

      const rect = createRect(0, 0, opts.nodeWidth, opts.nodeHeight, {
        rx: '12', fill: bgColor, stroke: borderColor, 'stroke-width': '2',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
      });
      g.appendChild(rect);

      if (isLeaf) {
        const label = createText(opts.nodeWidth / 2, 32, `${treeNode.value}`, { fill: '#ffffff', 'font-size': '15', 'font-weight': '700', 'text-anchor': 'middle' });
        const count = createText(opts.nodeWidth / 2, 54, `n=${treeNode.samples} (${formatPercent(treeNode.percentage)})`, { fill: 'rgba(255,255,255,0.9)', 'font-size': '12', 'text-anchor': 'middle', 'font-weight': '500' });
        g.appendChild(label);
        g.appendChild(count);
      } else {
        const cond = createText(opts.nodeWidth / 2, 28, truncate(treeNode.condition || '', 24), { fill: theme.text, 'font-size': '14', 'font-weight': '600', 'text-anchor': 'middle' });
        const pct = createText(opts.nodeWidth / 2, 50, `${formatPercent(treeNode.percentage)} · n=${treeNode.samples}`, { fill: theme.textMuted, 'font-size': '12', 'text-anchor': 'middle', 'font-weight': '500' });
        g.appendChild(cond);
        g.appendChild(pct);

        // Collapse indicator
        if (treeNode.left || treeNode.right) {
          const indicator = createText(opts.nodeWidth / 2, 68, treeNode.collapsed ? '▸ expand' : '▾ collapse', { fill: theme.highlight, 'font-size': '11', 'text-anchor': 'middle', cursor: 'pointer', 'font-weight': '600' });
          indicator.addEventListener('click', (e) => { e.stopPropagation(); treeNode.collapsed = !treeNode.collapsed; render(); });
          g.appendChild(indicator);
        }
      }

      // Tooltip
      g.addEventListener('mouseenter', (e) => {
        const rows = treeNode.data.slice(0, 5).map(d => {
          const vals = Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
          return `<div style="font-size:11px;color:#94a3b8;padding:2px 0">${truncate(vals, 60)}</div>`;
        }).join('');
        const more = treeNode.data.length > 5 ? `<div style="font-size:11px;color:#64748b;margin-top:4px">...and ${treeNode.data.length - 5} more</div>` : '';
        showTooltip(e.clientX, e.clientY,
          formatTooltipTitle(isLeaf ? `Leaf: ${treeNode.value}` : treeNode.condition || 'Root') +
          formatTooltipRow('Samples', treeNode.samples) + '<br>' +
          formatTooltipRow('Percentage', formatPercent(treeNode.percentage)) + '<br>' +
          formatTooltipRow('Gini', treeNode.impurity.toFixed(3)) +
          '<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px">' + rows + more + '</div>'
        );
      });
      g.addEventListener('mouseleave', hideTooltip);

      nodesG.appendChild(g);
      n.children.forEach(renderNodes);
    }

    renderLinks(layoutRoot);
    renderNodes(layoutRoot);
    wrapper.appendChild(svg);
    wrapper.style.overflowX = 'auto';
    wrapper.style.overflowY = 'auto';
  }

  render();

  return {
    destroy: () => { wrapper.innerHTML = ''; },
    update: (newData: Record<string, any>[]) => { tree = buildTree(newData, opts.features, opts.target, opts.maxDepth, opts.minSamples); render(); },
  };
}
