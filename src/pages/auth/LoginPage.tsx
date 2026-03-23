import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { FormField } from '@/components/ui/composed/FormField';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { useLoginMutation, useRequestOTPMutation, useLoginWithOTPMutation } from '@/store/api/authApiSlice';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const LoginPage = () => {
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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //authLogin handles the actual mutation and state update
      await authLogin({ email, password });
      navigate('/');
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleRequestOTP = async () => {
    try {
      await requestOTP({ email }).unwrap();
      setOtpSent(true);
    } catch (err) {
      console.error('OTP Request failed', err);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginWithOTP({ email, otp }).unwrap();
      // Manual update since context login only takes credentials for password login currently
       if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.admin));
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('OTP Login failed', err);
    }
  };

  return (
    <AuthLayout 
      title={loginMode === 'password' ? "Welcome back" : "Login with OTP"}
      subtitle={loginMode === 'password' ? "PLEASE ENTER YOUR CREDENTIALS TO ACCESS YOUR WORKSPACE." : "WE'LL SEND A SECURE CODE TO YOUR REGISTERED EMAIL."}
    >
      <div className="flex bg-surface-subtle p-1 rounded-2xl mb-8">
        <button 
          onClick={() => setLoginMode('password')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${loginMode === 'password' ? 'bg-white shadow-soft text-primary' : 'text-muted hover:text-foreground'}`}
        >
          PASSWORD
        </button>
        <button 
          onClick={() => setLoginMode('otp')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${loginMode === 'otp' ? 'bg-white shadow-soft text-primary' : 'text-muted hover:text-foreground'}`}
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
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl!"
            />
          </FormField>

          <div className="flex items-center justify-between">
            <Link to="/auth/forgot-password" title="Forgot Password" className="text-xs font-black text-primary hover:underline">
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
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-black text-white text-[10px] font-black tracking-widest hover:bg-black/90 disabled:opacity-50 transition-all"
                >
                  {isOtpRequestLoading ? 'SENDING...' : 'SEND CODE'}
                </button>
              )}
            </div>
          </FormField>

          {otpSent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
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
              onClick={() => { setOtpSent(false); setOtp(''); }}
              className="w-full text-center text-xs font-black text-muted hover:text-primary transition-colors"
            >
              Didn't receive code? Try again
            </button>
          )}
        </form>
      )}

      <div className="mt-10 pt-10 border-t border-border-subtle text-center">
        <p className="text-sm text-muted font-medium">
          New to AetherERP? <Link to="/signup" className="text-primary font-black hover:underline">Get Beta Access</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
