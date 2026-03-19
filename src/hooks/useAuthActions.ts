import { message } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuthActions = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (values: any) => {
    try {
      await login(values);
      message.success('System Access Granted. Welcome, Admin');
      navigate(from, { replace: true });
    } catch (error) {
      message.error('Authentication Error. Check your credentials.');
    }
  };

  const handleSignUp = async (_values: any) => {
    try {
      message.loading({ content: 'Initializing Corporate Metadata...', key: 'reg' });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success({ content: 'Node Established Successfully', key: 'reg' });
      navigate('/login');
    } catch (error) {
      message.error({ content: 'System Internal Error. Initialization Halted.', key: 'reg' });
    }
  };

  return {
    handleLogin,
    handleSignUp
  };
};
