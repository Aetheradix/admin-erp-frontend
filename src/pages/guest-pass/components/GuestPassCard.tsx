import { User, Key, Share2, ShieldCheck, QrCode } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { GuestPass } from '../hooks/mockGuestPass';

interface GuestPassCardProps {
  pass: GuestPass;
}

export function GuestPassCard({ pass }: GuestPassCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success border-success/30';
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'Expired':
        return 'bg-error/10 text-error border-error/30';
      default:
        return 'bg-muted/10 text-muted';
    }
  };

  return (
    <div className="group relative bg-white rounded-[40px] border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col">
      {/* Pass Header - "AX Entry Authorization" */}
      <div className="p-8 pb-4 flex items-center justify-between border-b border-dashed border-border-strong bg-surface-subtle/30">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
            Access Authorization
          </span>
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
            Vistor Pass
          </h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
          <Key size={24} />
        </div>
      </div>

      {/* Main Pass Content */}
      <div className="p-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">
              Guest Identity
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                {pass.guestName}
              </h4>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">
              Access Code
            </span>
            <span className="text-sm font-black text-primary font-mono bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/20">
              {pass.accessCode}
            </span>
          </div>
        </div>

        {/* QR Code Placeholder (Visual Element) */}
        <div className="flex items-center gap-6 p-6 rounded-3xl bg-surface-subtle/50 border border-border-subtle relative group/qr">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-muted/30 group-hover/qr:text-primary/50 transition-colors duration-500 border border-border-subtle shadow-inner shadow-soft">
            <QrCode size={48} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-muted uppercase tracking-tighter">
                Valid Range
              </span>
              <span className="text-xs font-bold text-foreground">{pass.visitDate}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-muted uppercase tracking-tighter">
                Host Employee
              </span>
              <span className="text-xs font-bold text-primary">{pass.hostName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border',
              getStatusStyles(pass.status)
            )}
          >
            <ShieldCheck size={14} />
            <span>{pass.status}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 rounded-3xl bg-surface-subtle hover:bg-primary/5 hover:text-primary flex items-center justify-center transition-all border border-transparent hover:border-primary/20"
              aria-label="Share guest pass"
            >
              <Share2 size={16} />
            </button>
            <button
              className="px-6 h-10 rounded-3xl bg-foreground text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
              aria-label="Manage guest pass settings"
            >
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Security Decorative Footer */}
      <div className="h-2 bg-gradient-to-r from-primary/50 via-info/50 to-primary/50" />
    </div>
  );
}
