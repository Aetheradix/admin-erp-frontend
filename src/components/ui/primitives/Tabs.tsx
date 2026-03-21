import { TabMenu as PRTabMenu, type TabMenuProps as PRTabMenuProps } from 'primereact/tabmenu';
import { classNames } from 'primereact/utils';

interface TabsProps extends Omit<PRTabMenuProps, 'model'> {
  items: string[];
  activeItem: string;
  onItemChange: (item: string) => void;
}

export const Tabs = ({ items, activeItem, onItemChange, className, ...props }: TabsProps) => {
  const model = items.map(item => ({
    label: item,
    command: () => onItemChange(item)
  }));

  const activeIndex = items.indexOf(activeItem);

  return (
    <PRTabMenu
      model={model}
      activeIndex={activeIndex >= 0 ? activeIndex : 0}
      className={classNames('premium-tabs', className)}
      pt={{
        root: { className: 'border-none bg-transparent' },
        menu: { className: 'flex gap-2 p-0 border-none bg-transparent list-none m-0' },
        menuitem: { className: 'm-0' },
        action: ({ context }: any) => ({
          className: classNames(
            'relative px-8 py-3.5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 flex-shrink-0 border-none cursor-pointer flex items-center justify-center gap-2 outline-none overflow-hidden',
            context.active 
              ? 'bg-primary text-white shadow-[0_10px_20px_-5px_rgba(231,76,60,0.3)] scale-105 z-10' 
              : 'bg-surface-subtle text-muted hover:text-foreground hover:bg-surface-elevated active:scale-95'
          )
        }),
        label: { className: 'z-20 pointer-events-none' },
        inkbar: { className: 'hidden' }
      }}
      {...props}
    />
  );
};
