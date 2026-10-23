import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, Shield, Briefcase, GraduationCap, Award, Camera,
  ChevronRight, ChevronLeft, Send, CheckCircle2, AlertCircle,
  Clock, FileText, RefreshCw, X, Check, Lock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/components/ui/composed/Toast.utils';
import {
  getEmployeeProfile, saveEmployeeProfile, updateProfileSection,
  submitProfileForReview, getFormConfiguration, calculateCompletionPercentage,
  getIncompleteRequiredSections, syncProfilesFromBackend,
  type ProfileCompletionData, type ProfileStatus, type FormSectionConfig,
} from '@/services/employeeProfileService';
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

const STATUS_CONFIG: Record<ProfileStatus, { label: string; color: string; bg: string; icon: any }> = {
  incomplete: { label: 'Incomplete', color: 'text-error', bg: 'bg-error/10 border-error/20', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: Clock },
  submitted: { label: 'Submitted for Review', color: 'text-info', bg: 'bg-info/10 border-info/20', icon: Send },
  changes_required: { label: 'Changes Required', color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: AlertCircle },
  approved: { label: 'Approved', color: 'text-success', bg: 'bg-success/10 border-success/20', icon: CheckCircle2 },
  id_assigned: { label: 'Employee ID Assigned', color: 'text-success', bg: 'bg-success/10 border-success/20', icon: CheckCircle2 },
};

interface EmployeeProfileCompletionProps {
  onClose?: () => void;
  fullPage?: boolean;
}

