import { motion, AnimatePresence } from 'framer-motion';
import { Package2 } from 'lucide-react';
import { labelVariants } from './variants';

export function SidebarLogo({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="h-24 flex items-center px-5 gap-3">
      <div className="w-10 h-10 shrink-0 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-md transition-transform hover:scale-105 active:scale-95">
        <Package2 size={24} />
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.span
            key="logo-text"
            variants={labelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="text-xl font-bold tracking-tight text-white whitespace-nowrap overflow-hidden"
          >
            Aether<span className="text-primary">ERP</span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
