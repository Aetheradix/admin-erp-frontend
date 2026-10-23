import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { FormField } from '@/components/ui/composed/FormField';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { showToast } from '@/components/ui/composed/Toast.utils';
import {
  useChangeTemporaryPasswordMutation,
  useCompleteOnboardingMutation,
} from '@/store/api/authApiSlice';
import { useAuth } from '@/hooks/useAuth';
import { recordAuditLog, acceptInvitation } from '@/services/auditService';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  X,
  UserCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

/** Determine the starting step from user's current onboarding_step */
function getInitialStep(user: { is_temporary_password?: boolean; is_onboarded?: boolean; onboarding_step?: number } | null): 1 | 2 {
  if (!user) return 1;
  const step = user.onboarding_step ?? 1;
  if (user.is_temporary_password || step === 1) return 1;
  return 2;
}

export default function PostLoginOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const initialStep = getInitialStep(user);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialStep);

  // --- Step 1: Change Temp Password ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Step 2: Complete Profile ---
  const [fullName, setFullName] = useState(user?.username || '');
  const [contactNo, setContactNo] = useState(user?.contact_number || '');
  const department = user?.department || 'Engineering';
  const designation = user?.designation || '';

  const [changeTemporaryPassword, { isLoading: isChangingPwd }] = useChangeTemporaryPasswordMutation();
  const [completeOnboarding, { isLoading: isCompletingOnboarding }] = useCompleteOnboardingMutation();

  // Password strength
  const passwordChecks = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    matches: newPassword.length > 0 && newPassword === confirmPassword,
  }), [newPassword, confirmPassword]);

  const strengthScore = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length - (passwordChecks.matches ? 0 : 0);
  }, [passwordChecks]);

  const isPasswordValid =
    passwordChecks.minLength &&
    passwordChecks.hasUpper &&
    passwordChecks.hasLower &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSpecial &&
    passwordChecks.matches;

  const isProfileValid =
    fullName.trim().length >= 2 &&
    contactNo.trim().length >= 7;

  const handleChangePassword = useCallback(async () => {
    if (!isPasswordValid) return;
    if (!currentPassword.trim()) {
      showToast({ severity: 'error', summary: 'Missing Field', detail: 'Enter your temporary password.', life: 3000 });
      return;
    }
    try {
      const res = await changeTemporaryPassword({ currentPassword, newPassword }).unwrap();
      updateUser(
        {
          is_temporary_password: false,
          is_onboarded: res.user?.is_onboarded ?? false,
          onboarding_step: 2,
        },
        res.token
      );

      // ── Audit: Step 1 complete ──
      recordAuditLog({
        action: 'Temporary Password Changed',
        category: 'security',
        user: res.user?.username || user?.username || user?.email || 'Invited User',
        userEmail: res.user?.email || user?.email || '',
        target: `${res.user?.email || user?.email} (Account Security)`,
        targetEmail: res.user?.email || user?.email,
        status: 'Success',
        details: `Invited user successfully changed temporary password. Single-use credential invalidated. Onboarding step 1 of 2 complete.`,
      });

      showToast({
        severity: 'success',
        summary: 'Password Changed',
        detail: 'Temporary password invalidated. Now complete your profile.',
        life: 3000,
      });
      setCurrentStep(2);
    } catch (err: any) {
      // ── Audit: Failed attempt ──
      recordAuditLog({
        action: 'Temporary Password Change Failed',
        category: 'security',
        user: user?.username || user?.email || 'Invited User',
        userEmail: user?.email || '',
        target: `${user?.email} (Account Security)`,
        targetEmail: user?.email,
        status: 'Warning',
        details: `Failed attempt to change temporary password: ${err?.data?.message || 'Invalid current password provided.'}`,
      });
      showToast({
        severity: 'error',
        summary: 'Failed',
        detail: err?.data?.message || 'Could not change password. Please try again.',
        life: 4000,
      });
    }
  }, [isPasswordValid, currentPassword, newPassword, changeTemporaryPassword, updateUser, user]);

  const handleCompleteProfile = useCallback(async () => {
    if (!isProfileValid) return;
    try {
      const res = await completeOnboarding({
        username: fullName,
        contact_number: contactNo,
        department,
        designation,
      }).unwrap();
      updateUser(
        {
          username: fullName,
          contact_number: contactNo,
          department,
          designation,
          is_onboarded: true,
          onboarding_step: 3,
        },
        res.token
      );

      // ── Audit: Step 2 complete — full onboarding done ──
      const resolvedName = fullName || res.user?.username || user?.email || 'Invited User';
      const resolvedEmail = res.user?.email || user?.email || '';

      recordAuditLog({
        action: 'Onboarding Completed — Profile Activated',
        category: 'invitation',
        user: resolvedName,
        userEmail: resolvedEmail,
        target: `${resolvedName} (Account)`,
        targetEmail: resolvedEmail,
        status: 'Success',
        details: `User completed mandatory onboarding. Profile details submitted and account fully activated. Department: ${department}${designation ? `, Designation: ${designation}` : ''}.`,
        changes: [
          { field: 'Full Name', from: user?.username || '(not set)', to: fullName },
          { field: 'Contact Number', from: user?.contact_number || '(not set)', to: contactNo },
          { field: 'Department', from: user?.department || '(not set)', to: department },
          ...(designation ? [{ field: 'Designation', from: user?.designation || '(not set)', to: designation }] : []),
          { field: 'Onboarding Status', from: 'Incomplete', to: 'Fully Activated' },
        ],
      });

      // ── Also mark invitation accepted ──
      acceptInvitation('__post_login__', {
        name: resolvedName,
        email: resolvedEmail,
        role: res.user?.role || user?.role || 'Employee',
        department,
      });

      showToast({
        severity: 'success',
        summary: 'Onboarding Complete',
        detail: 'Welcome to AetherERP! Your account is fully activated.',
        life: 3500,
      });
      setCurrentStep(3);
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Failed',
        detail: err?.data?.message || 'Could not save profile. Please try again.',
        life: 4000,
      });
    }
  }, [isProfileValid, fullName, contactNo, department, designation, completeOnboarding, updateUser, user]);

  const handleGoToDashboard = () => {
    navigate('/', { replace: true });
  };

  // ─── Success Screen ────────────────────────────────────────────
  if (currentStep === 3) {
    return (
      <AuthLayout title="You're all set!" subtitle="ACCOUNT ACTIVATION COMPLETE">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-border-subtle shadow-soft flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center">
            <CheckCircle2 size={44} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-foreground">Welcome, {fullName || user?.username}!</h3>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              Your password is secured and your profile is active. You now have full access to AetherERP.
            </p>
          </div>
          <div className="w-full p-4 rounded-xl bg-surface-subtle border border-border-subtle text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Name:</span>
              <span className="font-bold text-foreground">{fullName || user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Email:</span>
              <span className="font-bold text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Department:</span>
              <span className="font-bold text-foreground">{department}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="primary"
              label="Complete Profile"
              icon="pi pi-check"
              onClick={() => {
                sessionStorage.setItem('newly_invited_user_onboarded', 'true');
                navigate('/profile-completion', { replace: true });
              }}
              className="w-full h-12 rounded-xl! font-bold! shadow-lg shadow-primary/20"
            />
            <Button
              variant="ghost"
              label="Go to Dashboard"
              icon="pi pi-arrow-right"
              onClick={() => {
                sessionStorage.setItem('newly_invited_user_onboarded', 'true');
                handleGoToDashboard();
              }}
              className="w-full h-10 rounded-xl! font-semibold! text-muted hover:text-foreground"
            />
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  // ─── Main Onboarding Flow ──────────────────────────────────────
  return (
    <AuthLayout
      title="Complete Account Setup"
      subtitle={`MANDATORY ONBOARDING — STEP ${currentStep} OF 2`}>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted mb-2">
          <span className={currentStep >= 1 ? 'text-primary font-black' : ''}>1. Secure Password</span>
          <span className={currentStep >= 2 ? 'text-primary font-black' : ''}>2. Your Profile</span>
        </div>
        <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden flex gap-1">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-full flex-1 rounded-full transition-all duration-500 ${
                currentStep > s ? 'bg-success' : currentStep === s ? 'bg-primary' : 'bg-border-subtle/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* User badge */}
      <div className="mb-6 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
          {(user?.username || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-xs font-black text-foreground">{user?.email}</div>
          <div className="text-[10px] text-warning font-semibold uppercase tracking-wider">Onboarding Required</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Change Temporary Password ── */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-5">
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Lock size={16} className="text-primary" />
                Change Your Temporary Password
              </h3>
              <p className="text-xs text-muted">
                Your account was created with a single-use temporary password. Set a strong permanent password to continue.
              </p>
            </div>

            {/* Current (Temp) Password */}
            <FormField label="Temporary Password" required id="onboarding-current-pwd">
              <div className="relative">
                <input
                  id="onboarding-current-pwd"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter the temporary password from your email"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 cursor-pointer">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            {/* New Password */}
            <FormField label="New Password" required id="onboarding-new-pwd">
              <div className="relative">
                <input
                  id="onboarding-new-pwd"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 cursor-pointer">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            {/* Strength meter */}
            {newPassword.length > 0 && (
              <div className="flex flex-col gap-1.5 -mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Strength:</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      strengthScore <= 2
                        ? 'bg-error/10 text-error'
                        : strengthScore <= 4
                          ? 'bg-warning/10 text-warning'
                          : 'bg-success/10 text-success'
                    }`}>
                    {strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Moderate' : 'Strong'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        s <= strengthScore
                          ? strengthScore <= 2 ? 'bg-error' : strengthScore <= 4 ? 'bg-warning' : 'bg-success'
                          : 'bg-border-subtle/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <FormField label="Confirm New Password" required id="onboarding-confirm-pwd">
              <div className="relative">
                <input
                  id="onboarding-confirm-pwd"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 cursor-pointer">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            {/* Password checklist */}
            <div className="p-4 rounded-xl bg-surface-subtle/60 border border-border-subtle flex flex-col gap-2 text-xs">
              <span className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" /> Requirements
              </span>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                {[
                  { key: 'minLength', label: '8+ characters' },
                  { key: 'hasUpper', label: 'Uppercase (A-Z)' },
                  { key: 'hasLower', label: 'Lowercase (a-z)' },
                  { key: 'hasNumber', label: 'Number (0-9)' },
                  { key: 'hasSpecial', label: 'Special (!@#$)' },
                  { key: 'matches', label: 'Passwords match' },
                ].map(({ key, label }) => {
                  const ok = passwordChecks[key as keyof typeof passwordChecks];
                  return (
                    <div key={key} className={`flex items-center gap-1.5 ${ok ? 'text-success font-semibold' : 'text-muted'}`}>
                      {ok ? <Check size={12} /> : <X size={12} />}
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                label="Sign Out"
                onClick={logout}
                className="rounded-xl! h-12"
              />
              <Button
                type="button"
                variant="primary"
                label={isChangingPwd ? 'Saving...' : 'Set Password & Continue'}
                icon="pi pi-arrow-right"
                disabled={!isPasswordValid || !currentPassword.trim() || isChangingPwd}
                loading={isChangingPwd}
                onClick={handleChangePassword}
                className="flex-1 h-12 rounded-xl! font-bold! shadow-lg shadow-primary/20"
              />
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Complete Profile ── */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-5">
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <UserCircle size={16} className="text-primary" />
                Complete Your Profile
              </h3>
              <p className="text-xs text-muted">
                Fill in your details to activate your account. You can update these later in your profile settings.
              </p>
            </div>

            <FormField label="Full Name" required id="onboarding-fullname">
              <Input
                id="onboarding-fullname"
                placeholder="e.g. John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl!"
              />
            </FormField>

            <FormField label="Contact / Phone Number" required id="onboarding-contact">
              <Input
                id="onboarding-contact"
                placeholder="+1 (555) 012-3456"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className="h-12 rounded-xl!"
              />
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                label="Sign Out"
                onClick={logout}
                className="rounded-xl! h-12"
              />
              <Button
                type="button"
                variant="primary"
                label={isCompletingOnboarding ? 'Saving...' : 'Complete Setup'}
                loading={isCompletingOnboarding}
                disabled={!isProfileValid || isCompletingOnboarding}
                onClick={handleCompleteProfile}
                className="flex-1 h-12 rounded-xl! font-bold! shadow-lg shadow-primary/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
