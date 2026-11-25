import React from 'react';
import type { ConnectorPath } from '../types';

interface ConnectorsLayerProps {
  connectors: ConnectorPath[];
}

export const ConnectorsLayer: React.FC<ConnectorsLayerProps> = React.memo(({ connectors }) => {
  return (
    <svg
      className="absolute overflow-visible pointer-events-none"
      style={{ left: 0, top: 0, width: 5000, height: 5000 }}>
      {connectors.map((c) => (
        <path
          key={c.id}
          d={c.d}
          fill="none"
          stroke={c.highlighted ? '#0078d4' : '#cbd5e1'}
          strokeWidth={c.highlighted ? 2.5 : 2}
          strokeLinecap="round"
          className="transition-[stroke,stroke-width] duration-300"
        />
      ))}
    </svg>
  );
});

ConnectorsLayer.displayName = 'ConnectorsLayer';
