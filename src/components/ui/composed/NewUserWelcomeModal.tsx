import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileCheck,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  X,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NewUserWelcomeModalProps {
  visible: boolean;
  userName: string;
  userEmail?: string;
  userRole?: string;
  department?: string;
  onClose: () => void;
}

export function NewUserWelcomeModal({
  visible,
  userName,
  userEmail,
  userRole = 'Employee',
  department = 'General',
  onClose,
}: NewUserWelcomeModalProps) {
  const navigate = useNavigate();

  if (!visible) return null;

  const handleCompleteProfile = () => {
    onClose();
    navigate('/profile-completion');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-border-subtle z-10">
          {/* Header Banner with celebratory gradient */}
          <div className="relative p-8 bg-gradient-to-br from-primary via-primary/95 to-primary-hover text-white overflow-hidden">
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-12 bottom-2 text-white/10 pointer-events-none">
              <Sparkles size={80} />
            </div>

            {/* Close X */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Close welcome modal">
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-black uppercase tracking-wider text-white">
                New Team Member Welcome
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Welcome, {userName}! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1.5 leading-relaxed max-w-md">
              Your account has been set up via invitation. Complete your employee profile to submit
              your identity documents, bank details, and activate your official credentials.
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-8 space-y-6">
            {/* User Invitation Details */}
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  User Name
                </span>
                <span className="font-bold text-foreground truncate block mt-0.5">{userName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Work Email
                </span>
                <span className="font-mono text-foreground truncate block mt-0.5">
                  {userEmail || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Assigned Role
                </span>
                <span className="font-bold text-primary block mt-0.5">{userRole}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Department
                </span>
                <span className="font-bold text-foreground block mt-0.5">{department}</span>
              </div>
            </div>

            {/* Quick Checklist of what's inside */}
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">
                Onboarding Requirements to Complete:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-border-subtle text-foreground/80">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span>Personal & Address</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-border-subtle text-foreground/80">
                  <CreditCard size={14} className="text-primary shrink-0" />
                  <span>Bank & Salary Account</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-border-subtle text-foreground/80">
                  <ShieldCheck size={14} className="text-primary shrink-0" />
                  <span>PAN & Aadhaar ID</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-border-subtle text-foreground/80">
                  <Briefcase size={14} className="text-primary shrink-0" />
                  <span>Experience & Degrees</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCompleteProfile}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-primary text-white font-black text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2">
                <FileCheck size={16} />
                <span>Complete Profile Now</span>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl border border-border-subtle bg-white text-muted hover:text-foreground text-xs font-bold transition-all">
                I'll Do This Later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
