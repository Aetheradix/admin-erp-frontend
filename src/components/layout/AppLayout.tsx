import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/sidebar/Sidebar';
import Header from '@/components/layout/Header';


const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary selection:text-background relative font-body p-2 sm:p-4">
      {/* Sidebar Overlay for Mobile */}
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-background rounded-4xl  ml-0 lg:ml-2 shadow-sm border border-gray-100/50">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-background custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
