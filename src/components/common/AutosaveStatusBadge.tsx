import { Check, Cloud, CloudOff, RefreshCw } from 'lucide-react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'modified' | 'restored' | 'error';

interface Props {
  status: AutosaveStatus;
  lastSavedAt?: string | null;
  className?: string;
}

export function AutosaveStatusBadge({ status, lastSavedAt, className = '' }: Props) {
  if (status === 'idle') return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
        status === 'saving'
          ? 'bg-primary/10 text-primary'
          : status === 'saved'
            ? 'bg-success/10 text-success'
            : status === 'modified'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : status === 'restored'
                ? 'bg-info/10 text-info'
                : 'bg-error/10 text-error'
      } ${className}`}>
      {status === 'saving' && (
        <>
          <RefreshCw size={12} className="animate-spin" />
          <span>Saving draft...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <Check size={12} />
          <span>Draft saved</span>
        </>
      )}

      {status === 'modified' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Unsaved changes</span>
        </>
      )}

      {status === 'restored' && (
        <>
          <Cloud size={12} />
          <span>Draft restored</span>
        </>
      )}

      {status === 'error' && (
        <>
          <CloudOff size={12} />
          <span>Draft autosave failed</span>
        </>
      )}

      {lastSavedAt && status === 'saved' && (
        <span className="text-[10px] opacity-75">
          ({new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
        </span>
      )}
    </div>
  );
}
