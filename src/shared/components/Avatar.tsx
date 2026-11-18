import { memo } from 'react';
import { Tooltip } from 'antd';
import { cn } from '@/utils/cn';
import { getInitials } from '../utils/getInitials';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const DEFAULT_BACKGROUND = '#64748b';

export interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: AvatarSize;
  backgroundColor?: string;
  presence?: boolean;
  presenceLabel?: string;
  maxInitials?: number;
  alt?: string;
  className?: string;
}

export const Avatar = memo(function Avatar({
  name,
  imageUrl,
  size = 'md',
  backgroundColor = DEFAULT_BACKGROUND,
  presence = false,
  presenceLabel = 'Available / Active',
  maxInitials = 2,
  alt,
  className,
}: AvatarProps) {
  const label = (name ?? '').trim();
  if (!label && !imageUrl) return null;

  return (
    <div className={cn('relative shrink-0', className)}>
      {imageUrl ? (
        <div className={cn(SIZE_MAP[size], 'rounded-full overflow-hidden border-2 border-white shadow-md')}>
          <img src={imageUrl} alt={alt ?? label} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className={cn(
            SIZE_MAP[size],
            'rounded-full flex items-center justify-center font-black text-white shadow-md border-2 border-white'
          )}
          style={{ backgroundColor }}>
          {getInitials(label, { max: maxInitials })}
        </div>
      )}
      {presence && (
        <Tooltip title={presenceLabel}>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#107c41] border-2 border-white shadow-xs cursor-default" />
        </Tooltip>
      )}
    </div>
  );
});