export default function EmployeeProfileCompletion({ onClose, fullPage = false }: EmployeeProfileCompletionProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [profile, setProfile] = useState<ProfileCompletionData | null>(null);
  const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load profile and form configuration
  useEffect(() => {
    if (!user) return;
    const config = getFormConfiguration();
    setFormConfig(config);

    const savedProfile = (user.email ? getEmployeeProfile(user.email) : null) ?? getEmployeeProfile(user.id);

    if (savedProfile) {
      setProfile(savedProfile);
    } else {
      // Initialize a new profile
      const newProfile: ProfileCompletionData = {
        userId: user.id,
        userEmail: user.email,
        status: (user.employee_id || user.employee_code) ? 'id_assigned' : 'incomplete',
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

    // Sync from backend
    syncProfilesFromBackend().then(() => {
      const fresh = (user.email ? getEmployeeProfile(user.email) : null) ?? getEmployeeProfile(user.id);
      if (fresh) setProfile(fresh);
    });
  }, [user]);

  const completionPercentage = useMemo(() =>
    calculateCompletionPercentage(profile, formConfig),
    [profile, formConfig]
  );

  const incompleteSections = useMemo(() =>
    getIncompleteRequiredSections(profile, formConfig),
    [profile, formConfig]
  );

  const activeSections = useMemo(() =>
    formConfig.filter((s) => !s.hidden),
    [formConfig]
  );

  const activeIdx = activeSections.findIndex((s) => s.id === activeSection);

  const handleSaveSection = useCallback(async (sectionId: string, data: any) => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      updateProfileSection(
        user.id,
        user.email,
        sectionId as keyof ProfileCompletionData,
        data,
        sectionId,
        user.username || user.email,
      );

      const updated = getEmployeeProfile(user.id);
      setProfile(updated);

      showToast({
        severity: 'success',
        summary: 'Saved',
        detail: 'Section saved! Moving to next step.',
        life: 2500,
      });

      // Automatically advance to the next section
      const currentIndex = activeSections.findIndex((s) => s.id === sectionId);
      if (currentIndex >= 0 && currentIndex < activeSections.length - 1) {
        setActiveSection(activeSections[currentIndex + 1].id);
      }
    } catch {
      showToast({
        severity: 'error',
        summary: 'Save Failed',
        detail: 'Could not save section. Please try again.',
        life: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, profile, activeSections]);

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
      submitProfileForReview(user.id, user.email, user.username || user.email);
      const updated = getEmployeeProfile(user.id);
      setProfile(updated);

      if (incompleteSections.length > 0) {
        showToast({
          severity: 'success',
          summary: 'Profile Submitted!',
          detail: 'Your profile has been submitted for review. Remaining documents can be uploaded anytime.',
          life: 4500,
        });
      } else {
        showToast({
          severity: 'success',
          summary: 'Profile Submitted!',
          detail: 'Your complete profile has been submitted for review. The HR team will review it shortly.',
          life: 4000,
        });
      }
    } catch {
      showToast({
        severity: 'error',
        summary: 'Submission Failed',
        detail: 'Could not submit profile. Please try again.',
        life: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, profile, incompleteSections]);

  const goToNext = () => {
    if (activeIdx < activeSections.length - 1) {
      setActiveSection(activeSections[activeIdx + 1].id);
    }
  };

  const goToPrev = () => {
    if (activeIdx > 0) {
      setActiveSection(activeSections[activeIdx - 1].id);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <i className="pi pi-spin pi-spinner text-primary text-lg" />
          </div>
          <span className="text-xs text-muted font-bold uppercase tracking-wider">Loading profile...</span>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[profile.status];
  const StatusIcon = statusCfg.icon;
  const canSubmit = profile.status !== 'submitted' &&
    profile.status !== 'approved' &&
    profile.status !== 'id_assigned';

  const isReadOnly = profile.status === 'submitted' || profile.status === 'approved' || profile.status === 'id_assigned';

  const containerClass = fullPage
    ? 'min-h-screen bg-background'
    : 'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';

  const innerClass = fullPage
    ? 'w-full max-w-7xl mx-auto px-6 py-8'
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
              <h2 className="text-xl font-black text-foreground">Complete Your Profile</h2>
              <p className="text-xs text-muted mt-0.5">Fill in all sections to activate your account fully</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
              <StatusIcon size={14} />
              {statusCfg.label}
            </div>

            {/* Progress ring */}
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-border-subtle/40" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
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
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-subtle transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ── Status Alert ── */}
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
                Submitted on {new Date(profile.submittedAt || '').toLocaleDateString()} at {new Date(profile.submittedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                The hiring team will review your profile and get back to you.
              </p>
            </div>
          </div>
        )}

        {(profile.status === 'approved' || profile.status === 'id_assigned') && (
          <div className="mx-8 mt-4 p-4 rounded-2xl bg-success/10 border border-success/20 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-success">
                {profile.status === 'id_assigned' ? 'Profile Approved & Employee ID Assigned' : 'Profile Approved'}
              </div>
              {profile.employeeId && (
                <p className="text-xs text-success/80 mt-1">
                  Your Employee ID: <strong className="font-black">{profile.employeeId}</strong>
                  {profile.employeeIdAssignedBy && ` — Assigned by ${profile.employeeIdAssignedBy.name} (${profile.employeeIdAssignedBy.role})`}
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
                onClick={() => setActiveSection('profile_picture')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all group ${activeSection === 'profile_picture'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'hover:bg-white hover:shadow-sm text-foreground'
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${activeSection === 'profile_picture' ? 'bg-white/20' : 'bg-primary/10'
                  }`}>
                  <Camera size={16} className={activeSection === 'profile_picture' ? 'text-white' : 'text-primary'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">Profile Picture</div>
                </div>
                {profile.profilePictureUrl && (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${activeSection === 'profile_picture' ? 'bg-white/20' : 'bg-success/10'
                    }`}>
                    <Check size={11} className={activeSection === 'profile_picture' ? 'text-white' : 'text-success'} />
                  </div>
                )}
              </button>

              {/* Dynamic sections */}
              {activeSections.map((section) => {
                const IconComp = SECTION_ICONS[section.id] || FileText;
                const isActive = activeSection === section.id;
                const isCompleted = profile.completedSections[section.id];

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'hover:bg-white hover:shadow-sm text-foreground'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : isCompleted ? 'bg-success/10' : 'bg-primary/10'
                      }`}>
                      <IconComp size={16} className={isActive ? 'text-white' : isCompleted ? 'text-success' : 'text-primary'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{section.label}</div>
                      {section.description && (
                        <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/70' : 'text-muted'}`}>
                          {section.description}
                        </div>
                      )}
                    </div>
                    {isCompleted && (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-success/10'
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
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted">Progress</span>
                  <span className="text-sm font-black text-primary">{completionPercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-2 text-[10px] text-muted">
                  {activeSections.filter(s => profile.completedSections[s.id]).length} of {activeSections.length} sections completed
                </div>

                {profile.status === 'in_progress' && profile.lastSavedAt && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
                    <RefreshCw size={10} />
                    Saved {new Date(profile.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section Content ── */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
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
                    data={profile.personal}
                    onSave={(data) => handleSaveSection('personal', data)}
                    isSaving={isSaving}
                    readOnly={isReadOnly}
                  />
                )}

                {activeSection === 'bank' && (
                  <BankDetailsSection
                    data={profile.bank}
                    onSave={(data) => handleSaveSection('bank', data)}
                    isSaving={isSaving}
                    readOnly={isReadOnly}
                  />
                )}

                {activeSection === 'identity' && (
                  <IdentityDocumentsSection
                    data={profile.identity}
                    documents={profile.documents || []}
                    userId={user.id}
                    onSave={(data) => handleSaveSection('identity', data)}
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
                    data={profile.employment || []}
                    documents={profile.documents || []}
                    userId={user.id}
                    onSave={(data) => handleSaveSection('employment', data)}
                    isSaving={isSaving}
                    readOnly={isReadOnly}
                  />
                )}

                {activeSection === 'education' && (
                  <EducationSection
                    data={profile.education || []}
                    documents={profile.documents || []}
                    userId={user.id}
                    onSave={(data) => handleSaveSection('education', data)}
                    isSaving={isSaving}
                    readOnly={isReadOnly}
                  />
                )}

                {activeSection === 'certifications' && (
                  <CertificationsSection
                    data={profile.certifications || []}
                    documents={profile.documents || []}
                    userId={user.id}
                    onSave={(data) => handleSaveSection('certifications', data)}
                    isSaving={isSaving}
                    readOnly={isReadOnly}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-border-subtle bg-surface-subtle/20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrev}
              disabled={activeIdx <= 0 && activeSection !== 'profile_picture'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-surface-subtle transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={goToNext}
              disabled={activeIdx >= activeSections.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-surface-subtle transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
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

            {canSubmit && !isReadOnly && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><i className="pi pi-spin pi-spinner" /> Submitting...</>
                ) : incompleteSections.length > 0 ? (
                  <><Send size={15} /> Submit for Review (Docs Later)</>
                ) : (
                  <><Send size={15} /> Submit for Review</>
                )}
              </button>
            )}

            {isReadOnly && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-subtle text-xs text-muted font-bold">
                <Lock size={14} />
                Profile {profile.status === 'submitted' ? 'Under Review' : 'Locked'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
