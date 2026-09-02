import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/primitives/Button';
import { labelVariants } from './variants';

export function SidebarFooter({ isOpen, onLogout }: { isOpen: boolean; onLogout: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="p-4 border-t border-white/5">
      <Button
        variant="ghost"
        onClick={onLogout}
        aria-label={t('nav.signOut')}
        className={`flex items-center w-full rounded-xl py-3.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 group ${
          isOpen ? 'justify-start gap-4 px-4' : 'justify-center px-0'
        }`}
      >
        <LogOut
          size={20}
          className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1"
        />
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.span
              key="logout-label"
              variants={labelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="font-semibold text-sm tracking-wide overflow-hidden whitespace-nowrap"
            >
              {t('nav.signOut')}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}
