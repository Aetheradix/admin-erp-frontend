import { Avatar as AntAvatar } from 'antd';
import { cn } from '@/utils/cn';

interface AvatarProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  image?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  label?: string;
  icon?: React.ReactNode;
  shape?: 'circle' | 'square';
}

export const Avatar = ({
  className,
  width,
  height,
  image,
  imageAlt,
  children,
  style,
  label,
  icon,
  shape = 'circle',
}: AvatarProps) => {
  const size = typeof width === 'number' ? width : undefined;

  return (
    <AntAvatar
      src={image}
      alt={imageAlt || 'Avatar'}
      icon={icon}
      shape={shape}
      size={size}
      className={cn(
        'shadow-soft border border-surface-subtle overflow-hidden bg-surface-subtle text-muted font-medium',
        className
      )}
      style={{ width, height, ...style }}
    >
      {children ?? label}
    </AntAvatar>
  );
};
