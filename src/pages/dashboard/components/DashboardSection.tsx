import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardSectionProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}

export function DashboardSection({
  children,
  delay = 0,
  y = 10,
  duration = 0.35,
  className,
}: DashboardSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}>
      {children}
    </motion.div>
  );
}
