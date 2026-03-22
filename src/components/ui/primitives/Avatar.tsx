import { Avatar as PRAvatar, type AvatarProps as PRAvatarProps } from 'primereact/avatar';
import { classNames } from 'primereact/utils';

interface AvatarProps extends PRAvatarProps {
  width?: number | string;
  height?: number | string;
}

export const Avatar = ({ className, width, height, image, imageAlt, children, ...props }: AvatarProps) => {
  return (
    <PRAvatar
      className={classNames(
        'rounded-pill shadow-soft border border-surface-subtle overflow-hidden bg-surface-subtle text-muted font-medium',
        className
      )}
      style={{ width, height, ...props.style }}
      {...props}
    >
      {image ? (
        <img 
          src={image} 
          alt={imageAlt || 'Avatar'} 
          width={width} 
          height={height} 
          className="w-full h-full object-cover"
        />
      ) : children}
    </PRAvatar>
  );
};
