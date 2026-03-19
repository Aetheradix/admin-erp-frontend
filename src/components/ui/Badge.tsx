import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'muted' | 'gradient';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    muted: 'bg-white/5 text-white/40 border-white/10',
    gradient: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wider border transition-all ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
