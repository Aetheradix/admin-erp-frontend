import { cn } from '@/utils/cn';

interface TabsProps {
  items: string[];
  activeItem: string;
  onItemChange: (item: string) => void;
  className?: string;
}

export const Tabs = ({ items, activeItem, onItemChange, className }: TabsProps) => {
  return (
    <div className={cn('flex gap-2 p-0 border-none bg-transparent list-none m-0 flex-wrap', className)}>
      {items.map((item) => {
        const isActive = item === activeItem;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onItemChange(item)}
            className={cn(
              'relative px-8 py-3.5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 flex-shrink-0 border-none cursor-pointer flex items-center justify-center gap-2 outline-none overflow-hidden',
              isActive
                ? 'bg-primary text-white shadow-[0_10px_20px_-5px_rgba(231,76,60,0.3)] scale-105 z-10'
                : 'bg-surface-subtle text-muted hover:text-foreground hover:bg-surface-elevated active:scale-95'
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
};
