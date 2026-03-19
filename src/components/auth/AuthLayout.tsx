import React from 'react';
import Badge from '@/components/ui/Badge';

interface AuthLayoutProps {
  children: React.ReactNode;
  leftPanelContent?: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  leftPanelContent, 
  title, 
  subtitle, 
  badge = 'ERP ADMIN' 
}) => {
  return (
    <div className="min-h-screen w-full flex bg-[#020617] font-body text-[#e5e7eb]">
      {/* Left Panel - Hidden on smaller screens */}
      <div className="hidden lg:flex flex-col justify-center items-center w-5/12 min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] p-12 relative overflow-hidden">
        
        {/* Background Decorative Rings */}
        <div className="absolute top-20 left-10 w-64 h-64 border border-cyan-500/10 rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] border border-cyan-500/5 rounded-full"></div>

        <div className="relative w-full max-w-md space-y-6 z-10 flex flex-col items-center">
          {leftPanelContent}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#020617] lg:rounded-l-3xl border-l border-white/5 shadow-2xl z-20 overflow-y-auto">
        <div className="w-full max-w-[420px] py-10">
          <Badge className="mb-8 border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            {badge}
          </Badge>

          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{title}</h1>
          <p className="text-muted text-sm md:text-base mb-8">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
