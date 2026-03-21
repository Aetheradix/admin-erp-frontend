import { Button } from '../primitives/Button';
import { classNames } from 'primereact/utils';

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
  return (
    <div className={classNames('flex flex-col items-center justify-center p-12 text-center rounded-shell bg-surface-subtle border border-dashed border-border-strong', className)}>
      <div className="w-16 h-16 rounded-pill bg-white shadow-soft flex items-center justify-center mb-6">
        <i className={`${icon} text-3xl text-primary/60`} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted max-w-sm mb-8">{description}</p>
      {action && (
        <Button 
          label={action.label} 
          onClick={action.onClick} 
          icon="pi pi-plus"
          variant="primary"
          className="rounded-pill px-8"
        />
      )}
    </div>
  );
};
