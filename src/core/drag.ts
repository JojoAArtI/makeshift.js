// ─── Generic Drag Handler ─────────────────────────────────────

export interface DragCallbacks {
  onStart?: (x: number, y: number, event: PointerEvent) => void;
  onMove?: (x: number, y: number, dx: number, dy: number, event: PointerEvent) => void;
  onEnd?: (x: number, y: number, event: PointerEvent) => void;
}

export interface DragConstraint {
  axis?: 'x' | 'y';
  bounds?: { minX?: number; maxX?: number; minY?: number; maxY?: number };
}

export function makeDraggable(
  el: SVGElement | HTMLElement,
  callbacks: DragCallbacks,
  constraint?: DragConstraint
): () => void {
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  function onPointerDown(e: PointerEvent) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    el.setPointerCapture(e.pointerId);
    callbacks.onStart?.(e.clientX, e.clientY, e);
    e.preventDefault();
    e.stopPropagation();
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    if (constraint?.axis === 'x') dy = 0;
    if (constraint?.axis === 'y') dx = 0;

    if (constraint?.bounds) {
      const b = constraint.bounds;
      const newX = e.clientX;
      const newY = e.clientY;
      if (b.minX !== undefined && newX < b.minX) return;
      if (b.maxX !== undefined && newX > b.maxX) return;
      if (b.minY !== undefined && newY < b.minY) return;
      if (b.maxY !== undefined && newY > b.maxY) return;
    }

    callbacks.onMove?.(e.clientX, e.clientY, dx, dy, e);
    startX = e.clientX;
    startY = e.clientY;
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    callbacks.onEnd?.(e.clientX, e.clientY, e);
  }

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  el.style.cursor = 'grab';
  el.style.touchAction = 'none';

  // Return cleanup function
  return () => {
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerUp);
  };
}

// ─── Horizontal Slider Drag ──────────────────────────────────

export function makeHorizontalSlider(
  el: SVGElement | HTMLElement,
  minX: number,
  maxX: number,
  onChange: (x: number) => void
): () => void {
  return makeDraggable(el, {
    onMove: (x) => {
      const clamped = Math.max(minX, Math.min(maxX, x));
      onChange(clamped);
    },
  }, { axis: 'x' });
}
