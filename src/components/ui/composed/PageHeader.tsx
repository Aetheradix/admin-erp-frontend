import React from 'react';
import { Button } from '../primitives/Button';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void | Promise<void>;
    icon?: string;
    className?: string;
  };
  breadcrumbs?: Array<{ label: string; url?: string }>;
  back?: boolean;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  description,
  actions,
  primaryAction,
  breadcrumbs,
  back,
  className
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn('flex flex-col gap-4 mb-8', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted/60 mb-1">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="opacity-30">/</span>}
              {crumb.url ? (
                <button onClick={() => navigate(crumb.url!)} className="hover:text-primary transition-colors">
                  {crumb.label}
                </button>
              ) : (
                <span className="text-muted">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-center justify-between gap-4">
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
            <h1 className="text-3xl font-black text-foreground tracking-tight leading-none">{title}</h1>
            {(subtitle || description) && (
              <p className="text-muted text-sm mt-2 max-w-2xl font-medium">
                {description || subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          {primaryAction && (
            <Button
              label={primaryAction.label}
              icon={primaryAction.icon}
              onClick={primaryAction.onClick}
              className={cn('px-6 py-3 rounded-xl shadow-lg shadow-primary/10', primaryAction.className)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
