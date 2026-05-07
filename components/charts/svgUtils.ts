/**
 * Linear scale: returns a function that maps domain values to range values.
 * Like d3-scale's scaleLinear but minimal.
 */
export function scaleLinear(
  domain: [number, number],
  range: [number, number]
): (x: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const m = (r1 - r0) / (d1 - d0 || 1);
  return (x: number) => r0 + (x - d0) * m;
}

/**
 * Build an SVG path "d" attribute for a polyline through the given points.
 * Returns empty string for zero points; returns degenerate "M x y" for single point.
 */
export function polylinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  return points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
}

/**
 * Build an SVG path "d" attribute for an area chart filling from points
 * down to baseY. Returns empty string for fewer than 2 points.
 */
export function areaPath(
  points: Array<{ x: number; y: number }>,
  baseY: number
): string {
  if (points.length < 2) return '';
  const top = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
}
