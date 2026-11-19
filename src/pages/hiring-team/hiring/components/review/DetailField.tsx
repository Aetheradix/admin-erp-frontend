interface DetailFieldProps {
  label: string;
  value: string;
  mono?: boolean;
  plain?: boolean;
  capitalize?: boolean;
  className?: string;
}

export function DetailField({
  label,
  value,
  mono,
  plain,
  capitalize,
  className,
}: DetailFieldProps) {
  const valueClasses = [
    'mt-1',
    plain ? 'text-sm text-foreground' : 'text-sm font-semibold text-foreground',
    mono ? 'font-mono' : '',
    capitalize ? 'capitalize' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`p-4 rounded-2xl bg-surface-subtle ${className ?? ''}`}>
      <div className="text-[10px] font-bold text-muted uppercase">{label}</div>
      <div className={valueClasses}>{value}</div>
    </div>
  );
}
