import { AuthLayout } from '@/components/layouts/AuthLayout';
import { FormField } from '@/components/ui/composed/FormField';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { useGetDepartmentsQuery, useRegisterMutation } from '@/store/api/authApiSlice';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const { data: departmentsData, isLoading: isLoadingDepts } = useGetDepartmentsQuery({});

  const deptOptions = (departmentsData as { data?: { department_name: string }[] })?.data?.map(
    (dep) => ({ label: dep.department_name, value: dep.department_name })
  );

  useEffect(() => {
    if (Array.isArray(deptOptions) && deptOptions.length > 0 && !department) {
      const firstDept = deptOptions[0];
      if (firstDept) {
        queueMicrotask(() => {
          setDepartment(firstDept.value);
        });
      }
    }
  }, [deptOptions, department]);

  const getPasswordScore = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };
  const passwordScore = getPasswordScore(password);

  const passwordStrength = (() => {
    if (!password) return null;
    if (passwordScore <= 2) return { label: 'Weak', color: 'text-red-500' };
    if (passwordScore === 3 || passwordScore === 4)
      return { label: 'Medium', color: 'text-yellow-500' };
    return { label: 'Strong', color: 'text-green-600' };
  })();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[4-9]\d{9}$/;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Full name is required',
        life: 3000,
      });
      return;
    }

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

    if (!contactNumber.trim()) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Contact number is required',
        life: 3000,
      });
      return;
    }

    if (!phoneRegex.test(contactNumber)) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Enter a valid 10-digit mobile number',
        life: 3000,
      });
      return;
    }

    if (password.length < 8) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Password must be at least 8 characters long',
        life: 3000,
      });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Password must contain at least one uppercase letter',
        life: 3000,
      });
      return;
    }

    if (!/[a-z]/.test(password)) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Password must contain at least one lowercase letter',
        life: 3000,
      });
      return;
    }

    if (!/[0-9]/.test(password)) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Password must contain at least one number',
        life: 3000,
      });
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Password must contain at least one special character',
        life: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: "Passwords don't match",
        life: 3000,
      });
      return;
    }

    try {
      await register({
        username,
        email,
        password,
        contact_number: contactNumber,
        department: department || 'Engineering',
      }).unwrap();

      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: error.data?.message || 'Signup failed',
        life: 3000,
      });

      console.error('Signup failed', err);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Account Created" subtitle="YOUR SECURE WORKSPACE IS NOW READY FOR USE.">
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 py-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <i className="pi pi-check-circle text-4xl" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              Welcome Aboard!
            </h2>
            <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto font-medium">
              Your employee account has been successfully registered. You can now sign in to access
              your ERP workspace.
            </p>
          </div>
          <Button
            onClick={() => navigate('/auth/login')}
            variant="primary"
            className="w-full h-14 rounded-2xl! shadow-lg shadow-emerald-500/20 font-black tracking-widest text-sm"
          >
            GO TO LOGIN
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="ENTER YOUR DETAILS TO REGISTER ON AETHERERP WORKSPACE."
    >
      <form onSubmit={handleSignup} className="space-y-5">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Contact Number" required>
            <Input
              type="text"
              placeholder="e.g. 9876543210"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="h-14 rounded-2xl!"
            />
          </FormField>

          <FormField label="Department">
            <Select
              value={department}
              options={deptOptions}
              onChange={(e) => setDepartment(e.value)}
              placeholder={isLoadingDepts ? 'Loading...' : 'Select Department'}
              className="h-14 rounded-2xl!"
              loading={isLoadingDepts}
            />
          </FormField>
        </div>

        <FormField label="Create Password" required>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl! pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          {password && passwordStrength && (
            <p className={`text-xs mt-2 font-semibold ${passwordStrength.color}`}>
              Password strength: {passwordStrength.label}
            </p>
          )}
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
          className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-widest text-sm mt-2"
          loading={isRegistering}
        >
          CREATE ACCOUNT
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border-subtle text-center">
        <p className="text-sm text-muted font-medium">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-black hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
