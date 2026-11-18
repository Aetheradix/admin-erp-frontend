import { Terminal, Zap } from 'lucide-react';
import type { AuditView } from '../types';

interface AuditViewToggleProps {
  activeView: AuditView;
  invitationCount: number;
  onChange: (view: AuditView) => void;
}

export function AuditViewToggle({ activeView, invitationCount, onChange }: AuditViewToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange('stream')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeView === 'stream'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'bg-white border border-border-subtle text-muted hover:text-foreground'
        }`}>
        <Terminal size={14} />
        Activity Stream
      </button>
      <button
        onClick={() => onChange('journey')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeView === 'journey'
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'bg-white border border-border-subtle text-muted hover:text-foreground'
        }`}>
        <Zap size={14} />
        Onboarding Journeys
        <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-black">
          {invitationCount}
        </span>
      </button>
    </div>
  );
}
