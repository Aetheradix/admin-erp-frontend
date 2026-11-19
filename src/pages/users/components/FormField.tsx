import type { ReactNode } from 'react';

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
        {label}
      </label>
      {children}
    </div>
  );
}
