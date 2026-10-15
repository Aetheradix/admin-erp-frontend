import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/primitives/Button';
import { useAuth } from '@/hooks/useAuth';

export const Forbidden403Page = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-card/80 backdrop-blur-xl border border-destructive/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        {/* Status Code & Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5" /> 403 Forbidden
        </div>

        <h1 className="text-2xl font-black text-foreground tracking-tight mb-2">
          Access Restricted
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Your current roles do not have authorization to access this module or perform this action.
          If you believe this is an error, please reach out to your organization administrator.
        </p>

        {/* User Identity Info */}
        {user && (
          <div className="mb-6 p-3 rounded-xl bg-muted/50 border border-border/50 text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account:</span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Roles:</span>
              <span className="font-semibold text-primary">
                {roles && roles.length > 0 ? roles.join(', ') : user.role || 'Employee'}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex-1 gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} className="flex-1 gap-2">
            <Home className="w-4 h-4" /> Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Forbidden403Page;
