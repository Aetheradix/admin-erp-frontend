import { Divider as PRDivider, type DividerProps as PRDividerProps } from 'primereact/divider';
import { classNames } from 'primereact/utils';

export const Divider = ({ className, ...props }: PRDividerProps) => {
  return (
    <PRDivider
      className={classNames(
        'before:border-border-subtle my-6',
        className
      )}
      {...props}
    />
  );
};
