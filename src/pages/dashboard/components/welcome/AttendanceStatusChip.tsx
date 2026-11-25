import { cn } from '@/utils/cn';
import type { AttendanceChipState } from '../../utils/welcomeBar';

export function AttendanceStatusChip({ state }: { state: AttendanceChipState }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3.5 py-2 rounded-[10px] border text-xs font-bold transition-all',
        state.className
      )}>
      <span className={cn('w-2 h-2 rounded-full', state.dotClassName)} />
      <span>{state.label}</span>
    </div>
  );
}
