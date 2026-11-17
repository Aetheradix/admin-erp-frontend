export interface ConnectorPoint {
  x: number;
  y: number;
}

/**
 * Builds a smooth vertical S-curve bezier SVG path string between two connector anchor points.
 */
export function buildBezierPath(from: ConnectorPoint, to: ConnectorPoint): string {
  const deltaY = to.y - from.y;
  const cy1 = from.y + deltaY * 0.5;
  const cy2 = to.y - deltaY * 0.5;
  return `M ${from.x} ${from.y} C ${from.x} ${cy1}, ${to.x} ${cy2}, ${to.x} ${to.y}`;
}
