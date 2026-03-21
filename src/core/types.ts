// ─── Shared Types ─────────────────────────────────────────────

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartOptions {
  width?: number;
  height?: number;
  margin?: Partial<Margin>;
  animate?: boolean;
  animationDuration?: number;
  theme?: 'light' | 'dark';
  responsive?: boolean;
}

export interface TooltipConfig {
  enabled?: boolean;
  formatter?: (data: any) => string;
}

export interface AnimationConfig {
  duration: number;
  easing: (t: number) => number;
  delay?: number;
}

export interface ColorScale {
  domain: number[];
  range: string[];
  interpolate?: (a: string, b: string, t: number) => string;
}

// ─── Decision Tree Types ──────────────────────────────────────

export interface DecisionTreeOptions extends ChartOptions {
  target: string;
  features: string[];
  maxDepth?: number;
  minSamples?: number;
  whatIf?: boolean;
  nodeWidth?: number;
  nodeHeight?: number;
  tooltip?: TooltipConfig;
}

export interface TreeNode {
  id: string;
  feature?: string;
  threshold?: number;
  condition?: string;
  samples: number;
  percentage: number;
  value?: any;
  impurity: number;
  left?: TreeNode;
  right?: TreeNode;
  data: Record<string, any>[];
  depth: number;
  x?: number;
  y?: number;
  collapsed?: boolean;
}

// ─── Gantt Types ──────────────────────────────────────────────

export interface GanttTask {
  id: string;
  name: string;
  start: string | Date;
  end: string | Date;
  resource?: string;
  dependencies?: string[];
  progress?: number;
  color?: string;
  milestone?: boolean;
}

export interface GanttOptions extends ChartOptions {
  viewMode?: 'day' | 'week' | 'month';
  showToday?: boolean;
  showCriticalPath?: boolean;
  showResourceWarnings?: boolean;
  collapsibleSwimlanes?: boolean;
  draggable?: boolean;
  barHeight?: number;
  rowHeight?: number;
  tooltip?: TooltipConfig;
  onTaskUpdate?: (task: GanttTask) => void;
}

// ─── Waterfall Types ──────────────────────────────────────────

export interface WaterfallEntry {
  label: string;
  amount: number;
  category?: string;
  isTotal?: boolean;
  transactions?: { description: string; amount: number; date?: string }[];
}

export interface WaterfallOptions extends ChartOptions {
  categoryColors?: Record<string, string>;
  showRunningTotal?: boolean;
  whatIf?: boolean;
  positiveColor?: string;
  negativeColor?: string;
  totalColor?: string;
  tooltip?: TooltipConfig;
  onEntryUpdate?: (entry: WaterfallEntry, newAmount: number) => void;
}

// ─── Org Chart Types ──────────────────────────────────────────

export interface OrgNode {
  id: string;
  name: string;
  title?: string;
  manager?: string;
  avatar?: string;
  metrics?: Record<string, number>;
}

export interface OrgEdge {
  source: string;
  target: string;
  weight?: number;
}

export interface OrgChartOptions extends ChartOptions {
  mode?: 'hierarchy' | 'influence';
  influenceEdges?: OrgEdge[];
  sizeMetric?: string;
  edgeWeightField?: string;
  nodeRadius?: number;
  tooltip?: TooltipConfig;
}

// ─── Heatmap Types ────────────────────────────────────────────

export interface HeatmapEntry {
  date: string | Date;
  value: number;
  metric?: string;
}

export interface HeatmapOptions extends ChartOptions {
  cellSize?: number;
  cellGap?: number;
  colorRange?: string[];
  goal?: number;
  showStreak?: boolean;
  showSummary?: boolean;
  showMonthLabels?: boolean;
  showDayLabels?: boolean;
  emptyColor?: string;
  tooltip?: TooltipConfig;
  startDate?: string | Date;
  endDate?: string | Date;
}

// ─── Before/After Types ──────────────────────────────────────

export interface BeforeAfterSide {
  type: 'bar' | 'scatter' | 'image';
  data?: any;
  options?: Record<string, any>;
  imageUrl?: string;
}

export interface BeforeAfterOptions extends ChartOptions {
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number;
  handleColor?: string;
  handleWidth?: number;
  tooltip?: TooltipConfig;
}

export interface BeforeAfterConfig {
  before: BeforeAfterSide;
  after: BeforeAfterSide;
}

// ─── Word Diff Types ─────────────────────────────────────────

export interface TextVersion {
  label: string;
  text: string;
}

export interface WordDiffOptions extends ChartOptions {
  mode?: 'column' | 'cloud';
  addedColor?: string;
  removedColor?: string;
  unchangedColor?: string;
  maxFontSize?: number;
  minFontSize?: number;
  showConnectors?: boolean;
  tooltip?: TooltipConfig;
}
