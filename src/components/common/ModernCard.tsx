import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const ModernCard: React.FC<ModernCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`
        bg-white/5 
        backdrop-blur-md 
        border border-white/10 
        rounded-2xl 
        p-6 
        transition-all 
        duration-300 
        hover:bg-white/10 
        hover:border-white/20 
        ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-[#d4ff3f]/10' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ModernCard;
