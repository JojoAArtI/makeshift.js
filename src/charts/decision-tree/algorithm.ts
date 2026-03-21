import type { TreeNode } from '../../core/types';

interface Split { feature: string; threshold: number; gini: number; leftIdx: number[]; rightIdx: number[]; }

function giniImpurity(groups: Record<string, any>[][], classes: any[]): number {
  const n = groups.reduce((s, g) => s + g.length, 0);
  if (n === 0) return 0;
  let gini = 0;
  for (const group of groups) {
    const size = group.length;
    if (size === 0) continue;
    let score = 0;
    for (const cls of classes) {
      const p = group.filter(r => r.__target === cls).length / size;
      score += p * p;
    }
    gini += (1 - score) * (size / n);
  }
  return gini;
}

function findBestSplit(data: Record<string, any>[], features: string[], classes: any[]): Split | null {
  let best: Split | null = null;
  let bestGini = Infinity;
  for (const feature of features) {
    const values = [...new Set(data.map(d => d[feature]))].sort((a, b) => a - b);
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;
      const leftIdx: number[] = [];
      const rightIdx: number[] = [];
      data.forEach((d, idx) => {
        if (d[feature] <= threshold) leftIdx.push(idx);
        else rightIdx.push(idx);
      });
      const leftGroup = leftIdx.map(i => data[i]);
      const rightGroup = rightIdx.map(i => data[i]);
      const g = giniImpurity([leftGroup, rightGroup], classes);
      if (g < bestGini) {
        bestGini = g;
        best = { feature, threshold, gini: g, leftIdx, rightIdx };
      }
    }
  }
  return best;
}

let nodeId = 0;

export function buildTree(
  data: Record<string, any>[],
  features: string[],
  target: string,
  maxDepth: number = 5,
  minSamples: number = 2,
  depth: number = 0
): TreeNode {
  const total = data.length;
  const classes = [...new Set(data.map(d => d[target]))];
  const tagged = data.map(d => ({ ...d, __target: d[target] }));
  const majorityClass = classes.reduce((best, cls) => {
    const count = tagged.filter(d => d.__target === cls).length;
    return count > best.count ? { cls, count } : best;
  }, { cls: classes[0], count: 0 });

  const impurity = giniImpurity([tagged], classes);
  const node: TreeNode = {
    id: `node-${nodeId++}`,
    samples: total,
    percentage: 100,
    value: majorityClass.cls,
    impurity,
    data,
    depth,
  };

  if (depth >= maxDepth || total < minSamples || classes.length <= 1) {
    return node;
  }

  const split = findBestSplit(tagged, features, classes);
  if (!split || split.leftIdx.length === 0 || split.rightIdx.length === 0) {
    return node;
  }

  node.feature = split.feature;
  node.threshold = split.threshold;
  node.condition = `${split.feature} ≤ ${Math.round(split.threshold * 100) / 100}`;

  const leftData = split.leftIdx.map(i => data[i]);
  const rightData = split.rightIdx.map(i => data[i]);

  node.left = buildTree(leftData, features, target, maxDepth, minSamples, depth + 1);
  node.left.percentage = (leftData.length / total) * 100;
  node.right = buildTree(rightData, features, target, maxDepth, minSamples, depth + 1);
  node.right.percentage = (rightData.length / total) * 100;

  return node;
}

export function rebuildWithThreshold(
  data: Record<string, any>[],
  features: string[],
  target: string,
  maxDepth: number,
  overrides: Map<string, number>
): TreeNode {
  nodeId = 0;
  return buildTree(data, features, target, maxDepth);
}
