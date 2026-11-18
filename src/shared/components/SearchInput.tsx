import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';
import { cn } from '@/utils/cn';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  iconSize?: number;
  clearable?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
}

const DEFAULT_INPUT_CLASSES = 'pl-11! pr-10!';
const DEFAULT_ICON_CLASSES =
  'absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors';

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  iconClassName,
  iconSize = 18,
  clearable = false,
  ariaLabel,
  disabled,
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full group', className)}>
      <Search
        size={iconSize}
        aria-hidden="true"
        className={
          iconClassName ??
          DEFAULT_ICON_CLASSES
        }
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        disabled={disabled}
        className={inputClassName ?? DEFAULT_INPUT_CLASSES}
      />
      {clearable && value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1">
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
