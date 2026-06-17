import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { type NavItem as NavItemType } from '@/config/navItems';
import { labelVariants } from './variants';

export function NavItem({ item, isOpen }: { item: NavItemType; isOpen: boolean }) {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand if current path matches any child
  const isChildActive = hasChildren
    ? item.children!.some(child => location.pathname === child.path)
    : false;
  const isParentActive = location.pathname === item.path;

  const [expanded, setExpanded] = useState(isChildActive || isParentActive);

  // For items with children, toggle expand instead of navigating
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`relative w-full flex items-center ${isOpen ? 'justify-start gap-4 px-4' : 'justify-center'} py-3.5 rounded-lg transition-colors duration-200 group overflow-hidden ${isChildActive || isParentActive ? 'text-white' : 'text-white/40 hover:text-white'
            }`}
        >
          {/* Torch glow */}
          <AnimatePresence>
            {(isChildActive || isParentActive) && (
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
          {(isChildActive || isParentActive) && (
            <motion.div
              className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_12px_rgba(232,88,58,0.8)] z-20"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}

          <item.icon
            size={20}
            className={`shrink-0 relative z-10 transition-colors duration-200 ${isChildActive || isParentActive ? 'text-primary' : 'text-white/40 group-hover:text-white'
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
                className={`relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden flex-1 text-left ${isChildActive || isParentActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                  }`}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Chevron */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="chevron"
                variants={labelVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <motion.div
                  animate={{ rotate: expanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={14} className="text-white/30" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Children sub-menu */}
        <AnimatePresence initial={false}>
          {expanded && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-9 pl-3 border-l border-white/10 flex flex-col gap-0.5 py-1">
                {item.children!.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    end={child.path === item.path}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-md text-[13px] font-medium transition-all duration-200 animated-underline ${isActive
                        ? 'text-white bg-primary/20'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                      }`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standard nav item (no children)
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      aria-label={`Navigate to ${item.label}`}
      className={({ isActive }) =>
        `relative flex items-center ${isOpen ? 'justify-start gap-4 px-4' : 'justify-center'} py-3.5 rounded-lg transition-colors duration-200 group overflow-hidden ${isActive ? 'text-white' : 'text-white/40 hover:text-white'
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
            className={`shrink-0 relative z-10 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-white/40 group-hover:text-white'
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
                className={`relative z-10 text-sm font-medium whitespace-nowrap overflow-hidden ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
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
