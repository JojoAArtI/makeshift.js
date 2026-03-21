// ─── SVG Namespace ────────────────────────────────────────────
const SVG_NS = 'http://www.w3.org/2000/svg';

export function createSVG(
  width: number,
  height: number,
  attrs?: Record<string, string>
): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('xmlns', SVG_NS);
  if (attrs) setAttrs(svg, attrs);
  return svg;
}

export function createGroup(attrs?: Record<string, string>): SVGGElement {
  const g = document.createElementNS(SVG_NS, 'g') as SVGGElement;
  if (attrs) setAttrs(g, attrs);
  return g;
}

export function createRect(
  x: number,
  y: number,
  w: number,
  h: number,
  attrs?: Record<string, string>
): SVGRectElement {
  const rect = document.createElementNS(SVG_NS, 'rect') as SVGRectElement;
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(w));
  rect.setAttribute('height', String(h));
  if (attrs) setAttrs(rect, attrs);
  return rect;
}

export function createCircle(
  cx: number,
  cy: number,
  r: number,
  attrs?: Record<string, string>
): SVGCircleElement {
  const circle = document.createElementNS(SVG_NS, 'circle') as SVGCircleElement;
  circle.setAttribute('cx', String(cx));
  circle.setAttribute('cy', String(cy));
  circle.setAttribute('r', String(r));
  if (attrs) setAttrs(circle, attrs);
  return circle;
}

export function createLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  attrs?: Record<string, string>
): SVGLineElement {
  const line = document.createElementNS(SVG_NS, 'line') as SVGLineElement;
  line.setAttribute('x1', String(x1));
  line.setAttribute('y1', String(y1));
  line.setAttribute('x2', String(x2));
  line.setAttribute('y2', String(y2));
  if (attrs) setAttrs(line, attrs);
  return line;
}

export function createPath(d: string, attrs?: Record<string, string>): SVGPathElement {
  const path = document.createElementNS(SVG_NS, 'path') as SVGPathElement;
  path.setAttribute('d', d);
  if (attrs) setAttrs(path, attrs);
  return path;
}

export function createText(
  x: number,
  y: number,
  content: string,
  attrs?: Record<string, string>
): SVGTextElement {
  const text = document.createElementNS(SVG_NS, 'text') as SVGTextElement;
  text.setAttribute('x', String(x));
  text.setAttribute('y', String(y));
  text.textContent = content;
  if (attrs) setAttrs(text, attrs);
  return text;
}

export function createPolygon(
  points: string,
  attrs?: Record<string, string>
): SVGPolygonElement {
  const poly = document.createElementNS(SVG_NS, 'polygon') as SVGPolygonElement;
  poly.setAttribute('points', points);
  if (attrs) setAttrs(poly, attrs);
  return poly;
}

export function createClipPath(id: string): SVGClipPathElement {
  const clip = document.createElementNS(SVG_NS, 'clipPath') as SVGClipPathElement;
  clip.setAttribute('id', id);
  return clip;
}

export function createDefs(): SVGDefsElement {
  return document.createElementNS(SVG_NS, 'defs') as SVGDefsElement;
}

export function createForeignObject(
  x: number,
  y: number,
  w: number,
  h: number
): SVGForeignObjectElement {
  const fo = document.createElementNS(SVG_NS, 'foreignObject') as SVGForeignObjectElement;
  fo.setAttribute('x', String(x));
  fo.setAttribute('y', String(y));
  fo.setAttribute('width', String(w));
  fo.setAttribute('height', String(h));
  return fo;
}

// ─── Utilities ────────────────────────────────────────────────

export function setAttrs(el: Element, attrs: Record<string, string>): void {
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
}

export function addClass(el: Element, ...classes: string[]): void {
  el.classList.add(...classes);
}

export function removeClass(el: Element, ...classes: string[]): void {
  el.classList.remove(...classes);
}

export function on(
  el: Element,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
): void {
  el.addEventListener(event, handler, options);
}

export function off(
  el: Element,
  event: string,
  handler: EventListenerOrEventListenerObject
): void {
  el.removeEventListener(event, handler);
}

export function createContainer(
  parent: HTMLElement | string,
  className: string
): HTMLDivElement {
  const el = typeof parent === 'string' ? document.querySelector(parent) : parent;
  if (!el) throw new Error(`makeshift.js: Container "${parent}" not found`);

  const wrapper = document.createElement('div');
  wrapper.className = `makeshift-container ${className}`;
  wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';
  el.innerHTML = '';
  el.appendChild(wrapper);
  return wrapper;
}

export function getContainerSize(
  container: HTMLElement | string,
  options: { width?: number; height?: number }
): { width: number; height: number } {
  const el = typeof container === 'string' ? document.querySelector(container) as HTMLElement : container;
  if (!el) throw new Error(`makeshift.js: Container not found`);
  return {
    width: options.width || el.clientWidth || 800,
    height: options.height || el.clientHeight || 500,
  };
}
