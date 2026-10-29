import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  CreditCard,
  Shield,
  Briefcase,
  GraduationCap,
  Award,
  Camera,
  ChevronRight,
  ChevronLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePersistedTab } from '@/hooks/usePersistedTab';
import { showToast } from '@/components/ui/composed/Toast.utils';
import {
  getEmployeeProfile,
  saveEmployeeProfile,
  updateProfileSection,
  submitProfileForReview,
  getFormConfiguration,
  calculateCompletionPercentage,
  getIncompleteRequiredSections,
  isSectionValidAndComplete,
  syncProfilesFromBackend,
  type ProfileCompletionData,
  type ProfileStatus,
  type FormSectionConfig,
} from '@/services/employeeProfileService';
import {
  saveFormDraft,
  getFormDraft,
  clearFormDraft,
} from '@/utils/formDraftManager';
import { SmartAlertBanner } from '@/components/common/SmartAlertBanner';
import { AutosaveStatusBadge, type AutosaveStatus } from '@/components/common/AutosaveStatusBadge';

import { PersonalDetailsSection } from './components/PersonalDetailsSection';
import { BankDetailsSection } from './components/BankDetailsSection';
import { IdentityDocumentsSection } from './components/IdentityDocumentsSection';
import { PreviousEmploymentSection } from './components/PreviousEmploymentSection';
import { EducationSection } from './components/EducationSection';
import { CertificationsSection } from './components/CertificationsSection';
import { ProfilePictureSection } from './components/ProfilePictureSection';

const SECTION_ICONS: Record<string, any> = {
  personal: User,
  bank: CreditCard,
  identity: Shield,
  employment: Briefcase,
  education: GraduationCap,
  certifications: Award,
  profile_picture: Camera,
};

const STATUS_CONFIG: Record<
  ProfileStatus,
  { label: string; color: string; bg: string; icon: any }
> = {
  incomplete: {
    label: 'Incomplete',
    color: 'text-error',
    bg: 'bg-error/10 border-error/20',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20',
    icon: Clock,
  },
  submitted: {
    label: 'Submitted for Review',
    color: 'text-info',
    bg: 'bg-info/10 border-info/20',
    icon: Send,
  },
  changes_required: {
    label: 'Changes Required',
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20',
    icon: AlertCircle,
  },
  approved: {
    label: 'Approved',
    color: 'text-success',
    bg: 'bg-success/10 border-success/20',
    icon: CheckCircle2,
  },
  id_assigned: {
    label: 'Employee ID Assigned',
    color: 'text-success',
    bg: 'bg-success/10 border-success/20',
    icon: CheckCircle2,
  },
};

interface EmployeeProfileCompletionProps {
  onClose?: () => void;
  fullPage?: boolean;
}

