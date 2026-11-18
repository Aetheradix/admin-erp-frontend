import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { SECTION_ICON_MAP } from '../constants';

interface SectionBadgeProps {
  sectionId: string;
  sectionLabel: string;
  completed: boolean;
}

// Compact section completion badge
export function SectionBadge({ sectionId, sectionLabel, completed }: SectionBadgeProps) {
  const Icon = SECTION_ICON_MAP[sectionId] || FileText;
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
        completed
          ? 'bg-success/10 border-success/25 text-success'
          : 'bg-surface-subtle border-border-subtle text-muted'
      }`}>
      <Icon size={11} />
      <span>{sectionLabel}</span>
      {completed ? <CheckCircle2 size={10} className="text-success" /> : <Clock size={10} />}
    </div>
  );
}
