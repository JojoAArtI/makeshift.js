let injected = false;

export function injectStyles(): void {
  if (injected) return;
  injected = true;

  const style = document.createElement('style');
  style.id = 'makeshift-styles';
  style.textContent = `
    .makeshift-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
    .makeshift-container svg { display: block; }
    .makeshift-container text { user-select: none; }
    .makeshift-node { cursor: pointer; transition: filter 0.15s ease; }
    .makeshift-node:hover { filter: brightness(1.15); }
    .makeshift-bar { transition: opacity 0.15s ease; }
    .makeshift-bar:hover { opacity: 0.85; }
    .makeshift-cell { transition: opacity 0.15s ease, transform 0.15s ease; }
    .makeshift-cell:hover { opacity: 0.85; }
    .makeshift-link { fill: none; transition: stroke-opacity 0.2s ease; }
    .makeshift-link:hover { stroke-opacity: 1; }
    .makeshift-handle { cursor: col-resize; touch-action: none; }
    .makeshift-handle:hover rect { fill: rgba(99,102,241,0.9) !important; }
    .makeshift-draggable { cursor: grab; touch-action: none; }
    .makeshift-draggable:active { cursor: grabbing; }
    .makeshift-btn { cursor: pointer; padding: 6px 14px; border: 1px solid rgba(99,102,241,0.4); background: rgba(99,102,241,0.1); color: #a5b4fc; border-radius: 6px; font-size: 12px; font-family: inherit; transition: all 0.15s ease; }
    .makeshift-btn:hover { background: rgba(99,102,241,0.25); border-color: #6366f1; }
    .makeshift-btn.active { background: rgba(99,102,241,0.3); border-color: #6366f1; color: #c7d2fe; }
    .makeshift-sidebar { position: absolute; right: 0; top: 0; width: 260px; height: 100%; overflow-y: auto; background: rgba(15,15,35,0.95); backdrop-filter: blur(12px); border-left: 1px solid rgba(99,102,241,0.2); padding: 16px; color: #e2e8f0; font-size: 13px; z-index: 10; box-shadow: -4px 0 20px rgba(0,0,0,0.3); }
    .makeshift-sidebar h3 { margin: 0 0 12px; font-size: 14px; color: #a5b4fc; }
    .makeshift-sidebar table { width: 100%; border-collapse: collapse; }
    .makeshift-sidebar td, .makeshift-sidebar th { padding: 4px 8px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; }
    .makeshift-sidebar th { color: #94a3b8; font-weight: 500; }
    .makeshift-streak { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; font-size: 13px; font-weight: 600; }
    .makeshift-legend { display: flex; gap: 16px; flex-wrap: wrap; padding: 8px 0; }
    .makeshift-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; }
    .makeshift-legend-swatch { width: 12px; height: 12px; border-radius: 3px; }
    @keyframes makeshift-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .makeshift-fade-in { animation: makeshift-fadeIn 0.4s ease forwards; }
    @keyframes makeshift-growUp { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    .makeshift-grow-up { animation: makeshift-growUp 0.5s ease forwards; transform-origin: bottom; }
  `;
  document.head.appendChild(style);
}
