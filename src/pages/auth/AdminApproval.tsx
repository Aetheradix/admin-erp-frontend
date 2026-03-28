import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApproveAdminMutation } from '@/store/api/authApiSlice';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button } from '@/components/ui/primitives/Button';
import { ProgressSpinner } from 'primereact/progressspinner';

const AdminApproval = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [approveAdmin] = useApproveAdminMutation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const [message, setMessage] = useState('');

  useEffect(() => {
    const processApproval = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing approval token.');
        return;
      }

      try {
        const result = await approveAdmin(token).unwrap();
        setStatus('success');
        setMessage(result.message || 'Admin account has been activated successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.data?.message || 'Failed to approve admin account. The token may be expired.');
      }
    };

    processApproval();
  }, [token, approveAdmin]);

  return (
    <AuthLayout 
      title="Admin Activation"
      subtitle="SYSTEM PRIVILEGE VERIFICATION PROTOCOL"
    >
      <div className="text-center py-10 animate-in fade-in zoom-in duration-700">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
            <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">Verifying Token...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 mx-auto">
              <i className="pi pi-shield text-4xl" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Access Granted</h2>
              <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto italic font-bold">
                {message}
              </p>
            </div>
            <Button 
              onClick={() => navigate('/auth/login')}
              variant="primary" 
              className="w-full h-14 rounded-2xl! shadow-lg shadow-emerald-500/20 font-black tracking-widest text-sm"
            >
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
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Verification Failed</h2>
              <p className="text-rose-400 text-sm leading-relaxed max-w-xs mx-auto italic font-bold">
                {message}
              </p>
            </div>
            <Button 
              onClick={() => navigate('/auth/login')}
              variant="ghost" 
              className="text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5 px-8 h-12 rounded-xl"
            >
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default AdminApproval;
