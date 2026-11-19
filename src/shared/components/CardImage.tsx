import { useState, type ReactNode } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CardImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback?: ReactNode;
  fallbackClassName?: string;
}

export function CardImage({
  src,
  alt,
  className,
  imgClassName,
  fallback,
  fallbackClassName,
}: CardImageProps) {
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && erroredSrc !== src;

  return (
    <div className={cn('relative overflow-hidden bg-surface-subtle', className)}>
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={alt}
          className={cn('w-full h-full object-cover', imgClassName)}
          onError={() => setErroredSrc(src ?? null)}
        />
      ) : (
        (fallback ?? (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center text-muted/40',
              fallbackClassName
            )}>
            <ImageOff size={28} />
          </div>
        ))
      )}
    </div>
  );
}