export default function EmployeeProfileCompletion({
  onClose,
  fullPage = false,
}: EmployeeProfileCompletionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Tab Persistence across refresh and direct links
  const [activeSection, setActiveSection] = usePersistedTab<string>({
    paramName: 'section',
    defaultTab: 'personal',
    storageKey: 'aether_profile_completion_active_section',
  });

  const [profile, setProfile] = useState<ProfileCompletionData | null>(null);
  const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Draft & Autosave State
  const [isCurrentSectionDirty, setIsCurrentSectionDirty] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);
  const [sectionRefreshKey, setSectionRefreshKey] = useState(0);

  // Autosave debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load profile and form configuration
  useEffect(() => {
    if (!user) return;
    const config = getFormConfiguration();
    setFormConfig(config);

    const savedProfile =
      (user.email ? getEmployeeProfile(user.email) : null) ?? getEmployeeProfile(user.id);

    if (savedProfile) {
      setProfile(savedProfile);
    } else {
      const newProfile: ProfileCompletionData = {
        userId: user.id,
        userEmail: user.email,
        status: user.employee_id || user.employee_code ? 'id_assigned' : 'incomplete',
        employeeId: user.employee_id || user.employee_code,
        lastSavedAt: new Date().toISOString(),
        completedSections: {},
        personal: {
          fullName: user.username || '',
          contactNumber: user.contact_number || '',
          email: user.email,
          currentAddress: '',
          permanentAddress: '',
        },
      };
      setProfile(newProfile);
      saveEmployeeProfile(newProfile);
    }

    syncProfilesFromBackend().then(() => {
      const fresh =
        (user.email ? getEmployeeProfile(user.email) : null) ?? getEmployeeProfile(user.id);
      if (fresh) setProfile(fresh);
    });
  }, [user]);

  // Check for restored draft when active section changes
  useEffect(() => {
    if (!user) return;
    const draft = getFormDraft(user.id, activeSection);
    if (draft && draft.data) {
      setHasRestoredDraft(true);
      setIsCurrentSectionDirty(true);
      setAutosaveStatus('restored');
      setLastSavedTimestamp(new Date(draft.timestamp).toISOString());
    } else {
      setHasRestoredDraft(false);
      setIsCurrentSectionDirty(false);
      setAutosaveStatus('idle');
    }
  }, [user, activeSection, sectionRefreshKey]);

  const completionPercentage = useMemo(
    () => calculateCompletionPercentage(profile, formConfig),
    [profile, formConfig]
  );

  const incompleteSections = useMemo(
    () => getIncompleteRequiredSections(profile, formConfig),
    [profile, formConfig]
  );

  const activeSections = useMemo(() => formConfig.filter((s) => !s.hidden), [formConfig]);
  const activeIdx = activeSections.findIndex((s) => s.id === activeSection);

  // Resolves effective section data: draft takes precedence over saved profile
  const getEffectiveSectionData = useCallback(
    (sectionId: string) => {
      if (!user) return null;
      const draft = getFormDraft(user.id, sectionId);
      if (draft && draft.data) {
        return draft.data;
      }
      return profile ? (profile as any)[sectionId] : null;
    },
    [user, profile, sectionRefreshKey]
  );

  // Debounced draft autosave and parent state synchronization (prevents typing lag)
  const handleDraftChange = useCallback(
    (sectionId: string, _data: any, isDirty: boolean) => {
      if (!user) return;
      setIsCurrentSectionDirty(isDirty);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (isDirty) {
        setAutosaveStatus('saving');
      }

      // Debounce updating parent profile & saving draft by 250ms so typing remains 100% fluid (60fps)
      debounceTimerRef.current = setTimeout(() => {
        setProfile((prev) => {
          if (!prev) return prev;
          const candidate = {
            ...prev,
            [sectionId]: _data,
          };
          const isValid = isSectionValidAndComplete(sectionId, candidate);
          return {
            ...candidate,
            completedSections: {
              ...prev.completedSections,
              [sectionId]: isValid,
            },
          };
        });

        if (isDirty) {
          saveFormDraft(user.id, sectionId, _data);
          setAutosaveStatus('saved');
          setLastSavedTimestamp(new Date().toISOString());
        } else {
          setAutosaveStatus('idle');
        }
      }, 250);
    },
    [user]
  );

  // Explicit Save as Draft button action (no popups)
  const handleSaveDraft = useCallback(
    (data: any) => {
      if (!user) return;
      saveFormDraft(user.id, activeSection, data);
      setIsCurrentSectionDirty(false);
      setHasRestoredDraft(false);
      setAutosaveStatus('saved');
      setLastSavedTimestamp(new Date().toISOString());
      showToast({
        severity: 'success',
        summary: 'Draft Saved',
        detail: 'Your entries have been saved as draft. You can continue anytime.',
        life: 2500,
      });
    },
    [user, activeSection]
  );

  // Discard draft action
  const handleDiscardDraft = useCallback(() => {
    if (!user) return;
    clearFormDraft(user.id, activeSection);
    setHasRestoredDraft(false);
    setIsCurrentSectionDirty(false);
    setAutosaveStatus('idle');
    setSectionRefreshKey((k) => k + 1);
    showToast({
      severity: 'info',
      summary: 'Draft Discarded',
      detail: 'Restored original saved profile data.',
      life: 2500,
    });
  }, [user, activeSection]);

  // Tab switch without interrupting confirmation popups
  const handleSectionSwitch = useCallback(
    (targetSectionId: string) => {
      if (targetSectionId === activeSection) return;
      setActiveSection(targetSectionId);
    },
    [activeSection, setActiveSection]
  );

  const handleSaveSection = useCallback(
    async (sectionId: string, data: any) => {
      if (!user || !profile) return;
      setIsSaving(true);
      try {
        updateProfileSection(
          user.id,
          user.email,
          sectionId as keyof ProfileCompletionData,
          data,
          sectionId,
          user.username || user.email
        );

        // Clear draft on successful persistent save
        clearFormDraft(user.id, sectionId);
        setIsCurrentSectionDirty(false);
        setHasRestoredDraft(false);
        setAutosaveStatus('saved');
        setLastSavedTimestamp(new Date().toISOString());

        const updated = getEmployeeProfile(user.id);
        setProfile(updated);

        const updatedPct = calculateCompletionPercentage(updated, formConfig);
        window.dispatchEvent(new CustomEvent('aether_employee_profiles_updated'));

        if (updatedPct >= 100) {
          showToast({
            severity: 'success',
            summary: 'Profile 100% Complete!',
            detail: 'All required sections are verified and saved.',
            life: 3000,
          });
        } else {
          showToast({
            severity: 'success',
            summary: 'Saved Successfully',
            detail: 'Section saved! Moving to the next step.',
            life: 2500,
          });
        }

        // Advance to next section automatically
        const currentIndex = activeSections.findIndex((s) => s.id === sectionId);
        if (currentIndex >= 0 && currentIndex < activeSections.length - 1) {
          setActiveSection(activeSections[currentIndex + 1].id);
        }
      } catch {
        setAutosaveStatus('error');
        showToast({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Could not save section. Please try again.',
          life: 3000,
        });
      } finally {
        setIsSaving(false);
      }
    },
    [user, profile, activeSections, formConfig, setActiveSection]
  );

  const handleSubmit = useCallback(async () => {
    if (!user || !profile) return;

    if (!profile.personal?.fullName?.trim()) {
      showToast({
        severity: 'warn',
        summary: 'Personal Details Required',
        detail: 'Please provide your full name before submitting.',
        life: 3500,
      });
      setActiveSection('personal');
      return;
    }

    setIsSubmitting(true);
    try {
      if (profile.status === 'id_assigned' || profile.status === 'approved') {
        saveEmployeeProfile(profile);
        window.dispatchEvent(new CustomEvent('aether_employee_profiles_updated'));
        const updatedPct = calculateCompletionPercentage(profile, formConfig);

        if (updatedPct >= 100) {
          showToast({
            severity: 'success',
            summary: 'Profile 100% Complete!',
            detail: 'Your profile updates have been saved. Redirecting to Profile...',
            life: 3500,
          });
          setTimeout(() => {
            if (onClose) onClose();
            if (fullPage) navigate('/profile');
          }, 1500);
          return;
        }

        showToast({
          severity: 'success',
          summary: 'Profile Updated!',
          detail: 'Your profile changes have been saved successfully.',
          life: 3500,
        });
      } else {
        submitProfileForReview(user.id, user.email, user.username || user.email);
        const updated = getEmployeeProfile(user.id);
        setProfile(updated);
        const updatedPct = calculateCompletionPercentage(updated, formConfig);
        window.dispatchEvent(new CustomEvent('aether_employee_profiles_updated'));

        if (updatedPct >= 100) {
          showToast({
            severity: 'success',
            summary: 'Profile 100% Complete!',
            detail: 'Your complete profile has been submitted. Redirecting to Profile...',
            life: 3500,
          });
          setTimeout(() => {
            if (onClose) onClose();
            if (fullPage) navigate('/profile');
          }, 1500);
          return;
        } else if (incompleteSections.length > 0) {
          showToast({
            severity: 'success',
            summary: 'Profile Submitted!',
            detail:
              'Your profile has been submitted for review. Remaining documents can be uploaded anytime.',
            life: 4500,
          });
        } else {
          showToast({
            severity: 'success',
            summary: 'Profile Submitted!',
            detail:
              'Your complete profile has been submitted for review. The HR team will review it shortly.',
            life: 4000,
          });
        }
      }
    } catch {
      showToast({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Could not save profile. Please try again.',
        life: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, profile, incompleteSections, formConfig, onClose, fullPage, navigate, setActiveSection]);

  const goToNext = () => {
    if (activeIdx < activeSections.length - 1) {
      handleSectionSwitch(activeSections[activeIdx + 1].id);
    }
  };

  const goToPrev = () => {
    if (activeIdx > 0) {
      handleSectionSwitch(activeSections[activeIdx - 1].id);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <i className="pi pi-spin pi-spinner text-primary text-lg" />
          </div>
          <span className="text-xs text-muted font-bold uppercase tracking-wider">
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[profile.status];
  const StatusIcon = statusCfg.icon;
  const isReadOnly = false;

  const containerClass = fullPage
    ? 'min-h-screen bg-background'
    : 'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';

  const innerClass = fullPage
    ? 'w-full w-full mx-auto px-2 py-8'
    : 'bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl';

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <FileText size={22} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-foreground">Complete Your Profile</h2>
                <AutosaveStatusBadge status={autosaveStatus} lastSavedAt={lastSavedTimestamp} />
              </div>
              <p className="text-xs text-muted mt-0.5">
                Fill in all sections to activate your account fully
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
              <StatusIcon size={14} />
              {statusCfg.label}
            </div>

            {/* Progress ring */}
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-border-subtle/40"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke={completionPercentage === 100 ? '#22c55e' : '#6366f1'}
                  strokeWidth="3"
                  strokeDasharray={`${(completionPercentage / 100) * 97.4} 97.4`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-foreground">
                {completionPercentage}%
              </span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-subtle transition-all">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ── Status Alert Banners ── */}
        {profile.status === 'changes_required' && profile.reviewNotes && (
          <div className="mx-8 mt-4 p-4 rounded-2xl bg-warning/10 border border-warning/20 flex items-start gap-3">
            <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-warning">Changes Requested by Hiring Team</div>
              <p className="text-xs text-warning/80 mt-1">{profile.reviewNotes}</p>
            </div>
          </div>
        )}

        {profile.status === 'submitted' && (
          <div className="mx-8 mt-4 p-4 rounded-2xl bg-info/10 border border-info/20 flex items-start gap-3">
            <Clock size={18} className="text-info shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-info">Profile Under Review</div>
              <p className="text-xs text-info/80 mt-1">
                Submitted on {new Date(profile.submittedAt || '').toLocaleDateString()} at{' '}
                {new Date(profile.submittedAt || '').toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                . The hiring team will review your profile and get back to you.
              </p>
            </div>
          </div>
        )}

        {(profile.status === 'approved' || profile.status === 'id_assigned') && (
          <div className="mx-8 mt-4 p-4 rounded-2xl bg-success/10 border border-success/20 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-success">
                {profile.status === 'id_assigned'
                  ? 'Profile Approved & Employee ID Assigned'
                  : 'Profile Approved'}
              </div>
              {profile.employeeId && (
                <p className="text-xs text-success/80 mt-1">
                  Your Employee ID: <strong className="font-black">{profile.employeeId}</strong>
                  {profile.employeeIdAssignedBy &&
                    ` — Assigned by ${profile.employeeIdAssignedBy.name} (${profile.employeeIdAssignedBy.role})`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Main Body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ── Sidebar Navigation ── */}
          <div className="w-72 border-r border-border-subtle bg-surface-subtle/30 flex flex-col overflow-y-auto shrink-0">
            <div className="p-4 space-y-1">
              {/* Profile picture quick link */}
              <button
                onClick={() => handleSectionSwitch('profile_picture')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all group ${
                  activeSection === 'profile_picture'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'hover:bg-white hover:shadow-sm text-foreground'
                }`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    activeSection === 'profile_picture' ? 'bg-white/20' : 'bg-primary/10'
                  }`}>
                  <Camera
                    size={16}
                    className={activeSection === 'profile_picture' ? 'text-white' : 'text-primary'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Profile Picture</div>
                </div>
                {profile.profilePictureUrl && (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      activeSection === 'profile_picture' ? 'bg-white/20' : 'bg-success/10'
                    }`}>
                    <Check
                      size={11}
                      className={
                        activeSection === 'profile_picture' ? 'text-white' : 'text-success'
                      }
                    />
                  </div>
                )}
              </button>

              {/* Dynamic sections */}
              {activeSections.map((section) => {
                const IconComp = SECTION_ICONS[section.id] || FileText;
                const isActive = activeSection === section.id;
                const isCompleted = isSectionValidAndComplete(section.id, profile);

                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionSwitch(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'hover:bg-white hover:shadow-sm text-foreground'
                    }`}>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/20' : isCompleted ? 'bg-success/10' : 'bg-primary/10'
                      }`}>
                      <IconComp
                        size={16}
                        className={
                          isActive ? 'text-white' : isCompleted ? 'text-success' : 'text-primary'
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{section.label}</div>
                      {section.description && (
                        <div
                          className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/70' : 'text-muted'}`}>
                          {section.description}
                        </div>
                      )}
                    </div>
                    {isCompleted && (
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-white/20' : 'bg-success/10'
                        }`}>
                        <Check size={11} className={isActive ? 'text-white' : 'text-success'} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Summary / Progress section */}
            <div className="p-4 mt-auto border-t border-border-subtle">
              <div className="p-4 rounded-2xl bg-white border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted">
                    Progress
                  </span>
                  <span className="text-sm font-black text-primary">{completionPercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-2 text-[10px] text-muted">
                  {activeSections.filter((s) => isSectionValidAndComplete(s.id, profile)).length} of{' '}
                  {activeSections.length} sections completed
                </div>

                {profile.status === 'in_progress' && profile.lastSavedAt && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
                    <Check size={10} className="text-success" />
                    Saved{' '}
                    {new Date(profile.lastSavedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section Content ── */}
          <div className="flex-1 overflow-y-auto">
            {/* Contextual Smart Alert Banner */}
            <div className="pt-6">
              <SmartAlertBanner
                completionPercentage={completionPercentage}
                incompleteSections={incompleteSections}
                activeSection={activeSection}
                onSelectSection={handleSectionSwitch}
                hasRestoredDraft={hasRestoredDraft}
                onDiscardDraft={handleDiscardDraft}
                isDirty={isCurrentSectionDirty}
              />
            </div>

            <div key={activeSection} className="px-8 pb-8 transition-opacity duration-150">
              {activeSection === 'profile_picture' && (
                <ProfilePictureSection
                  profile={profile}
                  onSave={(url) => {
                    if (!user) return;
                    const updated = getEmployeeProfile(user.id) || profile;
                    const newProfile = { ...updated, profilePictureUrl: url };
                    saveEmployeeProfile(newProfile);
                    setProfile(newProfile);
                  }}
                  onContinue={goToNext}
                  readOnly={isReadOnly}
                />
              )}

              {activeSection === 'personal' && (
                <PersonalDetailsSection
                  data={getEffectiveSectionData('personal')}
                  onSave={(data) => handleSaveSection('personal', data)}
                  onSaveDraft={handleSaveDraft}
                  onDraftChange={(data, isDirty) => handleDraftChange('personal', data, isDirty)}
                  isSaving={isSaving}
                  readOnly={isReadOnly}
                />
              )}

              {activeSection === 'bank' && (
                <BankDetailsSection
                  data={getEffectiveSectionData('bank')}
                  onSave={(data) => handleSaveSection('bank', data)}
                  onSaveDraft={handleSaveDraft}
                  onDraftChange={(data, isDirty) => handleDraftChange('bank', data, isDirty)}
                  isSaving={isSaving}
                  readOnly={isReadOnly}
                />
              )}

              {activeSection === 'identity' && (
                <IdentityDocumentsSection
                  data={getEffectiveSectionData('identity')}
                  documents={profile.documents || []}
                  userId={user.id}
                  onSave={(data) => handleSaveSection('identity', data)}
                  onSaveDraft={handleSaveDraft}
                  onDraftChange={(data, isDirty) => handleDraftChange('identity', data, isDirty)}
                  onDocumentAdded={(doc) => {
                    const updated = getEmployeeProfile(user.id) || profile;
                    setProfile({ ...updated, documents: [...(updated.documents || []), doc] });
                  }}
                  isSaving={isSaving}
                  readOnly={isReadOnly}
                />
              )}

              {activeSection === 'employment' && (
                <PreviousEmploymentSection
                  data={getEffectiveSectionData('employment') || []}
                  documents={profile.documents || []}
                  userId={user.id}
                  onSave={(data) => handleSaveSection('employment', data)}
                  onSaveDraft={handleSaveDraft}
                  onDraftChange={(data, isDirty) => handleDraftChange('employment', data, isDirty)}
                  isSaving={isSaving}
                  readOnly={isReadOnly}
                />
              )}

              {activeSection === 'education' && (
                <EducationSection
                  data={getEffectiveSectionData('education') || []}
                  documents={profile.documents || []}
                  userId={user.id}
                  onSave={(data) => handleSaveSection('education', data)}
                  onSaveDraft={handleSaveDraft}
                  onDraftChange={(data, isDirty) => handleDraftChange('education', data, isDirty)}
                  isSaving={isSaving}
                  readOnly={isReadOnly}
                />
              )}

              {activeSection === 'certifications' && (
                <CertificationsSection
                  data={getEffectiveSectionData('certifications') || []}
                  documents={profile.documents || []}
                  userId={user.id}
                  onSave={(data) => handleSaveSection('certifications', data)}
                  onSaveDraft={handleSaveDraft}
                  onDraftChange={(data, isDirty) => handleDraftChange('certifications', data, isDirty)}
                  isSaving={isSaving}
                  readOnly={isReadOnly}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-border-subtle bg-surface-subtle/20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrev}
              disabled={activeIdx <= 0 && activeSection !== 'profile_picture'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-surface-subtle transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={goToNext}
              disabled={activeIdx >= activeSections.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-surface-subtle transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isSaving && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <i className="pi pi-spin pi-spinner text-xs" />
                Saving...
              </div>
            )}

            {/* If profile is 100% complete and approved or on last step, provide one-click Finish / View Profile */}
            {(completionPercentage >= 100 || activeIdx === activeSections.length - 1) && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {isSubmitting ? (
                  <>
                    <i className="pi pi-spin pi-spinner" /> Saving...
                  </>
                ) : profile.status === 'id_assigned' || profile.status === 'approved' ? (
                  <>
                    <CheckCircle2 size={15} /> Finish & View Profile
                  </>
                ) : profile.status === 'submitted' ? (
                  <>
                    <Send size={15} /> Update Submission
                  </>
                ) : incompleteSections.length > 0 ? (
                  <>
                    <Send size={15} /> Submit for Review (Docs Later)
                  </>
                ) : (
                  <>
                    <Send size={15} /> Submit for Review
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
