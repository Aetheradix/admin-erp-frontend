import { Clock } from 'lucide-react';
import { STEP_STATUS_STYLE } from '../constants';
import type { JourneyStep } from '../types';

interface JourneyTimelineProps {
  steps: JourneyStep[];
}

export function JourneyTimeline({ steps }: JourneyTimelineProps) {
  return (
    <div className="relative pl-6">
      {/* Vertical connector line */}
      <div className="absolute left-3 top-3 bottom-3 w-px bg-border-subtle/50" />

      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={idx} className={`relative flex items-start gap-4 ${isLast ? '' : 'mb-5'}`}>
            {/* Step dot */}
            <div
              className={`absolute -left-[9px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 ${STEP_STATUS_STYLE[step.status]}`}>
              {step.status === 'done' ? (
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-white">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : step.status === 'failed' ? (
                <span className="text-[8px] font-black">✕</span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-muted/40 block" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 ml-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    step.status === 'done'
                      ? 'text-foreground'
                      : step.status === 'failed'
                        ? 'text-error'
                        : 'text-muted'
                  }`}>
                  {step.label}
                </span>
                {step.status === 'done' && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-success/10 text-success">
                    done
                  </span>
                )}
                {step.status === 'pending' && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-muted/10 text-muted">
                    pending
                  </span>
                )}
                {step.status === 'failed' && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-error/10 text-error">
                    blocked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted mt-0.5">{step.description}</p>
              {step.timestamp && (
                <p className="text-[10px] text-muted/60 flex items-center gap-1 mt-0.5">
                  <Clock size={9} />
                  {new Date(step.timestamp).toLocaleString()}
                </p>
              )}
              {step.logEntry && (
                <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-[10px] text-muted leading-relaxed">
                  {step.logEntry.details}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
