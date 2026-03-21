import React from 'react';
import { Button } from '../primitives/Button';
import { classNames } from 'primereact/utils';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  back?: boolean;
  className?: string;
}

export const PageHeader = ({ title, subtitle, actions, back, className }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={classNames('flex items-center justify-between gap-4 mb-8 pb-4 border-b border-border-subtle', className)}>
      <div className="flex items-center gap-4">
        {back && (
          <Button 
            icon="pi pi-arrow-left" 
            variant="ghost" 
            size="small" 
            onClick={() => navigate(-1)}
            className="rounded-full h-10 w-10 p-0"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </div>
  );
};
