import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { type NavItem as NavItemType } from '@/config/navItems';
import { labelVariants } from './variants';

export function NavItem({ item, isOpen }: { item: NavItemType; isOpen: boolean }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `relative flex items-center ${isOpen ? 'justify-start gap-4 px-4' : 'justify-center'} py-3.5 rounded-xl transition-colors duration-200 group overflow-hidden ${
          isActive ? 'text-white' : 'text-white/40 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Torch glow */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                key="glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/5 to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_12px_rgba(232,88,58,0.8)] z-20"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}

          <item.icon
            size={20}
            className={`shrink-0 relative z-10 transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-white/40 group-hover:text-white'
            }`}
          />

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.span
                key={`label-${item.path}`}
                variants={labelVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className={`relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden ${
                  isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                }`}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );
}
