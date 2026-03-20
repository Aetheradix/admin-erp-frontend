import { message } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRegisterMutation } from '@/store/api/authApiSlice';

export const useAuthActions = () => {
  const { login } = useAuth();
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

      message.success({ content: result.message || 'Account established successfully.', key: 'reg' });
      navigate('/login');
    } catch (error: any) {
      message.error({ content: error.data?.message || 'Registration failure. System halted.', key: 'reg' });
    }
  };

  return {
    handleLogin,
    handleSignUp
  };
};
