import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AuthCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  children,
  className = '' 
}) => {
  return (
    <div className={`w-full bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-inner">
          <Icon className="text-cyan-400" size={20} />
        </div>
        <div>
          <h3 className="text-white text-lg font-bold leading-tight">{title}</h3>
          <p className="text-muted text-xs mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AuthCard;
