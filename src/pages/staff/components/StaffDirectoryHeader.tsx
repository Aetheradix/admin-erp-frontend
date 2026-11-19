import { Sparkles } from 'lucide-react';

interface StaffDirectoryHeaderProps {
  count: number;
  department: string;
}

export function StaffDirectoryHeader({ count, department }: StaffDirectoryHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
            {count} Members Registered
          </h2>
          <p className="text-xs text-muted font-bold">Showing {department} directory</p>
        </div>
      </div>
    </div>
  );
}
