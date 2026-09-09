import { Button } from '@/components/ui/primitives/Button';
import { Badge } from '@/components/ui/primitives/Badge';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Printer,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import type { EventPassData } from '@/store/api/eventSlice';

interface EventPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  passData: EventPassData | null;
}

export const EventPassModal = ({ isOpen, onClose, passData }: EventPassModalProps) => {
  if (!isOpen || !passData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="relative p-6 bg-linear-to-r from-primary/20 via-orange-500/10 to-amber-500/20 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Ticket size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-primary">
                  Official Entry Pass
                </span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Verified
                </span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">VIP Access Ticket</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ticket Content */}
        <div className="p-6 flex flex-col gap-6 print:p-0">
          {/* Welcome User Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                Issued To Participant
              </span>
              <span className="text-lg font-black text-white">{passData.username}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-xl">
              <Sparkles size={12} /> VIP Participant
            </div>
          </div>

          {/* Ticket Card Container */}
          <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-dashed border-primary/40 rounded-3xl p-6 shadow-inner flex flex-col gap-4">
            {/* Corner Decorative Badges */}
            <div className="flex items-center justify-between">
              <Badge variant="primary" className="uppercase font-black text-[10px] tracking-wider">
                {passData.category || 'General Event'}
              </Badge>
              <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">
                AETHER-ERP EVENTS
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white leading-tight">
                {passData.eventTitle}
              </h3>
            </div>

            {/* Event Info Details */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Calendar size={14} className="text-primary flex-shrink-0" />
                <span className="truncate">{passData.eventDate}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Clock size={14} className="text-primary flex-shrink-0" />
                <span className="truncate">{passData.time}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-xs font-bold text-zinc-300">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <span className="truncate">{passData.location}</span>
              </div>
            </div>

            {/* Pass ID Barcode & QR Box */}
            <div className="mt-2 p-4 rounded-2xl bg-black/60 border border-primary/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                  PASS CODE ID
                </span>
                <span className="text-xl font-mono font-black text-white tracking-widest">
                  {passData.passCode}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 block mt-0.5">
                  Present code or email pass at venue threshold
                </span>
              </div>
              <div className="w-14 h-14 bg-white rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 shadow-lg">
                <QrCode size={40} className="text-zinc-950" />
              </div>
            </div>
          </div>

          {/* Email Notification Note */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-white/5 p-3 rounded-xl border border-white/5">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
            <span>
              A digital copy of this entry pass has been emailed to{' '}
              <strong className="text-white">{passData.recipientEmail}</strong>.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 h-11 rounded-2xl gap-2 font-bold text-xs uppercase tracking-wider border-white/20 hover:bg-white/10"
            >
              <Printer size={14} /> Print Pass
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
              className="flex-1 h-11 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg"
            >
              Done & Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
