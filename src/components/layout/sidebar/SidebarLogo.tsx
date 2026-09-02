import { motion, AnimatePresence } from 'framer-motion';
import { labelVariants } from './variants';
import { ARXLogo } from '@/config/arx-logo';
import { useGetAttendanceStatusQuery } from '@/store/api/attendanceSlice';

export function SidebarLogo({ isOpen }: { isOpen: boolean }) {
  const { data: attendanceStatus } = useGetAttendanceStatusQuery();
  const isCheckedIn = attendanceStatus?.status === 'checked-in';

  return (
    <div className="h-24 flex items-center px-5 gap-3">
      <div className={`shrink-0 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-md transition-all hover:scale-105 active:scale-95 ${isOpen ? 'w-14 h-14 p-2' : 'w-9 h-9 p-1.5'}`}>
        <ARXLogo isCheckedIn={isCheckedIn} className="w-full h-full text-white" />
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
            Startup<span className="text-primary">OS</span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
