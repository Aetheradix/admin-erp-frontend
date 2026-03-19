import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, FileText, Image, Ticket, Briefcase, Users, Calendar, Settings, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const actions = [
  { icon: LayoutDashboard, label: 'Go to Dashboard', path: '/', category: 'Navigation' },
  { icon: FileText, label: 'Manage Blogs', path: '/blogs', category: 'Navigation' },
  { icon: Image, label: 'Browse Gallery', path: '/gallery', category: 'Navigation' },
  { icon: Ticket, label: 'View Events', path: '/events', category: 'Navigation' },
  { icon: Briefcase, label: 'View Careers', path: '/careers', category: 'Navigation' },
  { icon: Users, label: 'Manage Staff', path: '/users', category: 'Navigation' },
  { icon: Calendar, label: 'Open Calendar', path: '/calendar', category: 'Navigation' },
  { icon: Settings, label: 'Settings', path: '/settings', category: 'General' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#1b212f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <Search className="text-white/20" size={24} />
              <input
                autoFocus
                type="text"
                placeholder="Search for pages, tools, or actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder:text-white/10 font-bold"
              />
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                <Command size={14} className="text-white/40" />
                <span className="text-[10px] font-black text-white/40 uppercase">K</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 scroll-smooth">
              {filteredActions.length > 0 ? (
                <div className="space-y-6">
                  {/* Category Logic simplified here but can be expanded */}
                  <div className="space-y-2">
                    {filteredActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action.path)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 group transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-black transition-all">
                          <action.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white transition-colors group-hover:text-primary">
                            {action.label}
                          </div>
                          <div className="text-[10px] text-white/20 uppercase font-black tracking-widest leading-none mt-1">
                            {action.category}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                   <div className="text-white/10 mb-4 flex justify-center"><Search size={48} /></div>
                   <p className="text-white/40 font-bold">No results found for "{search}"</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-center gap-8 text-[10px] font-black text-white/20 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-white/40">Enter</span>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-white/40">Esc</span>
                <span>Close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
