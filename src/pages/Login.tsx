import { Form, Checkbox } from 'antd';
import { Mail, Lock, FileText, Image, Calendar, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useState } from 'react';

const Login: React.FC = () => {
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');
  const { handleLogin, handleRequestOTP, handleOTPLogin } = useAuthActions();

  const [form] = Form.useForm();

  const handleSendOTP = async () => {
    const email = form.getFieldValue('email');
    if (!email) return;
    const success = await handleRequestOTP(email);
    if (success) {
      setOtpSent(true);
      setEmailForOtp(email);
    }
  };

  const leftPanelContent = (
    <>
      <AuthCard 
        icon={FileText} 
        title="Blog Management" 
        description="Create, edit, and publish engaging content"
        className="-ml-8 -rotate-1 hover:rotate-0"
      >
        <div className="bg-black/40 rounded-xl overflow-hidden h-28 border border-white/5">
          <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-40 hover:opacity-60 transition-opacity" alt="Blog" />
        </div>
      </AuthCard>

      <AuthCard 
        icon={Image} 
        title="Gallery Organization" 
        description="Manage and showcase your visual content"
        className="translate-x-4 hover:translate-x-2"
      >
        <div className="grid grid-cols-3 gap-2 h-20">
          <img src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=2070" className="bg-black/40 rounded-lg overflow-hidden border border-white/5 w-full h-full object-cover opacity-40" alt="G1" />
          <img src="https://images.unsplash.com/photo-1682687982501-1e58f8111222?auto=format&fit=crop&q=80&w=2070" className="bg-black/40 rounded-lg overflow-hidden border border-white/5 w-full h-full object-cover opacity-40" alt="G2" />
          <img src="https://images.unsplash.com/photo-1682687220199-d0124f48f95b?auto=format&fit=crop&q=80&w=2070" className="bg-black/40 rounded-lg overflow-hidden border border-white/5 w-full h-full object-cover opacity-40" alt="G3" />
        </div>
      </AuthCard>

      <AuthCard 
        icon={Calendar} 
        title="Event Planning" 
        description="Schedule and coordinate events with ease"
        className="ml-6 rotate-1 hover:rotate-0"
      >
        <div className="bg-black/40 rounded-xl overflow-hidden h-28 border border-white/5">
          <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover opacity-40" alt="Event" />
        </div>
      </AuthCard>
    </>
  );

  return (
    <AuthLayout 
      title={isOtpMode ? "Security Verification" : "Welcome Back"} 
      subtitle={isOtpMode ? "Enter the 6-digit code sent to your email" : "Sign in to manage your content"}
      leftPanelContent={leftPanelContent}
    >
      <Form 
        form={form}
        layout="vertical" 
        onFinish={isOtpMode ? handleOTPLogin : handleLogin} 
        initialValues={{ remember: true }} 
        requiredMark={false}
      >
        <FormInput 
          name="email" 
          label="Email address" 
          placeholder="Enter your email" 
          icon={Mail}
          disabled={otpSent && isOtpMode}
          rules={[{ required: true, type: 'email', message: 'Valid email required' }]}
        />
        
        {!isOtpMode ? (
          <>
            <FormInput 
              name="password" 
              label="Password" 
              placeholder="Enter your password" 
              type="password"
              icon={Lock}
              rules={[{ required: true, message: 'Password required' }]}
            />

            <div className="flex items-center justify-between mb-8 mt-2 px-1">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-400 text-sm font-medium">Remember me</Checkbox>
              </Form.Item>
              <button 
                type="button"
                onClick={() => setIsOtpMode(true)}
                className="text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors bg-transparent border-none cursor-pointer"
              >
                Login with OTP?
              </button>
            </div>

            <Form.Item className="mb-6">
              <PrimaryButton htmlType="submit">Sign In</PrimaryButton>
            </Form.Item>
          </>
        ) : (
          <>
            {otpSent && (
              <>
                <FormInput 
                  name="otp" 
                  label="One-Time Password" 
                  placeholder="Enter 6-digit code" 
                  icon={ShieldCheck}
                  rules={[{ required: true, len: 6, message: '6-digit OTP required' }]}
                />
                <p className="text-gray-500 text-xs -mt-4 mb-4 px-1">
                  Sent to <span className="text-cyan-400">{emailForOtp}</span>
                </p>
              </>
            )}

            <div className="flex flex-col gap-4 mb-6 mt-4">
              {!otpSent ? (
                <PrimaryButton onClick={handleSendOTP}>
                   Request Security Code
                </PrimaryButton>
              ) : (
                <PrimaryButton htmlType="submit">
                   Verify & Access System
                </PrimaryButton>
              )}
              
              <button 
                type="button" 
                onClick={() => { setIsOtpMode(false); setOtpSent(false); }}
                className="flex items-center justify-center text-gray-500 hover:text-white transition-colors text-sm font-bold gap-2"
              >
                <ArrowLeft size={14} /> Back to Password Login
              </button>
            </div>
          </>
        )}
      </Form>


      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-white/5"></div>
        <span className="px-4 text-xs font-bold text-gray-600 tracking-widest uppercase">OR</span>
        <div className="flex-1 border-t border-white/5"></div>
      </div>

      <PrimaryButton className="bg-[#0f172a]! text-gray-300! border border-white/10 hover:bg-[#1e293b]! mb-8" icon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-4 h-4 mr-2" />}>
        Continue with Google
      </PrimaryButton>

      <div className="text-center">
        <p className="text-gray-400 text-sm font-medium">
          Don't have an account? 
          <Link to="/signup" className="text-cyan-400 font-bold ml-1.5 hover:text-cyan-300 transition-colors">Sign up</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
