import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { FormField } from '@/components/ui/composed/FormField';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { useRequestOTPMutation, useResetPasswordMutation } from '@/store/api/authApiSlice';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const [requestOTP, { isLoading: isOtpRequestLoading }] = useRequestOTPMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldown > 0) {
      showToast({
        severity: 'warn',
        summary: 'Rate Limit Active',
        detail: `Please wait ${cooldown} seconds before requesting another code.`,
        life: 3000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast({
        severity: 'error',
        summary: 'Invalid Email',
        detail: 'Please enter a valid work email address.',
        life: 3000,
      });
      return;
    }

    try {
      await requestOTP({ email: email.trim() }).unwrap();
      setCooldown(60);
      setStep(2);
      showToast({
        severity: 'info',
        summary: 'Code Dispatched',
        detail: 'If this email belongs to an account, a verification code has been sent.',
        life: 4000,
      });
    } catch (err) {
      console.error('OTP Request failed', err);
      showToast({
        severity: 'error',
        summary: 'Request Failed',
        detail: 'Unable to dispatch code. Please try again later.',
        life: 3000,
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: "Passwords don't match",
        life: 3000,
      });
      return;
    }
    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      navigate('/auth/login');
    } catch (err) {
      console.error('Password reset failed', err);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Forgot Password' : 'Reset Password'}
      subtitle={
        step === 1
          ? 'ENTER YOUR EMAIL TO RECEIVE A SECURITY RESET CODE.'
          : 'ENTER THE CODE SENT TO YOUR EMAIL AND YOUR NEW PASSWORD.'
      }>
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleRequestOTP}
            className="space-y-6">
            <FormField label="Work Email" required>
              <Input
                type="email"
                placeholder="e.g. agimonopoly@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl!"
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-widest text-sm disabled:opacity-60"
              disabled={cooldown > 0}
              loading={isOtpRequestLoading}>
              {cooldown > 0 ? `WAIT ${cooldown}s TO RESEND` : 'SEND RESET CODE'}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleResetPassword}
            className="space-y-6">
            <FormField label="Enter 6-digit Code" required>
              <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-14 rounded-2xl! text-center text-2xl font-black tracking-[0.5em]"
              />
            </FormField>

            <FormField label="New Password" required>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-14 rounded-2xl!"
              />
            </FormField>

            <FormField label="Confirm New Password" required>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 rounded-2xl!"
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-widest text-sm"
              loading={isResetLoading}>
              RESET PASSWORD
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-10 pt-10 border-t border-border-subtle text-center">
        <Link
          to="/auth/login"
          className="text-muted font-black text-xs uppercase tracking-widest hover:text-primary transition-colors">
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
