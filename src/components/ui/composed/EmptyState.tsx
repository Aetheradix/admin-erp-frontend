import { InboxOutlined } from '@ant-design/icons';
import { Button } from '../primitives/Button';
import { cn } from '@/utils/cn';
import { resolvePrimeIcon } from '@/utils/primeIcon';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({ title, description, icon = 'pi pi-inbox', action, className }: EmptyStateProps) => {
  const resolvedIcon = resolvePrimeIcon(icon) ?? <InboxOutlined />;

  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center rounded-shell bg-surface-subtle border border-dashed border-border-strong', className)}>
      <div className="w-16 h-16 rounded-full bg-white shadow-soft flex items-center justify-center mb-6 text-3xl text-primary/60">
        {resolvedIcon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted max-w-sm mb-8">{description}</p>
      {action && (
        <Button
          label={action.label}
          onClick={action.onClick}
          icon="pi pi-plus"
          variant="primary"
          className="rounded-full px-8"
        />
      )}
    </div>
  );
};
