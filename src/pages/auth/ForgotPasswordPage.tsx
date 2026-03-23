import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const navigate = useNavigate();
  const [requestOTP, { isLoading: isOtpRequestLoading }] = useRequestOTPMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestOTP({ email }).unwrap();
      setStep(2);
    } catch (err) {
      console.error('OTP Request failed', err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
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
      title={step === 1 ? "Forgot Password" : "Reset Password"}
      subtitle={step === 1 ? "ENTER YOUR EMAIL TO RECEIVE A SECURITY RESET CODE." : "ENTER THE CODE SENT TO YOUR EMAIL AND YOUR NEW PASSWORD."}
    >
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleRequestOTP}
            className="space-y-6"
          >
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
              className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-widest text-sm"
              loading={isOtpRequestLoading}
            >
              SEND RESET CODE
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleResetPassword}
            className="space-y-6"
          >
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
              loading={isResetLoading}
            >
              RESET PASSWORD
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-10 pt-10 border-t border-border-subtle text-center">
        <Link to="/auth/login" className="text-muted font-black text-xs uppercase tracking-widest hover:text-primary transition-colors">
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
