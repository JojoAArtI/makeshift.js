// ─── Tree Layout (Reingold-Tilford inspired) ─────────────────

export interface LayoutNode {
  id: string;
  children: LayoutNode[];
  x: number;
  y: number;
  mod: number;
  width: number;
  height: number;
  data?: any;
}

export function treeLayout(
  root: LayoutNode,
  nodeWidth: number,
  nodeHeight: number,
  levelGap: number = 80,
  siblingGap: number = 30
): void {
  // First pass: assign x positions (bottom-up)
  function firstPass(node: LayoutNode, depth: number): void {
    node.y = depth * (nodeHeight + levelGap);

    if (node.children.length === 0) {
      node.x = 0;
      return;
    }

    for (const child of node.children) {
      firstPass(child, depth + 1);
    }

    if (node.children.length === 1) {
      node.x = node.children[0].x;
    } else {
      const leftmost = node.children[0].x;
      const rightmost = node.children[node.children.length - 1].x;
      node.x = (leftmost + rightmost) / 2;
    }
  }

  function fixOverlaps(node: LayoutNode): void {
    const nodesByDepth: Map<number, LayoutNode[]> = new Map();
    collectByDepth(node, nodesByDepth);

    for (const [, nodes] of nodesByDepth) {
      nodes.sort((a, b) => a.x - b.x);
      for (let i = 1; i < nodes.length; i++) {
        const prev = nodes[i - 1];
        const curr = nodes[i];
        const minGap = nodeWidth + siblingGap;
        const diff = prev.x + minGap - curr.x;
        if (diff > 0) {
          shiftSubtree(curr, diff);
        }
      }
    }
  }

  function collectByDepth(node: LayoutNode, map: Map<number, LayoutNode[]>): void {
    const depth = node.y;
    if (!map.has(depth)) map.set(depth, []);
    map.get(depth)!.push(node);
    for (const child of node.children) {
      collectByDepth(child, map);
    }
  }

  function shiftSubtree(node: LayoutNode, shift: number): void {
    node.x += shift;
    for (const child of node.children) {
      shiftSubtree(child, shift);
    }
  }

  firstPass(root, 0);
  fixOverlaps(root);

  // Normalize — shift so minimum x is 0
  let minX = Infinity;
  forEachNode(root, (n) => { if (n.x < minX) minX = n.x; });
  if (minX !== 0) {
    forEachNode(root, (n) => { n.x -= minX; });
  }
}

function forEachNode(node: LayoutNode, fn: (n: LayoutNode) => void): void {
  fn(node);
  for (const child of node.children) {
    forEachNode(child, fn);
  }
}

// ─── Force-Directed Layout ───────────────────────────────────

export interface ForceNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  fixed?: boolean;
  data?: any;
}

export interface ForceEdge {
  source: string;
  target: string;
  weight: number;
}

export function forceLayout(
  nodes: ForceNode[],
  edges: ForceEdge[],
  width: number,
  height: number,
  iterations: number = 100
): void {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const repulsion = 5000;
  const attraction = 0.005;
  const damping = 0.85;
  const centerForce = 0.01;
  const cx = width / 2;
  const cy = height / 2;

  // Initialize positions if not set
  for (const node of nodes) {
    if (node.x === 0 && node.y === 0) {
      node.x = cx + (Math.random() - 0.5) * width * 0.5;
      node.y = cy + (Math.random() - 0.5) * height * 0.5;
    }
  }

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations;

    // Repulsive forces (Coulomb's law)
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].fixed) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (repulsion * temp) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx += fx;
        nodes[i].vy += fy;
        if (!nodes[j].fixed) {
          nodes[j].vx -= fx;
          nodes[j].vy -= fy;
        }
      }
    }

    // Attractive forces (Hooke's law)
    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) continue;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * attraction * edge.weight;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (!source.fixed) { source.vx += fx; source.vy += fy; }
      if (!target.fixed) { target.vx -= fx; target.vy -= fy; }
    }

    // Center gravity
    for (const node of nodes) {
      if (node.fixed) continue;
      node.vx += (cx - node.x) * centerForce;
      node.vy += (cy - node.y) * centerForce;
    }

    // Apply velocities with damping
    for (const node of nodes) {
      if (node.fixed) continue;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
      // Keep within bounds
      const pad = node.radius + 20;
      node.x = Math.max(pad, Math.min(width - pad, node.x));
      node.y = Math.max(pad, Math.min(height - pad, node.y));
    }
  }
}

// ─── Grid Layout (for heatmap) ────────────────────────────────

export function gridLayout(
  count: number,
  cellSize: number,
  cellGap: number,
  cols: number,
  offsetX: number = 0,
  offsetY: number = 0
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: offsetX + col * (cellSize + cellGap),
      y: offsetY + row * (cellSize + cellGap),
    });
  }
  return positions;
}
