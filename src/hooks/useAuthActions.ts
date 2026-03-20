import { message } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRegisterMutation } from '@/store/api/authApiSlice';

export const useAuthActions = () => {
  const { login, loginWithOTP, requestOTP } = useAuth();
  const [registerMutation] = useRegisterMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (values: any) => {
    try {
      const result = await login(values);
      message.success(result.message || 'System Access Granted. Welcome back.');
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.data?.message || 'Authentication Error. Please verify your credentials.');
    }
  };

  const handleSignUp = async (values: any) => {
    try {
      const result = await registerMutation(values).unwrap();
      message.success(result.message || 'Account established successfully.');
      navigate('/login');
    } catch (error: any) {
      message.error(error.data?.message || 'Registration failure.');
    }
  };

  const handleRequestOTP = async (email: string) => {
    try {
      const result = await requestOTP(email);
      message.success(result.message || 'OTP sent to your registered email.');
      return true;
    } catch (error: any) {
      message.error(error.data?.message || 'Failed to request OTP.');
      return false;
    }
  };

  const handleOTPLogin = async (values: { email: string, otp: string }) => {
    try {
      const result = await loginWithOTP(values);
      message.success(result.message || 'OTP Verified. Welcome back.');
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.data?.message || 'Invalid or expired OTP.');
    }
  };

  return {
    handleLogin,
    handleSignUp,
    handleRequestOTP,
    handleOTPLogin
  };
};
