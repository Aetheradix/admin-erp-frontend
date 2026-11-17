import React from 'react';
import { Users } from 'lucide-react';
import type { NodePosition } from '../../types';

interface EmptyReportsCardProps {
  pos: NodePosition;
  managerName?: string;
}

export const EmptyReportsCard: React.FC<EmptyReportsCardProps> = React.memo(({
  pos,
  managerName,
}) => {
  return (
    <div
      data-node-card="true"
      style={{
        width: pos.width,
        height: pos.height,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`,
      }}
      className="absolute top-0 left-0 pointer-events-auto rounded-2xl bg-white/80 border border-dashed border-slate-300 p-4 flex flex-col justify-center items-center text-center text-slate-500"
    >
      <Users size={20} className="text-slate-400 mb-1" />
      <span className="text-xs font-bold text-slate-700">No Direct Reports</span>
      <span className="text-[11px] text-slate-400 mt-0.5">
        Individual contributor reporting to {managerName || 'Executive'}
      </span>
    </div>
  );
});

EmptyReportsCard.displayName = 'EmptyReportsCard';
