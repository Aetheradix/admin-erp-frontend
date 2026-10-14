import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { FormField } from '@/components/ui/composed/FormField';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { showToast } from '@/components/ui/composed/Toast.utils';
import {
  validateInvitation,
  acceptInvitation,
  type InvitationRecord,
} from '@/services/auditService';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export default function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email');

  // Step 1: Security, Step 2: Personal & Contact, Step 3: Work & Org, Step 4: Review & Confirmation, Step 5: Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Invitation Verification State
  const [verifying, setVerifying] = useState(true);
  const [invitationStatus, setInvitationStatus] = useState<{
    valid: boolean;
    reason?: 'missing_token' | 'not_found' | 'expired' | 'revoked' | 'already_accepted' | 'duplicate_account';
    invitation?: InvitationRecord;
  }>({ valid: false });

  // Form Fields State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Profile Details
  const [fullName, setFullName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Work Details
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [workLocation, setWorkLocation] = useState('Headquarters');
  const [company, setCompany] = useState('AetherAdix Technologies');

  // Policies
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedSecurityPolicy, setAcceptedSecurityPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verify invitation on mount or param change
  useEffect(() => {
    setVerifying(true);
    const result = validateInvitation(tokenParam, emailParam);
    setInvitationStatus(result);

    if (result.invitation) {
      setFullName(result.invitation.name || '');
      setDepartment(result.invitation.department || 'Engineering');
      setDesignation(result.invitation.role || 'Team Member');
    }

    setVerifying(false);
  }, [tokenParam, emailParam]);

  // Password rules check
  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      matches: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const isPasswordValid =
    passwordChecks.minLength &&
    passwordChecks.hasUpper &&
    passwordChecks.hasLower &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSpecial &&
    passwordChecks.matches;

  // Strength score
  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordChecks.minLength) score++;
    if (passwordChecks.hasUpper) score++;
    if (passwordChecks.hasLower) score++;
    if (passwordChecks.hasNumber) score++;
    if (passwordChecks.hasSpecial) score++;
    return score;
  }, [passwordChecks]);

  // Validation per step
  const isStep2Valid =
    fullName.trim().length >= 2 &&
    contactNo.trim().length >= 7 &&
    streetAddress.trim().length >= 3 &&
    city.trim().length >= 2;

  const isStep3Valid = designation.trim().length >= 2 && department.trim().length >= 2;

  const isStep4Valid = acceptedTerms && acceptedSecurityPolicy;

  // Final submission handler
  const handleCompleteOnboarding = async () => {
    if (!isStep4Valid || !invitationStatus.invitation) return;

    setIsSubmitting(true);
    try {
      const email = invitationStatus.invitation.email;
      const fullAddress = `${streetAddress}, ${city}, ${stateRegion} ${postalCode}, ${country}`.replace(/,\s*,/g, ',');

      // Mark invitation accepted in audit log
      acceptInvitation(invitationStatus.invitation.token, {
        name: fullName,
        email,
        role: invitationStatus.invitation.role,
        department,
        address: fullAddress,
        contactNo,
      });

      // Save user record to local store so they can log in seamlessly
      const newUser = {
        id: Date.now(),
        username: fullName,
        email,
        role: invitationStatus.invitation.role,
        department,
        designation,
        work_location: workLocation,
        company,
        country,
        contact_number: contactNo,
        address: fullAddress,
        join_date: new Date().toISOString().split('T')[0],
      };

      // Add to mock staff list in localStorage
      try {
        const savedStaff = JSON.parse(localStorage.getItem('aether_staff_list') || '[]');
        const updatedStaff = [newUser, ...savedStaff.filter((s: any) => s.email !== email)];
        localStorage.setItem('aether_staff_list', JSON.stringify(updatedStaff));
      } catch {
        // Ignore
      }

      showToast({
        severity: 'success',
        summary: 'Account Activated',
        detail: 'Welcome aboard! Your profile and credentials have been established.',
        life: 4000,
      });

      setCurrentStep(5);
    } catch {
      showToast({
        severity: 'error',
        summary: 'Onboarding Failed',
        detail: 'An error occurred while finalizing your account. Please try again.',
        life: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (verifying) {
    return (
      <AuthLayout title="Account Setup" subtitle="VERIFYING INVITATION SECURITY CREDENTIALS...">
        <div className="py-20 flex flex-col items-center justify-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <i className="pi pi-spin pi-spinner text-2xl" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-muted">
            Validating Security Token...
          </span>
        </div>
      </AuthLayout>
    );
  }

  // 2. Expired Invitation Screen
  if (!invitationStatus.valid && invitationStatus.reason === 'expired') {
    return (
      <AuthLayout title="Invitation Expired" subtitle="SECURITY VALIDATION NOTICE">
        <div className="bg-white rounded-3xl p-8 border border-border-subtle shadow-soft flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-warning/10 text-warning flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground">This invitation link has expired</h3>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              For security compliance, user invitation tokens expire after 7 days. This invitation
              was sent on{' '}
              <strong>
                {invitationStatus.invitation?.invitedAt
                  ? new Date(invitationStatus.invitation.invitedAt).toLocaleDateString()
                  : 'earlier'}
              </strong>{' '}
              and is no longer valid.
            </p>
          </div>

          <div className="w-full p-4 rounded-xl bg-surface-subtle border border-border-subtle text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Invited Email:</span>
              <span className="font-bold text-foreground">
                {invitationStatus.invitation?.email || emailParam || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Invited By:</span>
              <span className="font-bold text-foreground">
                {invitationStatus.invitation?.invitedBy?.name || 'Administrator'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Status:</span>
              <span className="font-black text-error uppercase text-[10px]">EXPIRED</span>
            </div>
          </div>

          <p className="text-xs text-muted">
            Please contact your organization administrator or HR department to request a new
            invitation link.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link to="/auth/login" className="flex-1">
              <Button variant="ghost" label="Return to Login" className="w-full rounded-xl!" />
            </Link>
            <Button
              variant="primary"
              label="Contact Support"
              onClick={() => {
                showToast({
                  severity: 'info',
                  summary: 'Support Notified',
                  detail: 'An automatic renewal request has been flagged for your administrator.',
                  life: 3500,
                });
              }}
              className="flex-1 rounded-xl! shadow-md shadow-primary/20"
            />
          </div>
        </div>
      </AuthLayout>
    );
  }

  // 3. Revoked Invitation Screen
  if (!invitationStatus.valid && invitationStatus.reason === 'revoked') {
    return (
      <AuthLayout title="Invitation Revoked" subtitle="ACCESS RESTRICTION NOTICE">
        <div className="bg-white rounded-3xl p-8 border border-border-subtle shadow-soft flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground">Invitation Revoked</h3>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              This invitation was cancelled or revoked by an administrator on{' '}
              <strong>
                {invitationStatus.invitation?.revokedAt
                  ? new Date(invitationStatus.invitation.revokedAt).toLocaleDateString()
                  : 'a previous date'}
              </strong>
              . Access via this link is disabled.
            </p>
          </div>

          <Link to="/auth/login" className="w-full">
            <Button variant="primary" label="Back to Login" className="w-full rounded-xl!" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // 4. Already Accepted / Duplicate Account Screen
  if (!invitationStatus.valid && invitationStatus.reason === 'already_accepted') {
    return (
      <AuthLayout title="Account Already Active" subtitle="ONBOARDING ALREADY COMPLETED">
        <div className="bg-white rounded-3xl p-8 border border-border-subtle shadow-soft flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-success/10 text-success flex items-center justify-center">
            <UserCheck size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground">Welcome Back!</h3>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              An account associated with{' '}
              <strong className="text-foreground">
                {invitationStatus.invitation?.email || emailParam}
              </strong>{' '}
              has already been successfully activated. You can sign in immediately using your established password.
            </p>
          </div>

          <Link to="/auth/login" className="w-full">
            <Button
              variant="primary"
              label="Proceed to Login"
              icon="pi pi-sign-in"
              className="w-full rounded-xl! shadow-md shadow-primary/20"
            />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // 5. Missing / Invalid Token Screen
  if (!invitationStatus.valid) {
    return (
      <AuthLayout title="Invalid Invitation Link" subtitle="AUTHENTICATION ERROR">
        <div className="bg-white rounded-3xl p-8 border border-border-subtle shadow-soft flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground">Missing or Invalid Token</h3>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              We could not verify the security token provided in this URL. Please verify that you
              clicked the complete link sent in your invitation email.
            </p>
          </div>

          <Link to="/auth/login" className="w-full">
            <Button variant="ghost" label="Return to Login" className="w-full rounded-xl!" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // 6. Success Screen (Step 5)
  if (currentStep === 5) {
    return (
      <AuthLayout title="Onboarding Complete" subtitle="ACCOUNT ACTIVATED SUCCESSFULLY">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-border-subtle shadow-soft flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center animate-bounce">
            <CheckCircle2 size={40} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-foreground">Welcome to AetherERP!</h3>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              Your password has been securely configured and your employee profile is now active.
              You may now sign in to access your workspace.
            </p>
          </div>

          <div className="w-full p-4 rounded-xl bg-surface-subtle border border-border-subtle text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted font-semibold">User:</span>
              <span className="font-bold text-foreground">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Work Email:</span>
              <span className="font-bold text-foreground">{invitationStatus.invitation?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Assigned Role:</span>
              <span className="font-bold text-primary">{invitationStatus.invitation?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted font-semibold">Department:</span>
              <span className="font-bold text-foreground">{department}</span>
            </div>
          </div>

          <Button
            variant="primary"
            label="Sign In to Dashboard"
            icon="pi pi-arrow-right"
            onClick={() => navigate('/auth/login')}
            className="w-full h-12 rounded-xl! font-bold! shadow-lg shadow-primary/20"
          />
        </motion.div>
      </AuthLayout>
    );
  }

  const role = invitationStatus.invitation?.role || 'Employee';
  const email = invitationStatus.invitation?.email || '';

  // 7. Interactive Multi-Step Onboarding Form
  return (
    <AuthLayout
      title="Complete Your Onboarding"
      subtitle={`STEP ${currentStep} OF 4 — SECURE ACCOUNT ACTIVATION`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted mb-2">
          <span className={currentStep >= 1 ? 'text-primary font-black' : ''}>1. Security</span>
          <span className={currentStep >= 2 ? 'text-primary font-black' : ''}>2. Profile</span>
          <span className={currentStep >= 3 ? 'text-primary font-black' : ''}>3. Organization</span>
          <span className={currentStep >= 4 ? 'text-primary font-black' : ''}>4. Review</span>
        </div>
        <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                currentStep >= step ? 'bg-primary' : 'bg-border-subtle/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Recipient Header Badge */}
      <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="text-xs font-black text-foreground">{fullName || 'Invited User'}</div>
            <div className="text-[11px] text-muted">{email}</div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
          {role}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: PASSWORD & SECURITY SETUP */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">Set Account Password</h3>
              <p className="text-xs text-muted">
                Choose a strong master password to safeguard your access to AetherERP.
              </p>
            </div>

            <FormField label="Create New Password" required id="onboarding-password">
              <div className="relative">
                <input
                  id="onboarding-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            {/* Dynamic Strength Meter */}
            {password.length > 0 && (
              <div className="flex flex-col gap-1.5 -mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-muted tracking-wider">
                    Strength:
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      strengthScore <= 2
                        ? 'bg-error/10 text-error'
                        : strengthScore <= 4
                        ? 'bg-warning/10 text-warning'
                        : 'bg-success/10 text-success'
                    }`}>
                    {strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Moderate' : 'Strong & Compliant'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        s <= strengthScore
                          ? strengthScore <= 2
                            ? 'bg-error'
                            : strengthScore <= 4
                            ? 'bg-warning'
                            : 'bg-success'
                          : 'bg-border-subtle/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <FormField label="Confirm Password" required id="onboarding-confirm">
              <div className="relative">
                <input
                  id="onboarding-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password to confirm"
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

            {/* Checklist */}
            <div className="p-4 rounded-xl bg-surface-subtle/60 border border-border-subtle flex flex-col gap-2 text-xs">
              <span className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" /> Password Requirements
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.minLength ? 'text-success font-semibold' : 'text-muted'
                  }`}>
                  {passwordChecks.minLength ? <Check size={13} /> : <X size={13} />}
                  <span>8+ characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.hasUpper ? 'text-success font-semibold' : 'text-muted'
                  }`}>
                  {passwordChecks.hasUpper ? <Check size={13} /> : <X size={13} />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.hasLower ? 'text-success font-semibold' : 'text-muted'
                  }`}>
                  {passwordChecks.hasLower ? <Check size={13} /> : <X size={13} />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.hasNumber ? 'text-success font-semibold' : 'text-muted'
                  }`}>
                  {passwordChecks.hasNumber ? <Check size={13} /> : <X size={13} />}
                  <span>Number (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.hasSpecial ? 'text-success font-semibold' : 'text-muted'
                  }`}>
                  {passwordChecks.hasSpecial ? <Check size={13} /> : <X size={13} />}
                  <span>Special symbol (!@#$)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordChecks.matches ? 'text-success font-semibold' : 'text-muted'
                  }`}>
                  {passwordChecks.matches ? <Check size={13} /> : <X size={13} />}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              label="Continue to Profile Details"
              icon="pi pi-arrow-right"
              disabled={!isPasswordValid}
              onClick={() => setCurrentStep(2)}
              className="w-full h-12 rounded-xl! font-bold! shadow-lg shadow-primary/20"
            />
          </motion.div>
        )}

        {/* STEP 2: PROFILE & CONTACT INFORMATION */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">Personal & Contact Profile</h3>
              <p className="text-xs text-muted">
                Complete your identity information and verified communication address.
              </p>
            </div>

            <FormField label="Full Name" required id="onboarding-name">
              <Input
                id="onboarding-name"
                placeholder="e.g. Marcus Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl!"
              />
            </FormField>

            <FormField label="Contact / Phone Number" required id="onboarding-phone">
              <Input
                id="onboarding-phone"
                placeholder="+1 (555) 012-3456"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className="h-12 rounded-xl!"
              />
            </FormField>

            <FormField label="Street Address" required id="onboarding-street">
              <Input
                id="onboarding-street"
                placeholder="100 Innovation Way, Suite 400"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="h-12 rounded-xl!"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" required id="onboarding-city">
                <Input
                  id="onboarding-city"
                  placeholder="San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 rounded-xl!"
                />
              </FormField>

              <FormField label="State / Province" id="onboarding-state">
                <Input
                  id="onboarding-state"
                  placeholder="California"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="h-12 rounded-xl!"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Postal / ZIP Code" id="onboarding-zip">
                <Input
                  id="onboarding-zip"
                  placeholder="94107"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="h-12 rounded-xl!"
                />
              </FormField>

              <FormField label="Country" required id="onboarding-country">
                <Input
                  id="onboarding-country"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-12 rounded-xl!"
                />
              </FormField>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                label="Back"
                icon="pi pi-arrow-left"
                onClick={() => setCurrentStep(1)}
                className="rounded-xl! h-12"
              />
              <Button
                type="button"
                variant="primary"
                label="Continue to Organization"
                icon="pi pi-arrow-right"
                  disabled={!isStep2Valid}
                onClick={() => setCurrentStep(3)}
                className="flex-1 rounded-xl! h-12 font-bold! shadow-lg shadow-primary/20"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 3: WORK & ORGANIZATIONAL DETAILS */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">Organization & Role Placement</h3>
              <p className="text-xs text-muted">
                Review your assigned department, office hub, and operational title.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Job Title / Designation" required id="onboarding-designation">
                <Input
                  id="onboarding-designation"
                  placeholder="e.g. Senior Software Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="h-12 rounded-xl!"
                />
              </FormField>

              <FormField label="Department" required id="onboarding-dept">
                <Input
                  id="onboarding-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-12 rounded-xl!"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Work Location / Office" required id="onboarding-location">
                <Input
                  id="onboarding-location"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="e.g. Remote / Headquarters"
                  className="h-12 rounded-xl!"
                />
              </FormField>

              <FormField label="Company Entity" required id="onboarding-company">
                <Input
                  id="onboarding-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-12 rounded-xl!"
                />
              </FormField>
            </div>

            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col gap-2 text-xs">
              <span className="font-bold text-foreground">Assigned Access Level:</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-bold text-xs uppercase">
                  {role}
                </span>
                <span className="text-muted text-[11px]">
                  Configured by {invitationStatus.invitation?.invitedBy?.name || 'Administrator'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                label="Back"
                icon="pi pi-arrow-left"
                onClick={() => setCurrentStep(2)}
                className="rounded-xl! h-12"
              />
              <Button
                type="button"
                variant="primary"
                label="Review & Activate"
                icon="pi pi-arrow-right"
                  disabled={!isStep3Valid}
                onClick={() => setCurrentStep(4)}
                className="flex-1 rounded-xl! h-12 font-bold! shadow-lg shadow-primary/20"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 4: REVIEW & POLICIES */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">Review & Accept Terms</h3>
              <p className="text-xs text-muted">
                Confirm your details and accept security policies to activate your profile.
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-surface-subtle/70 p-5 rounded-2xl border border-border-subtle space-y-3 text-xs">
              <div className="flex justify-between border-b border-border-subtle/60 pb-2">
                <span className="text-muted font-semibold">Full Name</span>
                <span className="font-bold text-foreground">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/60 pb-2">
                <span className="text-muted font-semibold">Work Email</span>
                <span className="font-bold text-foreground">{email}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/60 pb-2">
                <span className="text-muted font-semibold">Contact Phone</span>
                <span className="font-bold text-foreground">{contactNo}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/60 pb-2">
                <span className="text-muted font-semibold">Role & Dept</span>
                <span className="font-bold text-foreground">
                  {role} • {department}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Address</span>
                <span className="font-medium text-foreground text-right truncate max-w-[200px]">
                  {streetAddress}, {city}, {country}
                </span>
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-subtle border border-border-subtle cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs text-foreground/90">
                  I confirm that all personal and professional profile details provided are accurate
                  and current.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-subtle border border-border-subtle cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedSecurityPolicy}
                  onChange={(e) => setAcceptedSecurityPolicy(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs text-foreground/90">
                  I agree to adhere to the organization's <strong>Acceptable Use Policy</strong>,
                  access controls, and <strong>Information Security Guidelines</strong>.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                label="Back"
                icon="pi pi-arrow-left"
                onClick={() => setCurrentStep(3)}
                className="rounded-xl! h-12"
              />
              <Button
                type="button"
                variant="primary"
                label={isSubmitting ? 'Finalizing...' : 'Complete Onboarding & Activate'}
                icon="pi pi-check"
                  disabled={!isStep4Valid || isSubmitting}
                loading={isSubmitting}
                onClick={handleCompleteOnboarding}
                className="flex-1 rounded-xl! h-12 font-black! shadow-lg shadow-primary/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-border-subtle text-center">
        <Link
          to="/auth/login"
          className="text-muted font-black text-xs uppercase tracking-widest hover:text-primary transition-colors">
          Already have an active account? Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
