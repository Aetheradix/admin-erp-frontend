import { Bell, Menu, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/ui/composed/SearchBar';
import { Avatar } from '@/components/ui/primitives/Avatar';
import { Button } from '@/components/ui/primitives/Button';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-24 w-full flex items-center justify-between px-6 sm:px-8 lg:px-10 z-20 bg-background/80 backdrop-blur-md border-b border-border-subtle">
      <div className="flex items-center gap-4 w-full max-w-2xl">
        {/* Mobile & Desktop Menu Toggle */}
        <Button 
          onClick={onMenuClick}
          variant="secondary"
          className="p-2.5! rounded-pill! bg-surface-subtle! hover:bg-surface-elevated! transition-colors"
        >
          <Menu size={20} className="text-muted" />
        </Button>

        {/* Search Bar - Composed Component */}
        <div className="hidden md:block flex-1">
          <SearchBar 
            placeholder="Search features, documents, staff..."
            className="group-hover:border-primary! transition-all duration-300"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        <Button 
          variant="ghost"
          className="hidden sm:flex w-10! h-10! rounded-pill! bg-surface-subtle! border-border-subtle! hover:bg-surface-elevated! transition-all duration-150"
        >
          <Settings size={18} className="text-muted transition-transform hover:rotate-45" />
        </Button>
        
        {/* Notifications */}
        <Button 
          variant="ghost"
          className="relative w-10! h-10! rounded-pill! bg-surface-subtle! border-border-subtle! hover:bg-surface-elevated! transition-all duration-150 group"
        >
          <Bell size={18} className="text-muted group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-pill bg-primary ring-2 ring-white"></span>
        </Button>

        <div className="h-8 w-px bg-border-subtle mx-1 hidden sm:block"></div>

        {/* User Profile */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 pl-2 pr-1.5 py-1.5 rounded-pill border border-border-subtle bg-surface-subtle cursor-pointer hover:bg-surface-elevated hover:border-border-strong transition-all duration-300 shadow-sm"
        >
          <span className="hidden sm:block text-xs font-bold text-foreground ml-2">
            {user?.username || 'Admin User'}
          </span>
          <Avatar 
            image={user?.image_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.username || 'Felix'}`}
            className="w-8 h-8 rounded-pill border-2 border-white shadow-soft"
          />
        </div>
      </div>
    </header>
  );
}
