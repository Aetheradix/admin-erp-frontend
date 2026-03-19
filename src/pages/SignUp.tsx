import AuthCard from '@/components/auth/AuthCard';
import AuthLayout from '@/components/auth/AuthLayout';
import FormInput from '@/components/common/FormInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Form } from 'antd';
import { Calendar, FileText, Image } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignUp: React.FC = () => {
  const { handleSignUp } = useAuthActions();

  const leftPanelContent = (
    <>
      <AuthCard icon={FileText} title="Blog Management" description="Create, edit, and publish engaging content" className="-ml-8 -rotate-1 hover:rotate-0">
        <div className="bg-black/40 rounded-xl overflow-hidden h-28 border border-white/5">
          <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-40" alt="B" />
        </div>
      </AuthCard>
      <AuthCard icon={Image} title="Gallery Organization" description="Manage and showcase your visual content" className="translate-x-4 hover:translate-x-2">
        <div className="grid grid-cols-3 gap-2 h-20">
          <img src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=2070" className="bg-black/40 rounded-lg overflow-hidden border border-white/5 w-full h-full object-cover opacity-40 px-0.5" alt="G1" />
          <img src="https://images.unsplash.com/photo-1682687982501-1e58f8111222?auto=format&fit=crop&q=80&w=2070" className="bg-black/40 rounded-lg overflow-hidden border border-white/5 w-full h-full object-cover opacity-40" alt="G2" />
          <img src="https://images.unsplash.com/photo-1682687220199-d0124f48f95b?auto=format&fit=crop&q=80&w=2070" className="bg-black/40 rounded-lg overflow-hidden border border-white/5 w-full h-full object-cover opacity-40 px-0.5" alt="G3" />
        </div>
      </AuthCard>
      <AuthCard icon={Calendar} title="Event Planning" description="Schedule and coordinate events with ease" className="ml-6 rotate-1 hover:rotate-0">
        <div className="bg-black/40 rounded-xl overflow-hidden h-28 border border-white/5">
          <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover opacity-40" alt="E" />
        </div>
      </AuthCard>
    </>
  );

  return (
    <AuthLayout title="Create Account" subtitle="Join to manage your content effectively" leftPanelContent={leftPanelContent}>
      <Form layout="vertical" onFinish={handleSignUp} requiredMark={false}>
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="fullName" label="Full Name" placeholder="John Doe" rules={[{ required: true, message: 'Name required' }]} />
          <FormInput name="org" label="Organization" placeholder="Nexus Corp" rules={[{ required: true, message: 'Org required' }]} />
        </div>

        <FormInput 
          name="email" 
          label="Email address" 
          placeholder="Enter your email" 
          rules={[{ required: true, type: 'email', message: 'Valid email required' }]} 
        />
        
        <FormInput 
          name="password" 
          label="Password" 
          placeholder="Create a password" 
          type="password"
          rules={[{ required: true, message: 'Password required' }]} 
        />

        <Form.Item className="mt-8 mb-6">
          <PrimaryButton htmlType="submit">Sign Up</PrimaryButton>
        </Form.Item>
      </Form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-white/5"></div>
        <span className="px-4 text-xs font-bold text-gray-600 tracking-widest uppercase">OR</span>
        <div className="flex-1 border-t border-white/5"></div>
      </div>

      <PrimaryButton className="bg-[#0f172a]! text-gray-300! border border-white/10 hover:bg-[#1e293b]! mb-8" icon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-4 h-4 mr-2" />}>
        Sign up with Google
      </PrimaryButton>

      <div className="text-center">
        <p className="text-gray-400 text-sm font-medium">
          Already have an account? 
          <Link to="/login" className="text-cyan-400 font-bold ml-1.5 hover:text-cyan-300 transition-colors">Log In</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
