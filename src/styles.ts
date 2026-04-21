let injected = false;

export function injectStyles(): void {
  if (injected) return;
  injected = true;

  const style = document.createElement('style');
  style.id = 'makeshift-styles';
  style.textContent = `
    .makeshift-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
      font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    }
    .makeshift-container svg {
      display: block;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
    }
    .makeshift-container text {
      user-select: none;
      font-variant-numeric: tabular-nums;
    }
    .makeshift-node {
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
    }
    .makeshift-node:hover {
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3)) brightness(1.05);
      transform: translateY(-1px);
    }
    .makeshift-bar {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
    }
    .makeshift-bar:hover {
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25)) brightness(1.1);
      transform: scaleY(1.02);
    }
    .makeshift-cell {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
    }
    .makeshift-cell:hover {
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2)) brightness(1.15);
      transform: scale(1.05);
    }
    .makeshift-link {
      fill: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
    }
    .makeshift-link:hover {
      stroke-opacity: 1;
      stroke-width: 2.5;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    .makeshift-handle {
      cursor: col-resize;
      touch-action: none;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
    }
    .makeshift-handle:hover rect {
      fill: rgba(99,102,241,1) !important;
    }
    .makeshift-draggable {
      cursor: grab;
      touch-action: none;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    .makeshift-draggable:active {
      cursor: grabbing;
    }
    .makeshift-btn {
      cursor: pointer;
      padding: 8px 16px;
      border: 1px solid rgba(99,102,241,0.5);
      background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1));
      backdrop-filter: blur(8px);
      color: #c7d2fe;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .makeshift-btn:hover {
      background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
      border-color: #6366f1;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }
    .makeshift-btn.active {
      background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3));
      border-color: #6366f1;
      color: #e0e7ff;
      box-shadow: 0 2px 8px rgba(99,102,241,0.4);
    }
    .makeshift-sidebar {
      position: absolute;
      right: 0;
      top: 0;
      width: 280px;
      height: 100%;
      overflow-y: auto;
      background: linear-gradient(135deg, rgba(15,15,35,0.95), rgba(30,30,60,0.95));
      backdrop-filter: blur(16px);
      border-left: 1px solid rgba(99,102,241,0.3);
      padding: 20px;
      color: #e2e8f0;
      font-size: 14px;
      z-index: 10;
      box-shadow: -8px 0 24px rgba(0,0,0,0.4);
      border-radius: 12px 0 0 12px;
    }
    .makeshift-sidebar h3 {
      margin: 0 0 16px;
      font-size: 16px;
      color: #c7d2fe;
      font-weight: 600;
    }
    .makeshift-sidebar table {
      width: 100%;
      border-collapse: collapse;
    }
    .makeshift-sidebar td, .makeshift-sidebar th {
      padding: 6px 10px;
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      font-size: 13px;
    }
    .makeshift-sidebar th {
      color: #94a3b8;
      font-weight: 500;
    }
    .makeshift-streak {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(239,68,68,0.2));
      border: 1px solid rgba(99,102,241,0.4);
      color: #e0e7ff;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .makeshift-legend {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      padding: 12px 0;
    }
    .makeshift-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #cbd5e1;
      font-weight: 500;
    }
    .makeshift-legend-swatch {
      width: 14px;
      height: 14px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    @keyframes makeshift-fadeIn {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .makeshift-fade-in {
      animation: makeshift-fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes makeshift-growUp {
      from {
        transform: scaleY(0) scaleX(0.95);
        opacity: 0;
      }
      to {
        transform: scaleY(1) scaleX(1);
        opacity: 1;
      }
    }
    .makeshift-grow-up {
      animation: makeshift-growUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      transform-origin: bottom center;
    }
    @keyframes makeshift-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .makeshift-pulse {
      animation: makeshift-pulse 2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}
