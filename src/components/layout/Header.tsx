import { Bell, Menu, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/ui/composed/SearchBar';
import { Avatar } from '@/components/ui/primitives/Avatar';
import { Button } from '@/components/ui/primitives/Button';

interface HeaderProps {
  onMenuClick?: () => void;
  onCopilotClick?: () => void;
}

export default function Header({ onMenuClick, onCopilotClick }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-24 w-full flex items-center justify-between px-6 sm:px-8 lg:px-10 z-20 bg-background/80 backdrop-blur-md border-b border-border-subtle">
      <div className="flex items-center gap-4 w-full max-w-2xl">
        {/* Mobile & Desktop Menu Toggle */}
        <Button
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
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
        {/* Gemini AI Copilot Button */}
        <Button
          variant="ghost"
          onClick={onCopilotClick}
          aria-label="Gemini AI Copilot"
          title="Aether Copilot (Gemini AI)"
          className="w-13! h-13! rounded-pill! bg-primary/10! border-primary/20! hover:bg-primary/20! text-primary transition-all duration-150 relative group"
        >
          <Sparkles size={20} className="animate-pulse group-hover:scale-110 transition-transform" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          className="hidden sm:flex w-13! h-13! rounded-pill! bg-surface-subtle! border-border-subtle! hover:bg-surface-elevated! transition-all duration-150"
        >
          <Settings size={18} className="text-muted transition-transform hover:rotate-45" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          aria-label="Notifications"
          className="relative w-13! h-13! rounded-pill! bg-surface-subtle! border-border-subtle! hover:bg-surface-elevated! transition-all duration-150 group"
        >
          <Bell size={18} className="text-muted group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-pill bg-primary ring-2 ring-white"></span>
        </Button>

        <div className="h-10 w-px bg-border-subtle mx-1 hidden sm:block"></div>

        {/* User Profile */}
        <div
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
          aria-label="View user profile"
          className="flex items-center gap-3 pl-2 pr-1.5 py-1.5 rounded-pill border border-border-subtle bg-surface-subtle cursor-pointer hover:bg-surface-elevated hover:border-border-strong transition-all duration-300 shadow-sm"
        >
          <span className="hidden sm:block text-xs font-bold text-foreground ml-2">
            {user?.username || 'Admin User'}
          </span>
          <Avatar
            image={
              user?.image_url ||
              `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.username || 'Felix'}`
            }
            width={32}
            height={32}
            className="w-8 h-8 rounded-pill border-2 border-white shadow-soft"
          />
        </div>
      </div>
    </header>
  );
}
