import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/primitives/Input';

export interface TagInputProps {
  value: readonly string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: readonly string[];
  ariaLabel?: string;
  className?: string;
  chipClassName?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add a tag…',
  suggestions,
  ariaLabel = 'Tags',
  className,
  chipClassName,
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,+$/, '');
    if (!tag) return;
    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(value.filter((current) => current !== tag));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
      return;
    }
    if (event.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold',
              chipClassName
            )}>
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(tag)}
              className="hover:text-error transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions
            .filter((suggestion) => !value.includes(suggestion))
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="px-2.5 py-1 rounded-full border border-border-subtle text-[11px] font-bold text-muted hover:text-primary hover:border-primary/40 transition-colors">
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
