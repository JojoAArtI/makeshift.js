import { decisionTree, gantt, waterfall, orgChart, heatmap, beforeAfter, wordDiff } from 'makeshift.js';

// ── 1. Decision Tree ──
const treeData = [];
for (let i = 0; i < 200; i++) {
  const age = 20 + Math.floor(Math.random() * 50);
  const income = 20000 + Math.floor(Math.random() * 80000);
  const score = Math.floor(Math.random() * 100);
  const outcome = (age > 40 && income > 50000) ? 'Premium' :
                  (score > 60) ? 'Standard' : 'Basic';
  treeData.push({ age, income, score, plan: outcome });
}
decisionTree('#chart-tree', treeData, {
  target: 'plan',
  features: ['age', 'income', 'score'],
  maxDepth: 3,
  width: 1060,
  height: 380,
});

// ── 2. Gantt Chart ──
gantt('#chart-gantt', [
  { id: 't1', name: 'Research & Discovery', start: '2026-03-01', end: '2026-03-14', resource: 'Alice', progress: 100 },
  { id: 't2', name: 'UX Design', start: '2026-03-10', end: '2026-03-25', resource: 'Bob', dependencies: ['t1'], progress: 75 },
  { id: 't3', name: 'Backend API', start: '2026-03-15', end: '2026-04-10', resource: 'Charlie', dependencies: ['t1'], progress: 40 },
  { id: 't4', name: 'Frontend Build', start: '2026-03-26', end: '2026-04-15', resource: 'Bob', dependencies: ['t2'], progress: 20 },
  { id: 't5', name: 'Integration', start: '2026-04-11', end: '2026-04-20', resource: 'Alice', dependencies: ['t3', 't4'], progress: 0 },
  { id: 't6', name: 'QA Testing', start: '2026-04-16', end: '2026-04-25', resource: 'Charlie', dependencies: ['t4'], progress: 0 },
  { id: 't7', name: 'Launch', start: '2026-04-26', end: '2026-04-26', resource: 'Alice', milestone: true, dependencies: ['t5', 't6'] },
], { width: 1060, height: 480, viewMode: 'week' });

// ── 3. Waterfall ──
waterfall('#chart-waterfall', [
  { label: 'Opening Balance', amount: 125000, isTotal: true },
  { label: 'Product Sales', amount: 84000, category: 'revenue', transactions: [
    { description: 'Enterprise license', amount: 45000 },
    { description: 'Pro subscriptions', amount: 28000 },
    { description: 'Add-on sales', amount: 11000 },
  ]},
  { label: 'Services', amount: 32000, category: 'revenue', transactions: [
    { description: 'Consulting Q1', amount: 20000 },
    { description: 'Training workshops', amount: 12000 },
  ]},
  { label: 'Salaries', amount: -68000, category: 'salary' },
  { label: 'Office Rent', amount: -12000, category: 'rent' },
  { label: 'Cloud Infra', amount: -8500, category: 'tech' },
  { label: 'Marketing', amount: -15000, category: 'marketing' },
  { label: 'Insurance', amount: -4200, category: 'ops' },
  { label: 'Closing Balance', amount: 0, isTotal: true },
], {
  width: 1060, height: 400,
  categoryColors: { revenue: '#22c55e', salary: '#3b82f6', rent: '#ef4444', tech: '#8b5cf6', marketing: '#f97316', ops: '#64748b' },
});

// ── 4. Org Chart ──
orgChart('#chart-org', [
  { id: 'ceo', name: 'Sarah Chen', title: 'CEO', metrics: { messages: 89, commits: 2 } },
  { id: 'cto', name: 'Alex Rivera', title: 'CTO', manager: 'ceo', metrics: { messages: 342, commits: 45 } },
  { id: 'cmo', name: 'Jordan Park', title: 'CMO', manager: 'ceo', metrics: { messages: 156, commits: 0 } },
  { id: 'cfo', name: 'Lisa Wang', title: 'CFO', manager: 'ceo', metrics: { messages: 67, commits: 0 } },
  { id: 'eng1', name: 'Dev Kumar', title: 'Sr. Engineer', manager: 'cto', metrics: { messages: 210, commits: 89 } },
  { id: 'eng2', name: 'Maya Lin', title: 'Engineer', manager: 'cto', metrics: { messages: 187, commits: 72 } },
  { id: 'eng3', name: 'Tom Novak', title: 'Engineer', manager: 'cto', metrics: { messages: 92, commits: 34 } },
  { id: 'mkt1', name: 'Priya Shah', title: 'Marketing Lead', manager: 'cmo', metrics: { messages: 234, commits: 5 } },
  { id: 'mkt2', name: 'Chris Lee', title: 'Content Writer', manager: 'cmo', metrics: { messages: 145, commits: 12 } },
  { id: 'fin1', name: 'Anna Kowalski', title: 'Accountant', manager: 'cfo', metrics: { messages: 45, commits: 0 } },
], {
  width: 1060, height: 480,
  mode: 'hierarchy',
  sizeMetric: 'messages',
  influenceEdges: [
    { source: 'eng1', target: 'mkt1', weight: 8 },
    { source: 'eng2', target: 'eng1', weight: 12 },
    { source: 'mkt1', target: 'ceo', weight: 6 },
    { source: 'eng1', target: 'cto', weight: 15 },
    { source: 'mkt2', target: 'eng2', weight: 4 },
    { source: 'cfo', target: 'cmo', weight: 3 },
  ],
});

// ── 5. Heatmap ──
const heatmapData = [];
const today = new Date();
for (let i = 0; i < 365; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  const dayOfWeek = d.getDay();
  const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
  const base = isWeekday ? 3 : 1;
  const value = Math.random() > 0.15 ? Math.floor(Math.random() * 8 + base) : 0;
  heatmapData.push({ date: d, value });
}
heatmap('#chart-heatmap', heatmapData, { width: 1060, height: 200, goal: 7, cellSize: 13 });

// ── 6. Before/After ──
beforeAfter('#chart-beforeafter', {
  before: {
    type: 'bar',
    data: [
      { label: 'Users', value: 12400 },
      { label: 'Revenue', value: 84000 },
      { label: 'Retention', value: 62 },
      { label: 'NPS', value: 34 },
      { label: 'Tickets', value: 890 },
    ],
  },
  after: {
    type: 'bar',
    data: [
      { label: 'Users', value: 28900 },
      { label: 'Revenue', value: 156000 },
      { label: 'Retention', value: 78 },
      { label: 'NPS', value: 67 },
      { label: 'Tickets', value: 340 },
    ],
  },
}, { width: 1060, height: 400, beforeLabel: 'Before Redesign', afterLabel: 'After Redesign' });

// ── 7. Word Diff ──
wordDiff('#chart-worddiff', [
  {
    label: 'Version 1 (2024)',
    text: 'We build fast reliable enterprise software for large corporations and government agencies worldwide with a focus on security compliance and data protection',
  },
  {
    label: 'Version 2 (2025)',
    text: 'We build beautiful intuitive software for everyone everywhere with a focus on simplicity speed and delightful user experiences that people love',
  },
  {
    label: 'Version 3 (2026)',
    text: 'We craft beautiful intelligent tools for creators and teams everywhere with a focus on AI-powered simplicity speed and experiences that spark joy',
  },
], { width: 1060, height: 430, mode: 'column' });