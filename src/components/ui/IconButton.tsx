import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  size?: number;
  className?: string;
  variant?: 'ghost' | 'filled' | 'outline';
}

const IconButton: React.FC<IconButtonProps> = ({ 
  icon: Icon, 
  onClick, 
  size = 20, 
  className = '',
  variant = 'ghost'
}) => {
  const variants = {
    ghost: 'bg-white/5 hover:bg-white/10 text-white/70',
    filled: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
    outline: 'bg-transparent border border-white/10 hover:border-cyan-500/50 text-white/70',
  };

  return (
    <button 
      onClick={onClick}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${variants[variant]} ${className}`}
    >
      <Icon size={size} />
    </button>
  );
};

export default IconButton;
