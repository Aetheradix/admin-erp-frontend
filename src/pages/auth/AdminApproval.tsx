import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePromoteToAdminMutation } from '@/store/api/authApiSlice';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Button } from '@/components/ui/primitives/Button';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';

const AdminApproval = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [approveAdmin] = usePromoteToAdminMutation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Validate token: Must exist and cannot be a plain sequential integer ID
  const isInvalidToken = !token || /^\d+$/.test(token.trim()) || token.trim().length < 16;

  const handleConfirmApproval = async () => {
    if (isInvalidToken) {
      setStatus('error');
      setMessage('Invalid or malformed approval token. Token must be a high-entropy security hash.');
      return;
    }

    setStatus('loading');
    try {
      const result = await approveAdmin(token.trim()).unwrap();
      setStatus('success');
      setMessage(result.message || 'Admin account has been activated successfully!');
      showToast({
        severity: 'success',
        summary: 'Activated',
        detail: result.message || 'Admin account activated!',
        life: 3000,
      });
    } catch (err: unknown) {
      setStatus('error');
      const errorMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message ||
            'Failed to approve admin account.'
          : 'Failed to approve admin account. The token may be invalid or expired.';
      setMessage(errorMessage);
      showToast({ severity: 'error', summary: 'Failed', detail: errorMessage, life: 3000 });
    }
  };

  return (
    <AuthLayout title="Admin Activation" subtitle="SYSTEM PRIVILEGE VERIFICATION PROTOCOL">
      <div className="text-center py-10 animate-in fade-in zoom-in duration-700">
        {status === 'idle' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
              <i className="pi pi-key text-3xl" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground">
                Authorize Administrator Privilege
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You have arrived via an administrator activation link. Please click below to confirm and activate system privileges.
              </p>
            </div>
            <Button
              onClick={handleConfirmApproval}
              variant="primary"
              disabled={isInvalidToken}
              className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-widest text-sm">
              CONFIRM & ACTIVATE ACCESS
            </Button>
            {isInvalidToken && (
              <p className="text-[11px] text-rose-500 font-bold">
                Invalid or missing secure token parameter.
              </p>
            )}
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
            <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">
              Verifying Token...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 mx-auto">
              <i className="pi pi-shield text-4xl" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Access Granted
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto italic font-bold">
                {message}
              </p>
            </div>
            <Button
              onClick={() => navigate('/auth/login')}
              variant="primary"
              className="w-full h-14 rounded-2xl! shadow-lg shadow-emerald-500/20 font-black tracking-widest text-sm">
              GO TO LOGIN
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-8">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto">
              <i className="pi pi-times-circle text-4xl" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Verification Failed
              </h2>
              <p className="text-rose-400 text-sm leading-relaxed max-w-xs mx-auto italic font-bold">
                {message}
              </p>
            </div>
            <Button
              onClick={() => navigate('/auth/login')}
              variant="ghost"
              className="text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5 px-8 h-12 rounded-xl">
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default AdminApproval;
