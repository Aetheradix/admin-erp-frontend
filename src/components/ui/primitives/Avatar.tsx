import { Avatar as PRAvatar, type AvatarProps as PRAvatarProps } from 'primereact/avatar';
import { classNames } from 'primereact/utils';

export const Avatar = ({ className, ...props }: PRAvatarProps) => {
  return (
    <PRAvatar
      className={classNames(
        'rounded-pill shadow-soft border border-surface-subtle overflow-hidden bg-surface-subtle text-muted font-medium',
        className
      )}
      {...props}
    />
  );
};
