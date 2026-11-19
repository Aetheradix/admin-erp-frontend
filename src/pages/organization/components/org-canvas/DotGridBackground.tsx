interface DotGridBackgroundProps {
  zoom: number;
  pan: { x: number; y: number };
}

export function DotGridBackground({ zoom, pan }: DotGridBackgroundProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="light-dot-grid-pattern"
          width={24 * zoom}
          height={24 * zoom}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${pan.x % (24 * zoom)}, ${pan.y % (24 * zoom)})`}>
          <circle cx="2" cy="2" r="1.2" fill="#cbd5e1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#light-dot-grid-pattern)" />
    </svg>
  );
}
