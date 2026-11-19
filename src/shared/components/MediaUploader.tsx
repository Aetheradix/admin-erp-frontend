import { useRef, useState, type ChangeEvent } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/primitives/Button';

export interface MediaUploaderProps {
  value: readonly string[];
  onChange: (urls: string[]) => void;
  onUpload: (file: File) => Promise<string>;
  mode?: 'single' | 'multi';
  accept?: string;
  maxSizeMb?: number;
  onError?: (message: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  previewClassName?: string;
}

export function MediaUploader({
  value,
  onChange,
  onUpload,
  mode = 'single',
  accept = 'image/*',
  maxSizeMb = 5,
  onError,
  label = 'Upload',
  disabled = false,
  className,
  previewClassName,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    setIsUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      if (file.size > maxSizeMb * 1024 * 1024) {
        onError?.(`${file.name} exceeds ${maxSizeMb} MB.`);
        continue;
      }
      try {
        uploaded.push(await onUpload(file));
      } catch (error) {
        onError?.(error instanceof Error ? error.message : `Could not upload ${file.name}.`);
      }
    }
    setIsUploading(false);

    if (uploaded.length === 0) return;
    onChange(mode === 'single' ? uploaded.slice(-1) : [...value, ...uploaded]);
  };

  const removeUrl = (url: string) => onChange(value.filter((current) => current !== url));

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={mode === 'multi'}
        onChange={handleFiles}
        className="hidden"
        aria-label={label}
      />
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div
            key={url}
            className={cn(
              'relative w-24 h-24 rounded-2xl overflow-hidden border border-border-subtle bg-surface-subtle',
              previewClassName
            )}>
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              aria-label="Remove file"
              onClick={() => removeUrl(url)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-error transition-colors">
              <X size={12} />
            </button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          icon={isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}>
          {isUploading ? 'Uploading…' : label}
        </Button>
      </div>
    </div>
  );
}
