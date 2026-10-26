import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/sidebar/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/composed/ConfirmDialog';
import { Toast } from '@/components/ui/composed/Toast';
import { CursorGlow } from '@/components/ui/composed/CursorGlow';
import { useAppSelector } from '@/store/hooks';
import { selectAccentColor, selectDarkMode, selectDensity } from '@/store/slices/settingsSlice';

import { GeminiAiDrawer } from '@/components/ui/composed/GeminiAiDrawer';
import { Sparkles, Calendar, ChevronRight, X, FileText, AlertTriangle } from 'lucide-react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useGetEventsQuery } from '@/store/api/eventSlice';
import { PageAccessGuard } from '@/components/layout/PageAccessGuard';
import { useAuth } from '@/hooks/useAuth';
import {
  getEmployeeProfile,
  getFormConfiguration,
  calculateCompletionPercentage,
  type ProfileCompletionData,
} from '@/services/employeeProfileService';
import EmployeeProfileCompletion from '@/pages/employee-profile/EmployeeProfileCompletion';
import { NewUserWelcomeModal } from '@/components/ui/composed/NewUserWelcomeModal';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showProfileBanner, setShowProfileBanner] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [profileRefresh, setProfileRefresh] = useState(0);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleUpdate = () => setProfileRefresh((p) => p + 1);
    window.addEventListener('aether_employee_profiles_updated', handleUpdate);
    window.addEventListener('auth_user_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('aether_employee_profiles_updated', handleUpdate);
      window.removeEventListener('auth_user_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Check employee profile completion state
  const empProfile = useMemo<ProfileCompletionData | null>(() => {
    if (!user) return null;
    // Try email first (profiles are stored by email in seeded/localStorage data)
    const byEmail = user.email ? getEmployeeProfile(user.email) : null;
    return byEmail ?? (user.id ? getEmployeeProfile(user.id) : null);
  }, [user?.id, user?.email, isProfileModalOpen, profileRefresh]);

  const formConfig = useMemo(() => getFormConfiguration(), []);

  const profilePct = useMemo(() => {
    return calculateCompletionPercentage(empProfile, formConfig);
  }, [empProfile, formConfig]);

  const isProfileIncomplete =
    empProfile === null ||
    empProfile.status === 'incomplete' ||
    empProfile.status === 'in_progress' ||
    empProfile.status === 'changes_required';

  // ONLY show welcome popup for newly invited users coming from onboarding flow!
  useEffect(() => {
    const isNewlyInvited = sessionStorage.getItem('newly_invited_user_onboarded') === 'true';
    const isDismissed = sessionStorage.getItem('new_user_welcome_dismissed') === 'true';

    if (user && isNewlyInvited && !isDismissed && location.pathname !== '/profile-completion') {
      setIsWelcomeModalOpen(true);
    }
  }, [user, location.pathname]);

  const { data: events = [] } = useGetEventsQuery();
  const activeEvent = events.length > 0 ? events[0] : null;

  const darkMode = useAppSelector(selectDarkMode);
  const accentColor = useAppSelector(selectAccentColor);
  const density = useAppSelector(selectDensity);

  useSessionTimeout();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    root.setAttribute('data-density', density);

    const { r, g, b } = hexToRgb(accentColor);
    const hoverR = Math.max(0, Math.round(r * 0.85));
    const hoverG = Math.max(0, Math.round(g * 0.85));
    const hoverB = Math.max(0, Math.round(b * 0.85));
    const hoverHex = `#${((hoverR << 16) | (hoverG << 8) | hoverB).toString(16).padStart(6, '0')}`;

    root.style.setProperty('--primary', accentColor);
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--primary-hover', hoverHex);
    root.style.setProperty(
      '--primary-soft',
      darkMode ? `rgba(${r}, ${g}, ${b}, 0.15)` : `rgba(${r}, ${g}, ${b}, 0.08)`
    );
    root.style.setProperty('--primary-glow', `rgba(${r}, ${g}, ${b}, 0.25)`);
    root.style.setProperty(
      '--accent-light',
      darkMode ? `rgba(${r}, ${g}, ${b}, 0.18)` : `rgba(${r}, ${g}, ${b}, 0.1)`
    );
    root.style.setProperty('--info', accentColor);

    // ── Dynamic Theme Cursor & Accent Selection Styling ──
    let styleEl = document.getElementById('dynamic-theme-cursor') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-theme-cursor';
      document.head.appendChild(styleEl);
    }

    const strokeColor = darkMode ? '%23ffffff' : '%23000000';
    const encColor = encodeURIComponent(accentColor);

    const defaultSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 3l7 18 3-7 7-3L3 3z' fill='${encColor}' stroke='${strokeColor}' stroke-width='1.5' stroke-linejoin='round'/></svg>`;
    const pointerSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 3l7 18 3-7 7-3L3 3z' fill='${encColor}' stroke='${strokeColor}' stroke-width='1.5' stroke-linejoin='round'/><circle cx='16.5' cy='16.5' r='4' fill='${encColor}' stroke='${strokeColor}' stroke-width='1.2'/></svg>`;

    styleEl.innerHTML = `
      * {
        caret-color: ${accentColor} !important;
      }
      ::selection {
        background-color: ${accentColor} !important;
        color: #ffffff !important;
      }
      body, html {
        cursor: url("${defaultSvg}") 3 3, auto !important;
      }
      a, button, input[type="submit"], input[type="button"], input[type="reset"], select, [role="button"], .cursor-pointer, .ant-btn, .ant-select-selector, .ant-picker, .ant-checkbox-wrapper, .ant-radio-wrapper, .ant-switch, label[for] {
        cursor: url("${pointerSvg}") 3 3, pointer !important;
      }
    `;
  }, [darkMode, accentColor, density]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary selection:text-background relative font-body">
      <CursorGlow />
      <ConfirmDialog />
      <Toast />
      <GeminiAiDrawer visible={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />

      {/* Floating Gemini Copilot Trigger Button */}
      <button
        type="button"
        onClick={() => setIsCopilotOpen(true)}
        title="Open Aether Copilot (Gemini AI)"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group">
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-background" />
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-background shadow-sm border border-border-subtle">
        <Header onMenuClick={toggleSidebar} onCopilotClick={() => setIsCopilotOpen(true)} />

        {/* Global Event Happening Banner */}
        {showBanner && activeEvent && (
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-2.5 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-foreground truncate">
                <Calendar size={14} className="text-primary flex-shrink-0" />
                <span className="font-black text-primary uppercase text-[10px] tracking-wider px-2 py-0.5 bg-primary/15 rounded-md flex-shrink-0">
                  Happening Event
                </span>
                <span className="truncate">{activeEvent.title}</span>
                {activeEvent.time && (
                  <span className="text-muted font-semibold text-[11px] hidden sm:inline">
                    • {activeEvent.time}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="text-xs font-black text-primary hover:underline flex items-center gap-1">
                <span>View Event</span>
                <ChevronRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="text-muted hover:text-foreground p-1 rounded-lg transition-colors"
                aria-label="Dismiss event notification banner">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Profile Completion Notification Banner */}
        {showProfileBanner &&
          isProfileIncomplete &&
          location.pathname !== '/profile-completion' && (
            <div
              className={`px-6 py-2.5 flex items-center justify-between gap-4 border-b animate-in slide-in-from-top-2 duration-300 ${
                empProfile?.status === 'changes_required'
                  ? 'bg-warning/10 border-warning/30 text-warning'
                  : 'bg-primary/10 border-primary/20 text-foreground'
              }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    empProfile?.status === 'changes_required'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-primary/20 text-primary'
                  }`}>
                  {empProfile?.status === 'changes_required' ? (
                    <AlertTriangle size={13} />
                  ) : (
                    <FileText size={13} />
                  )}
                </div>
                <div className="text-xs font-semibold truncate flex items-center gap-2">
                  <span className="font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md bg-white/60">
                    {empProfile?.status === 'changes_required'
                      ? 'Revisions Required'
                      : 'Onboarding Profile'}
                  </span>
                  <span className="truncate">
                    {empProfile?.status === 'changes_required'
                      ? empProfile.reviewNotes ||
                        'The hiring team requested updates to your submitted onboarding documents.'
                      : `Your employee profile is ${profilePct}% complete. Please submit mandatory bank & identity details.`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className={`text-xs font-black px-3 py-1 rounded-xl shadow-xs transition-all flex items-center gap-1 ${
                    empProfile?.status === 'changes_required'
                      ? 'bg-warning text-white hover:bg-warning/90'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}>
                  <span>
                    {empProfile?.status === 'changes_required' ? 'Fix Now' : 'Complete Profile'}
                  </span>
                  <ChevronRight size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileBanner(false)}
                  className="text-muted hover:text-foreground p-1 rounded-lg transition-colors"
                  aria-label="Dismiss profile banner">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-background custom-scrollbar">
          <div className="max-w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <PageAccessGuard>
              <Outlet />
            </PageAccessGuard>
          </div>
        </main>
      </div>

      {/* Welcome Modal for Newly Invited User */}
      <NewUserWelcomeModal
        visible={isWelcomeModalOpen}
        userName={user?.username || 'Team Member'}
        userEmail={user?.email}
        userRole={user?.role}
        department={user?.department}
        onClose={() => {
          setIsWelcomeModalOpen(false);
          sessionStorage.setItem('new_user_welcome_dismissed', 'true');
        }}
      />

      {/* On-Demand Profile Completion Modal */}
      {isProfileModalOpen && (
        <EmployeeProfileCompletion fullPage={false} onClose={() => setIsProfileModalOpen(false)} />
      )}
    </div>
  );
}
