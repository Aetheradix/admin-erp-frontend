import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/sidebar/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';


const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary selection:text-background relative font-body ">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-background  shadow-sm border border-gray-100/50">
        <Header onMenuClick={toggleSidebar}/>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-background custom-scrollbar">
          <div className="max-w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
