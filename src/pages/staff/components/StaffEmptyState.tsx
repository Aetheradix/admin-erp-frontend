import { Users } from 'lucide-react';

export const StaffEmptyState = () => {
  return (
    <div className="col-span-full py-32 rounded-[48px] border-2 border-dashed border-border-strong bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-center gap-6">
      <div className="w-24 h-24 rounded-full bg-surface-subtle flex items-center justify-center text-muted/30">
        <Users size={48} />
      </div>
      <div className="max-w-md px-6">
        <h3 className="text-2xl font-black text-foreground mb-2">No Members Found</h3>
        <p className="text-muted font-medium leading-relaxed">
          We couldn't find any team members matching your search criteria. Try adjusting your
          filters.
        </p>
      </div>
    </div>
  );
};
