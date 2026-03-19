import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-24 w-full flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 z-20">
      <div className="flex items-center gap-4 w-full">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Search Input */}
        <div className="relative group w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search projects, tasks, or users..."
            className="w-full bg-[#1b212f] border border-white/5 rounded-full pl-12 pr-6 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-auto">
        {/* Invite Button */}
        <button className="hidden sm:flex items-center gap-2 bg-[#1b212f] hover:bg-white/10 text-white px-5 py-2.5 rounded-full border border-white/5 transition-all duration-300 text-sm font-medium">
          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">+</span>
          Invite user
        </button>

        {/* Notifications */}
        <button className="relative p-3 rounded-full bg-[#1b212f] border border-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors duration-300">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        </button>

        {/* User Profile */}
        <div className="h-10 w-10 shrink-0 rounded-full border-2 border-white/10 overflow-hidden cursor-pointer hover:border-primary transition-colors duration-300">
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b9ff66"
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
