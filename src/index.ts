// ─── Makeshift.js — A Novel Visualization Library ─────────────

// Chart exports
export { decisionTree } from './charts/decision-tree/index';
export { gantt } from './charts/gantt/index';
export { waterfall } from './charts/waterfall/index';
export { orgChart } from './charts/org-chart/index';
export { heatmap } from './charts/heatmap/index';
export { beforeAfter } from './charts/before-after/index';
export { wordDiff } from './charts/word-diff/index';

// Type exports
export type {
  DecisionTreeOptions,
  TreeNode,
  GanttTask,
  GanttOptions,
  WaterfallEntry,
  WaterfallOptions,
  OrgNode,
  OrgEdge,
  OrgChartOptions,
  HeatmapEntry,
  HeatmapOptions,
  BeforeAfterConfig,
  BeforeAfterSide,
  BeforeAfterOptions,
  TextVersion,
  WordDiffOptions,
  ChartOptions,
  Margin,
  TooltipConfig,
} from './core/types';

// Core utility exports
export { PALETTES, getThemeColors } from './core/colors';

// Default export — all charts as methods
import { decisionTree } from './charts/decision-tree/index';
import { gantt } from './charts/gantt/index';
import { waterfall } from './charts/waterfall/index';
import { orgChart } from './charts/org-chart/index';
import { heatmap } from './charts/heatmap/index';
import { beforeAfter } from './charts/before-after/index';
import { wordDiff } from './charts/word-diff/index';

const makeshift = {
  decisionTree,
  gantt,
  waterfall,
  orgChart,
  heatmap,
  beforeAfter,
  wordDiff,
};

export default makeshift;
