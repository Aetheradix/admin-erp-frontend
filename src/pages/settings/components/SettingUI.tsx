interface SettingItemProps {
  icon: any;
  label: string;
  description: string;
  control: React.ReactNode;
}

export function SettingItem({ icon: Icon, label, description, control }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-border-subtle shadow-xs hover:shadow-soft transition-all duration-300">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-primary shrink-0">
          <Icon size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-black text-foreground uppercase tracking-tight">
            {label}
          </span>
          <p className="text-xs font-medium text-muted-foreground max-w-md italic">{description}</p>
        </div>
      </div>
      <div>{control}</div>
    </div>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-sm font-black text-foreground uppercase tracking-[0.15em] border-l-4 border-primary pl-4 py-1">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </div>
  );
}
