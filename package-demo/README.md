# makeshift.js Package Demo

This demo showcases the **makeshift.js** charting library using the installed npm package.

## 🚀 **Live Demo**
Visit: http://localhost:3000

## 📦 **What's Different**
- Uses the **installed npm package** (`makeshift.js`) instead of local development files
- Demonstrates how to use the library after `npm install makeshift.js`
- Self-contained demo with all dependencies included

## 📊 **Charts Included**
- 🌳 **Decision Tree** - Interactive CART decision trees
- 📊 **Gantt Chart** - Project timelines with dependencies
- 💰 **Waterfall Chart** - Financial flow visualization
- 🏢 **Org Chart** - Organization hierarchies and influence networks
- 🔥 **Heatmap** - GitHub-style contribution graphs
- 🔀 **Before/After Slider** - Side-by-side chart comparisons
- 📝 **Word Diff Chart** - Text evolution visualization

## 🛠 **Usage in Your Project**
```javascript
import { decisionTree, gantt, waterfall, orgChart, heatmap, beforeAfter, wordDiff } from 'makeshift.js';

// Create a decision tree
decisionTree('#my-chart', data, {
  target: 'outcome',
  features: ['age', 'income', 'score']
});
```

## 🎨 **Features**
- Zero dependencies
- Pure SVG rendering
- Interactive tooltips and hover effects
- Modern gradient styling
- Responsive design
- TypeScript support