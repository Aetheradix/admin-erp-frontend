import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { FormField } from '@/components/ui/composed/FormField';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import {
  useLoginMutation,
  useRequestOTPMutation,
  useLoginWithOTPMutation,
} from '@/store/api/authApiSlice';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [, { isLoading: isPasswordLoading }] = useLoginMutation();
  const [requestOTP, { isLoading: isOtpRequestLoading }] = useRequestOTPMutation();
  const [loginWithOTP, { isLoading: isOtpLoginLoading }] = useLoginWithOTPMutation();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Email is required',
        life: 3000,
      });
      return;
    }

    if (!emailRegex.test(email)) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email address',
        life: 3000,
      });
      return;
    }

    if (!password.trim()) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Password is required',
        life: 3000,
      });
      return;
    }

    try {
      await authLogin({ email, password });
      navigate('/');
    } catch (err: unknown) {
      console.error('Login failed', err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: (err as { data?: { message?: string } }).data?.message || 'Login failed',
        life: 3000,
      });
    }
  };

  const handleRequestOTP = async () => {
    try {
      await requestOTP({ email }).unwrap();
      setOtpSent(true);
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'OTP sent to your email!',
        life: 3000,
      });
    } catch (err: unknown) {
      console.error('OTP Request failed', err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: (err as { data?: { message?: string } }).data?.message || 'Failed to send OTP',
        life: 3000,
      });
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginWithOTP({ email, otp }).unwrap();
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = '/';
      }
    } catch (err: unknown) {
      console.error('OTP Login failed', err);
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || 'Invalid OTP or login failed';
      showToast({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
    }
  };

  return (
    <AuthLayout
      title={loginMode === 'password' ? 'Welcome back' : 'Login with OTP'}
      subtitle={
        loginMode === 'password'
          ? 'PLEASE ENTER YOUR CREDENTIALS TO ACCESS YOUR WORKSPACE.'
          : "WE'LL SEND A SECURE CODE TO YOUR REGISTERED EMAIL."
      }
    >
      <div className="flex bg-surface-subtle p-1 rounded-2xl mb-8 border border-border-subtle">
        <button
          onClick={() => setLoginMode('password')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${loginMode === 'password'
              ? 'bg-background shadow-sm text-primary border border-border-subtle'
              : 'text-muted hover:text-foreground'
            }`}
        >
          PASSWORD
        </button>
        <button
          onClick={() => setLoginMode('otp')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${loginMode === 'otp'
              ? 'bg-background shadow-sm text-primary border border-border-subtle'
              : 'text-muted hover:text-foreground'
            }`}
        >
          SECURE OTP
        </button>
      </div>

      {loginMode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-6">
          <FormField label="Work Email" required>
            <Input
              type="email"
              placeholder="e.g. agimonopoly@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl!"
            />
          </FormField>

          <FormField label="Password" required>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 !rounded-2xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </FormField>

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              title="Forgot Password"
              className="text-xs font-black text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-widest text-sm"
            loading={isPasswordLoading}
          >
            GET STARTED
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpLogin} className="space-y-6">
          <FormField label="Work Email" required>
            <div className="relative">
              <Input
                type="email"
                placeholder="e.g. agimonopoly@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl! pr-32"
                disabled={otpSent}
              />
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={!email || isOtpRequestLoading}
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-primary text-white text-[10px] font-black tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {isOtpRequestLoading ? 'SENDING...' : 'SEND CODE'}
                </button>
              )}
            </div>
          </FormField>

          {otpSent && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <FormField label="Enter 6-digit OTP" required>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-14 rounded-2xl! text-center text-2xl font-black tracking-[0.5em]"
                />
              </FormField>
            </motion.div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-widest text-sm"
            disabled={!otpSent || !otp}
            loading={isOtpLoginLoading}
          >
            VERIFY & LOGIN
          </Button>

          {otpSent && (
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
              }}
              className="w-full text-center text-xs font-black text-muted hover:text-primary transition-colors"
            >
              Didn't receive code? Try again
            </button>
          )}
        </form>
      )}

      <div className="mt-10 pt-10 border-t border-border-subtle text-center">
        <p className="text-sm text-muted font-medium">
          New to AetherERP?{' '}
          <Link to="/signup" className="text-primary font-black hover:underline">
            Get Beta Access
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
