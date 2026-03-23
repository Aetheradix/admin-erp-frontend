import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { FormField } from '@/components/ui/composed/FormField';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { useRegisterMutation } from '@/store/api/authApiSlice';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      await register({ username, email, password }).unwrap();
      navigate('/auth/login');
    } catch (err) {
      console.error('Signup failed', err);
    }
  };

  return (
    <AuthLayout 
      title="Get Beta Access"
      subtitle="JOIN THE NEXT GENERATION OF ENTERPRISE RESOURCE PLANNING."
    >
      <form onSubmit={handleSignup} className="space-y-6">
        <FormField label="Full Name" required>
          <Input 
            type="text" 
            placeholder="e.g. Ameer Ismail" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-14 rounded-2xl!"
          />
        </FormField>

        <FormField label="Work Email" required>
          <Input 
            type="email" 
            placeholder="e.g. agimonopoly@gmail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 rounded-2xl!"
          />
        </FormField>
        
        <FormField label="Create Password" required>
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 rounded-2xl!"
          />
        </FormField>

        <FormField label="Confirm Password" required>
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
          loading={isLoading}
        >
          JOIN THE WAITLIST
        </Button>
      </form>

      <div className="mt-10 pt-10 border-t border-border-subtle text-center">
        <p className="text-sm text-muted font-medium">
          Already a member? <Link to="/auth/login" className="text-primary font-black hover:underline">Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
