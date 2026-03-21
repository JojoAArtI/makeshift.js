# makeshift.js

A novel JavaScript visualization library with 7 unique, interactive chart types that don't exist anywhere else.

**Zero dependencies. Pure SVG. Works everywhere.**

[![npm](https://img.shields.io/npm/v/makeshift.js)](https://npmjs.com/package/makeshift.js)
[![license](https://img.shields.io/npm/l/makeshift.js)](LICENSE)

## Install

```bash
npm install makeshift.js
```

Or via CDN:

```html
<script type="module">
  import makeshift from 'https://unpkg.com/makeshift.js/dist/makeshift.esm.js';
</script>
```

## Charts

### 1. 🌳 Decision Tree Builder

Build actual decision trees from data — not just drawings. Automatic CART splitting, what-if mode, collapsible subtrees.

```js
import { decisionTree } from 'makeshift.js';

decisionTree('#container', myData, {
  target: 'outcome',
  features: ['age', 'income', 'score'],
  maxDepth: 4,
  theme: 'dark',
});
```

### 2. 📊 Gantt Chart

The Gantt chart that actually works. Dependency arrows that route around tasks, critical path highlighting, resource overload warnings, milestone diamonds, swimlanes.

```js
import { gantt } from 'makeshift.js';

gantt('#container', [
  { id: '1', name: 'Design', start: '2026-01-01', end: '2026-01-14', resource: 'Alice' },
  { id: '2', name: 'Develop', start: '2026-01-15', end: '2026-02-15', resource: 'Bob', dependencies: ['1'] },
  { id: '3', name: 'Launch', start: '2026-02-16', end: '2026-02-16', resource: 'Alice', milestone: true, dependencies: ['2'] },
], { showCriticalPath: true, viewMode: 'week' });
```

### 3. 💰 Cash Flow Waterfall

See where your money actually went. Opening balance → income/expenses → closing balance. Click any block to see individual transactions.

```js
import { waterfall } from 'makeshift.js';

waterfall('#container', [
  { label: 'Opening', amount: 50000, isTotal: true },
  { label: 'Revenue', amount: 32000, category: 'income' },
  { label: 'Salaries', amount: -18000, category: 'salary' },
  { label: 'Rent', amount: -5000, category: 'rent' },
  { label: 'Closing', amount: 0, isTotal: true },
], { categoryColors: { income: '#22c55e', salary: '#3b82f6', rent: '#ef4444' } });
```

### 4. 🏢 Org Chart / Relationship Map

Two modes side by side: formal hierarchy and actual influence network. Toggle between them and see where organizational dysfunction lives.

```js
import { orgChart } from 'makeshift.js';

orgChart('#container', [
  { id: 'ceo', name: 'Jane Kim', title: 'CEO', metrics: { messages: 120 } },
  { id: 'cto', name: 'Alex Chen', title: 'CTO', manager: 'ceo', metrics: { messages: 340 } },
  { id: 'eng1', name: 'Sam Lee', title: 'Engineer', manager: 'cto', metrics: { messages: 210 } },
], {
  mode: 'hierarchy',
  sizeMetric: 'messages',
  influenceEdges: [
    { source: 'eng1', target: 'ceo', weight: 5 },
  ],
});
```

### 5. 🔥 Habit Heatmap

The GitHub contribution graph, but for anything. Goals, streaks, color scaling, multi-metric support.

```js
import { heatmap } from 'makeshift.js';

// Generate sample data
const data = [];
for (let i = 0; i < 365; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  data.push({ date, value: Math.random() > 0.3 ? Math.floor(Math.random() * 10) : 0 });
}

heatmap('#container', data, { goal: 5, showStreak: true });
```

### 6. 🔀 Before/After Slider

Put two states on the same canvas with a draggable divider. The difference is immediately, viscerally obvious.

```js
import { beforeAfter } from 'makeshift.js';

beforeAfter('#container', {
  before: {
    type: 'bar',
    data: [
      { label: 'Q1', value: 120 },
      { label: 'Q2', value: 95 },
      { label: 'Q3', value: 140 },
    ],
  },
  after: {
    type: 'bar',
    data: [
      { label: 'Q1', value: 180 },
      { label: 'Q2', value: 210 },
      { label: 'Q3', value: 195 },
    ],
  },
}, { beforeLabel: '2024', afterLabel: '2025' });
```

### 7. 📝 Word Diff Chart

Visualize how language changed. Words as data. Column view with connectors, or a delta word cloud.

```js
import { wordDiff } from 'makeshift.js';

wordDiff('#container', [
  { label: 'V1', text: 'We build fast reliable software for enterprise customers worldwide' },
  { label: 'V2', text: 'We build beautiful intuitive software for everyone everywhere' },
], { mode: 'column' });
```

## API

Every chart follows the same pattern:

```js
const instance = makeshift.chartName(container, data, options);
instance.update(newData);  // Re-render with new data
instance.destroy();         // Clean up
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | container width | Chart width in pixels |
| `height` | `number` | container height | Chart height in pixels |
| `theme` | `'light' \| 'dark'` | `'dark'` | Color theme |
| `animate` | `boolean` | `true` | Enable animations |
| `margin` | `{ top, right, bottom, left }` | `{ 40, 40, 40, 60 }` | Chart margins |

See the TypeScript types for full options per chart.

## Browser Support

All modern browsers (Chrome, Firefox, Safari, Edge). No IE11.

## License

MIT
