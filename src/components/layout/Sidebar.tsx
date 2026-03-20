import { Calendar, LayoutDashboard, Settings, Ticket, Users, Briefcase, X, FileText, Image as ImageIcon, LogOut, User as UserIcon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'Blogs', path: '/blogs' },
  { icon: ImageIcon, label: 'Gallery', path: '/gallery' },
  { icon: Ticket, label: 'Events', path: '/events' },
  { icon: Briefcase, label: 'Careers', path: '/careers' },
  { icon: Users, label: 'Admin Panel', path: '/users', role: 'admin' },
  { icon: UserIcon, label: 'Profile', path: '/profile' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const filteredNavItems = navItems.filter(item => 
    !item.role || item.role === user?.role
  );

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 h-full bg-[#161a23] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${
      isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
    }`}>
      {/* Mobile Close Button */}
      <button 
        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white lg:hidden"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      {/* Logo Area */}
      <div className={`h-20 flex items-center ${isOpen ? 'justify-start px-8' : 'justify-center'} border-b border-white/5 transition-all duration-300`}>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-primary flex items-center justify-center text-black font-black text-xl">
          T
        </div>
        {isOpen && (
          <span className="ml-4 text-xl font-bold tracking-tight text-white whitespace-nowrap">
            TaskTrail
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto mt-4">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center ${isOpen ? 'justify-start gap-4 px-4' : 'justify-center px-0'} py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                )}
                <item.icon
                  size={20}
                  className={`shrink-0 transition-colors duration-300 relative z-10 ${
                    isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-100'
                  }`}
                />
                {isOpen && (
                  <span className={`whitespace-nowrap relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-primary font-semibold tracking-wide' : 'text-slate-400 font-medium tracking-wide group-hover:text-slate-100'
                  }`}>
                    {item.label}
                  </span>
                )}
                
                {/* Subtle active background glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 pointer-events-none" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile / Logout action */}
      <div className={`p-4 border-t border-white/5 ${isOpen ? 'px-6' : 'px-2'}`}>
        <button 
          onClick={handleLogout}
          className={`flex items-center ${isOpen ? 'justify-start gap-4 px-4' : 'justify-center px-0'} py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-300 group`}
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span className="font-medium ml-4">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
