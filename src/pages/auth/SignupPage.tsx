import { AuthLayout } from '@/components/layouts/AuthLayout';
import { FormField } from '@/components/ui/composed/FormField';
import { showToast } from '@/components/ui/composed/Toast';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { useGetDepartmentsQuery, useRegisterMutation } from '@/store/api/authApiSlice';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const { data: departmentsData, isLoading: isLoadingDepts } = useGetDepartmentsQuery({});

  console.log('Departments Data:', departmentsData);

  const deptOptions = departmentsData?.data?.map((dep: any) => dep.department_name);

  useEffect(() => {
    if (deptOptions.length > 0 && !department) {
      setDepartment(deptOptions[0].value);
    }
  }, [deptOptions, department]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast({ severity: 'error', summary: 'Error', detail: "Passwords don't match", life: 3000 });
      return;
    }
    try {
      await register({
        username,
        email,
        password,
        contact_number: contactNumber,
        department: department || 'Engineering'
      }).unwrap();
      setIsSuccess(true);
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Signup failed', life: 3000 });
      console.error('Signup failed', err);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Account Created"
        subtitle="YOUR SECURE WORKSPACE IS NOW READY FOR USE."
      >
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <i className="pi pi-check-circle text-4xl" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Welcome Aboard!</h2>
            <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto italic font-bold">
              Your employee account has been successfully activated. You can now log in to access your ERP dashboard and tools.
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
      title="Get Beta Access"
      subtitle="JOIN THE NEXT GENERATION OF ENTERPRISE RESOURCE PLANNING."
    >
      <form onSubmit={handleSignup} className="space-y-6">
        <FormField label="Full Name" required>
          <Input
            type="text"
            placeholder="e.g. Ameer Ismail"
            value={username}
            onChange={(e: any) => setUsername(e.target.value)}
            className="h-14 rounded-2xl!"
          />
        </FormField>

        <FormField label="Work Email" required>
          <Input
            type="email"
            placeholder="e.g. agimonopoly@gmail.com"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            className="h-14 rounded-2xl!"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
          <FormField label="Contact Number">
            <Input
              type="text"
              placeholder="e.g. +91 9876543210"
              value={contactNumber}
              onChange={(e: any) => setContactNumber(e.target.value)}
              className="h-14 rounded-2xl!"
            />
          </FormField>

          <FormField label="Department">
            <Select
              value={department}
              options={deptOptions}
              onChange={(e) => setDepartment(e.value)}
              placeholder={isLoadingDepts ? "Loading..." : "Select Department"}
              className="h-14 rounded-2xl!"
              loading={isLoadingDepts}
            />
          </FormField>
        </div>

        <FormField label="Create Password" required>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            className="h-14 rounded-2xl!"
          />
        </FormField>

        <FormField label="Confirm Password" required>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e: any) => setConfirmPassword(e.target.value)}
            className="h-14 rounded-2xl!"
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-widest text-sm"
          loading={isRegistering}
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
