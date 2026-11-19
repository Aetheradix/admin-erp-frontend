import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface WizardStepConfig {
  key: string;
  label: string;
}

export interface WizardStepperProps {
  steps: readonly WizardStepConfig[];
  activeIndex: number;
  variant?: 'bar' | 'dots';
  className?: string;
  labelClassName?: string;
}

export function WizardStepper({
  steps,
  activeIndex,
  variant = 'bar',
  className,
  labelClassName,
}: WizardStepperProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center gap-2">
            <span
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border transition-colors',
                index < activeIndex && 'bg-success text-white border-success',
                index === activeIndex && 'bg-primary text-white border-primary',
                index > activeIndex && 'bg-white text-muted border-border-subtle'
              )}>
              {index < activeIndex ? <Check size={14} /> : index + 1}
            </span>
            {index < steps.length - 1 && <span className="w-6 h-px bg-border-subtle" />}
          </div>
        ))}
      </div>
    );
  }

  const percent = steps.length > 0 ? ((activeIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="h-1.5 rounded-full bg-surface-subtle overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <span
            key={step.key}
            className={cn(
              'text-[11px] font-black uppercase tracking-wider',
              index <= activeIndex ? 'text-primary' : 'text-muted',
              labelClassName
            )}>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface WizardStepProps {
  children: ReactNode;
  className?: string;
}

export function WizardStep({ children, className }: WizardStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={className}>
      {children}
    </motion.div>
  );
}
