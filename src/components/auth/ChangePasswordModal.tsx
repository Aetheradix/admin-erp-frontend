import React, { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { FormField } from '@/components/ui/composed/FormField';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { useAuth } from '@/hooks/useAuth';
import { useChangePasswordMutation } from '@/store/api/authApiSlice';
import { recordAuditLog } from '@/services/auditService';
import { Eye, EyeOff, Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface ChangePasswordModalProps {
  visible: boolean;
  onHide: () => void;
  requireCurrentPassword?: boolean;
}

export const ChangePasswordModal = ({
  visible,
  onHide,
  requireCurrentPassword = true,
}: ChangePasswordModalProps) => {
  const { user } = useAuth();
  const [changePasswordApi, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invalidateSessions, setInvalidateSessions] = useState(true);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Policy Rules
  const checks = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      passwordsMatch: newPassword.length > 0 && newPassword === confirmPassword,
      notSameAsCurrent:
        !requireCurrentPassword ||
        !currentPassword ||
        newPassword !== currentPassword,
    };
  }, [newPassword, confirmPassword, currentPassword, requireCurrentPassword]);

  // Overall strength score (0 to 5)
  const strengthScore = useMemo(() => {
    let score = 0;
    if (checks.minLength) score += 1;
    if (checks.hasUpper) score += 1;
    if (checks.hasLower) score += 1;
    if (checks.hasNumber) score += 1;
    if (checks.hasSpecial) score += 1;
    return score;
  }, [checks]);

  const strengthLabel = useMemo(() => {
    if (newPassword.length === 0) return { label: 'Empty', color: 'bg-muted/30 text-muted' };
    if (strengthScore <= 2) return { label: 'Weak', color: 'bg-error text-white' };
    if (strengthScore === 3) return { label: 'Moderate', color: 'bg-warning text-white' };
    if (strengthScore === 4) return { label: 'Good', color: 'bg-info text-white' };
    return { label: 'Strong & Secure', color: 'bg-success text-white' };
  }, [strengthScore, newPassword]);

  const isFormValid = useMemo(() => {
    const basicReqs =
      checks.minLength &&
      checks.hasUpper &&
      checks.hasLower &&
      checks.hasNumber &&
      checks.hasSpecial &&
      checks.passwordsMatch &&
      checks.notSameAsCurrent;

    if (requireCurrentPassword) {
      return basicReqs && currentPassword.trim().length > 0;
    }
    return basicReqs;
  }, [checks, requireCurrentPassword, currentPassword]);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (requireCurrentPassword && !currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!checks.notSameAsCurrent) {
      setErrorMessage('New password cannot be identical to your current password.');
      return;
    }

    if (strengthScore < 4) {
      setErrorMessage('Please create a stronger password meeting all security requirements.');
      return;
    }

    if (!checks.passwordsMatch) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    try {
      // Call backend — it validates the current password server-side.
      await changePasswordApi({
        currentPassword: requireCurrentPassword ? currentPassword : undefined,
        newPassword,
        logoutOtherSessions: invalidateSessions,
      }).unwrap();

      // Backend confirmed success ✓
      if (invalidateSessions) {
        localStorage.setItem('aether_last_password_change', String(Date.now()));
      }

      recordAuditLog({
        action: 'Password Changed',
        category: 'security',
        user: user?.username || user?.email || 'Authenticated User',
        userEmail: user?.email || 'user@aetheradix.com',
        target: 'Security Authentication Credentials',
        status: 'Success',
        details: `Password changed successfully. ${
          invalidateSessions ? 'Invalidated all other active sessions.' : 'Kept other sessions active.'
        }`,
      });

      showToast({
        severity: 'success',
        summary: 'Password Updated',
        detail: invalidateSessions
          ? 'Your password was changed and other active sessions were invalidated.'
          : 'Your password was changed successfully.',
        life: 4000,
      });

      handleClose();
    } catch (err: any) {
      const msg: string =
        err?.data?.message ||
        err?.message ||
        'Failed to update password. Please check your current password and try again.';
      setErrorMessage(msg);
      showToast({
        severity: 'error',
        summary: 'Password Change Failed',
        detail: msg,
        life: 5000,
      });
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleClose}
      header="Change Account Password"
      modal
      className="w-full max-w-lg mx-4"
      contentClassName="p-8"
      headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <p className="text-xs text-muted -mt-2">
          Update your login password. We recommend choosing a strong, unique passphrase that you do
          not use for other accounts.
        </p>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-error font-medium">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Current Password Field */}
        {requireCurrentPassword && (
          <FormField label="Current Password" required id="current-password">
            <div className="relative">
              <input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full pr-11 pl-4 py-3 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 cursor-pointer"
                title={showCurrent ? 'Hide password' : 'Show password'}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>
        )}

        {/* New Password Field */}
        <FormField label="New Password" required id="new-password">
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? 'text' : 'password'}
              placeholder="Create strong password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full pr-11 pl-4 py-3 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 cursor-pointer"
              title={showNew ? 'Hide password' : 'Show password'}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FormField>

        {/* Dynamic Strength Meter */}
        {newPassword.length > 0 && (
          <div className="flex flex-col gap-2 -mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-muted text-[11px] uppercase tracking-wider">
                Password Strength:
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${strengthLabel.color}`}>
                {strengthLabel.label}
              </span>
            </div>
            <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    lvl <= strengthScore
                      ? strengthScore <= 2
                        ? 'bg-error'
                        : strengthScore === 3
                        ? 'bg-warning'
                        : 'bg-success'
                      : 'bg-border-subtle/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Confirm Password Field */}
        <FormField label="Confirm New Password" required id="confirm-password">
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pr-11 pl-4 py-3 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 cursor-pointer"
              title={showConfirm ? 'Hide password' : 'Show password'}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FormField>

        {/* Requirement Checklist */}
        <div className="p-4 rounded-xl bg-surface-subtle/70 border border-border-subtle flex flex-col gap-2 text-xs">
          <span className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-primary" /> Security Policy Requirements
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
            <div
              className={`flex items-center gap-1.5 ${
                checks.minLength ? 'text-success font-semibold' : 'text-muted'
              }`}>
              {checks.minLength ? <Check size={13} /> : <X size={13} />}
              <span>At least 8 characters</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                checks.hasUpper ? 'text-success font-semibold' : 'text-muted'
              }`}>
              {checks.hasUpper ? <Check size={13} /> : <X size={13} />}
              <span>Uppercase letter (A-Z)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                checks.hasLower ? 'text-success font-semibold' : 'text-muted'
              }`}>
              {checks.hasLower ? <Check size={13} /> : <X size={13} />}
              <span>Lowercase letter (a-z)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                checks.hasNumber ? 'text-success font-semibold' : 'text-muted'
              }`}>
              {checks.hasNumber ? <Check size={13} /> : <X size={13} />}
              <span>At least 1 number (0-9)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                checks.hasSpecial ? 'text-success font-semibold' : 'text-muted'
              }`}>
              {checks.hasSpecial ? <Check size={13} /> : <X size={13} />}
              <span>Special symbol (!@#$%^&*)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                checks.passwordsMatch ? 'text-success font-semibold' : 'text-muted'
              }`}>
              {checks.passwordsMatch ? <Check size={13} /> : <X size={13} />}
              <span>Passwords match</span>
            </div>
          </div>
        </div>

        {/* Invalidate Other Sessions Checkbox */}
        <label className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 cursor-pointer">
          <input
            type="checkbox"
            checked={invalidateSessions}
            onChange={(e) => setInvalidateSessions(e.target.checked)}
            className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
          />
          <div className="flex flex-col text-xs">
            <span className="font-bold text-foreground">
              Invalidate existing sessions across other devices
            </span>
            <span className="text-muted leading-relaxed">
              Recommended: Automatically sign out of other active browser tabs, mobile apps, and
              devices.
            </span>
          </div>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button
            type="button"
            variant="ghost"
            label="Cancel"
            onClick={handleClose}
            className="rounded-xl!"
          />
          <Button
            type="submit"
            label={isLoading ? 'Updating...' : 'Update Password'}
            disabled={!isFormValid || isLoading}
            icon="pi pi-shield"
            className="rounded-xl! px-6! shadow-md shadow-primary/20"
          />
        </div>
      </form>
    </Dialog>
  );
};
