export interface BezierPoint {
  x: number;
  y: number;
}

export function buildBezierPath(from: BezierPoint, to: BezierPoint): string {
  const deltaY = to.y - from.y;
  const controlY1 = from.y + deltaY * 0.5;
  const controlY2 = to.y - deltaY * 0.5;
  return `M ${from.x} ${from.y} C ${from.x} ${controlY1}, ${to.x} ${controlY2}, ${to.x} ${to.y}`;
}

export function buildHorizontalBezierPath(
  from: BezierPoint,
  to: BezierPoint,
  controlRatio = 0.5
): string {
  const deltaX = to.x - from.x;
  const controlX1 = from.x + deltaX * controlRatio;
  const controlX2 = to.x - deltaX * controlRatio;
  return `M ${from.x} ${from.y} C ${controlX1} ${from.y}, ${controlX2} ${to.y}, ${to.x} ${to.y}`;
}
