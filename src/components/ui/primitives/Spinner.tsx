
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div 
      className={`
        inline-block animate-spin rounded-full border-solid border-primary border-t-transparent
        ${sizeMap[size]}
        ${className || ''}
      `}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
