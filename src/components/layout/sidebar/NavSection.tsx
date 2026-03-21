import { motion, AnimatePresence } from 'framer-motion';
import { type NavItem as NavItemType } from '@/config/navItems';
import { NavItem } from './NavItem';
import { labelVariants } from './variants';

function CategoryLabel({ label }: { label: string }) {
  return (
    <div className="px-4 mb-3">
      <span className="text-[10px] font-extrabold text-white/20 uppercase tracking-[0.2em] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

export function NavSection({
  category,
  items,
  isOpen,
}: {
  category: string;
  items: NavItemType[];
  isOpen: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`cat-${category}`}
            variants={labelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden"
          >
            <CategoryLabel label={category} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <NavItem key={item.path} item={item} isOpen={isOpen} />
        ))}
      </div>
    </div>
  );
}
