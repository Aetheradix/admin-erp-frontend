import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Side - Dark Hero Section (Inspired by the reference image) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0a0a0b] relative overflow-hidden group">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen" />
        </div>

        {/* Logo/Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-black font-black text-xl">A</span>
          </div>
          <span className="text-white font-black text-2xl tracking-tighter">AetherERP</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-[#0a0a0b]"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                    alt="Trusted User"
                  />
                ))}
              </div>
              <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Trusted by 1000+ founders</span>
            </div>

            <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              Your teams brain, <br />
              <span className="text-primary italic">always</span> accessible.
            </h1>
            <p className="text-lg text-white/40 font-medium leading-relaxed">
              AetherERP keeps your collective intelligence flowing across every tool, 
              every conversation, every decision. Never loose context again.
            </p>
          </motion.div>
        </div>

        {/* Bottom Navigation (Mocked) */}
        <div className="relative z-10 flex gap-8 text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Mission</a>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="text-black font-black text-xl tracking-tighter">AetherERP</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-black text-black mb-2 tracking-tight">{title}</h2>
            {subtitle && <p className="text-muted font-medium mb-8 uppercase text-[10px] tracking-widest">{subtitle}</p>}
            
            <div className="mt-8">
              {children}
            </div>
          </motion.div>
        </div>

        {/* Bottom Logo Cloud (Inspired by reference) */}
        <div className="absolute bottom-12 left-0 w-full hidden lg:flex flex-col items-center px-8">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-6">Backed By the Best</p>
          <div className="flex items-center justify-center gap-12 opacity-30 grayscale saturate-0">
             <span className="font-black text-xl italic tracking-tighter">LOGOIPSUM</span>
             <span className="font-black text-xl italic tracking-tighter uppercase">Generic</span>
             <span className="font-black text-xl italic tracking-tighter">LOGO</span>
             <span className="font-black text-xl italic tracking-tighter">IPSUM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
