# makeshift.js — Clean Import Demo

This demo shows how to use **makeshift.js** with the **clean import syntax** that users will use in their projects.

## 🚀 **Live Demo**
Visit: http://localhost:3001

## ✨ **Clean Import Syntax**
```javascript
import { decisionTree, gantt, waterfall, orgChart, heatmap, beforeAfter, wordDiff } from 'makeshift.js';
```

That's it! No complex paths, no local file references — just like any other npm package.

## 🛠 **How It Works**
- Uses **Vite** as the bundler (just like most modern projects)
- Imports directly from the installed `makeshift.js` package
- Demonstrates the exact same API users will use
- Shows all charts with the same beautiful styling

## 📊 **All Charts Included**
- 🌳 **Decision Tree** - Interactive CART decision trees
- 📊 **Gantt Chart** - Project timelines with dependencies
- 💰 **Waterfall Chart** - Financial flow visualization
- 🏢 **Org Chart** - Organization hierarchies and influence networks
- 🔥 **Heatmap** - GitHub-style contribution graphs
- 🔀 **Before/After Slider** - Side-by-side chart comparisons
- 📝 **Word Diff Chart** - Text evolution visualization

## 🎯 **Perfect For**
- **User documentation** - Show the exact import syntax
- **API demonstration** - Clean, simple examples
- **Testing the package** - Verify it works in real bundler environments
- **Developer experience** - See how it feels to use the library

## 🚀 **Usage in Your Project**
```javascript
import { decisionTree, gantt, waterfall, orgChart, heatmap, beforeAfter, wordDiff } from 'makeshift.js';

// Create a decision tree
decisionTree('#my-chart', data, {
  target: 'outcome',
  features: ['age', 'income', 'score']
});
```

This is exactly how users will import and use your library! 🎉