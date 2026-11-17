import React from 'react';

interface DotGridBackgroundProps {
  pan: { x: number; y: number };
  zoom: number;
}

export const DotGridBackground: React.FC<DotGridBackgroundProps> = React.memo(({
  pan,
  zoom,
}) => {
  const dotSpacing = 24 * zoom;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="model-view-dot-pattern"
          width={dotSpacing}
          height={dotSpacing}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${pan.x % dotSpacing}, ${pan.y % dotSpacing})`}
        >
          <circle cx="2" cy="2" r="1.2" fill="#94a3b8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#model-view-dot-pattern)" />
    </svg>
  );
});

DotGridBackground.displayName = 'DotGridBackground';
