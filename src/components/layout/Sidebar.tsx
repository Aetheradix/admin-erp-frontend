import { Calendar, LayoutDashboard, Settings, Ticket, Users, Briefcase, X, FileText, Image as ImageIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'Blogs', path: '/blogs' },
  { icon: ImageIcon, label: 'Gallery', path: '/gallery' },
  { icon: Ticket, label: 'Events', path: '/events' },
  { icon: Briefcase, label: 'Careers', path: '/careers' },
  { icon: Users, label: 'Staff', path: '/users' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-full bg-[#161a23] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 xl:w-64'
    }`}>
      {/* Mobile Close Button */}
      <button 
        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white lg:hidden"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-black text-xl">
          T
        </div>
        <span className="hidden lg:block ml-4 text-xl font-bold tracking-tight text-white">
          TaskTrail
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                ? 'bg-primary text-black font-semibold'
                : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`transition-colors ${isActive ? 'text-black' : 'text-white/50 group-hover:text-primary'}`}
                />
                <span className="hidden lg:block whitespace-nowrap">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile / Logout action could go here */}
    </aside>
  );
}
