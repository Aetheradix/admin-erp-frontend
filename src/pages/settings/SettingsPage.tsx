import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { SettingItem, SettingSection } from './components/SettingUI';
import { useSettings } from './hooks/useSettings';
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Lock,
  Moon,
  Sun,
  Monitor,
  Database,
  Share2,
  Trash2,
  Cpu,
  Check,
  RotateCw,
} from 'lucide-react';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { ApiTokenModal } from './components/ApiTokenModal';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog.utils';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function SettingsPage() {
  const {
    settings,
    updateLanguage,
    updateDensity,
    updateTwoFactor,
    updateSessionTimeout,
    updatePushNotifications,
    updateMarketingDigest,
    updateDarkMode,
    updateAccentColor,
    updateAutoArchive,
    LANGUAGES,
    THEME_COLORS,
  } = useSettings();

  const { logout } = useAuth();
  const navigate = useNavigate();

  // API Token modal visibility
  const [tokenModalVisible, setTokenModalVisible] = useState(false);

  // System status check for updates state
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [lastOptimizedTime, setLastOptimizedTime] = useState<Date>(() => {
    const saved = localStorage.getItem('aether_last_optimized');
    return saved ? new Date(saved) : new Date(Date.now() - 12 * 60 * 60 * 1000); // default 12 hours ago
  });
  const [relativeText, setRelativeText] = useState(() => dayjs(lastOptimizedTime).fromNow());

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeText(dayjs(lastOptimizedTime).fromNow());
    }, 30000);
    return () => clearInterval(interval);
  }, [lastOptimizedTime]);

  // Handle Check for Updates
  const handleCheckForUpdates = async () => {
    setIsCheckingUpdates(true);
    showToast({ severity: 'info', summary: 'Checking Updates', detail: 'Connecting to update servers...' });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const now = new Date();
    setLastOptimizedTime(now);
    localStorage.setItem('aether_last_optimized', now.toISOString());
    setRelativeText(dayjs(now).fromNow());
    setIsCheckingUpdates(false);

    showToast({
      severity: 'success',
      summary: 'System Up To Date',
      detail: 'Version 2.4.0 (Aetheradix Core) is running the latest build.',
    });
  };

  // Handle 2FA Toggle with confirmation
  const handleToggle2FA = (checked: boolean) => {
    if (!checked) {
      showConfirm({
        header: 'Disable Two-Factor Authentication',
        message: 'Disabling 2FA reduces your account security. High-privilege actions will no longer require dynamic verification codes. Are you sure?',
        accept: () => updateTwoFactor(false),
      });
    } else {
      updateTwoFactor(true);
    }
  };

  // Handle Cache Reset & Logout
  const handleCacheReset = () => {
    showConfirm({
      header: 'System Cache Reset & Deep Logout',
      message:
        'This action will erase all locally stored workspace settings, session tokens, cached metadata, and log you out immediately. This action cannot be undone. Do you wish to proceed?',
      accept: async () => {
        showToast({
          severity: 'warn',
          summary: 'Clearing Cache',
          detail: 'System cache cleared. Logging out...',
        });
        localStorage.clear();
        try {
          await logout();
        } catch {
          // Ignore API error on forced logout
        }
        navigate('/auth/login', { replace: true });
      },
    });
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="System Settings"
        description="Configure your workspace environment, security protocols, and communication preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
        {/* Section 1: General & Localization */}
        <SettingSection title="General & Localization">
          <SettingItem
            icon={Globe}
            label="System Language"
            description="Global language preference for menus, reports, and system messages."
            control={
              <Select
                options={LANGUAGES}
                value={settings.language}
                onChange={(e) => updateLanguage(e.value as string)}
                className="w-48!"
              />
            }
          />
          <SettingItem
            icon={Monitor}
            label="Display Density"
            description="Choose between compact and spacious interface layouts."
            control={
              <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg border border-border-subtle">
                <Button
                  variant="ghost"
                  onClick={() => updateDensity('compact')}
                  className={`h-10 px-4 rounded-lg! text-xs font-bold transition-all ${settings.density === 'compact'
                      ? 'bg-surface-elevated shadow-xs text-primary! font-black'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Compact
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => updateDensity('spacious')}
                  className={`h-10 px-4 rounded-lg! text-xs font-bold transition-all ${settings.density === 'spacious'
                      ? 'bg-surface-elevated shadow-xs text-primary! font-black'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Spacious
                </Button>
              </div>
            }
          />
        </SettingSection>

        {/* Section 2: Account Security */}
        <SettingSection title="Account Security">
          <SettingItem
            icon={Shield}
            label="Two-Factor Authentication"
            description="Enhanced security layer for login and high-privilege actions."
            control={
              <InputSwitch
                checked={settings.twoFactorEnabled}
                onChange={(e) => handleToggle2FA(e.value)}
              />
            }
          />
          <SettingItem
            icon={Lock}
            label="Session Timeout"
            description="Automatically sign out after 30 minutes of inactivity."
            control={
              <InputSwitch
                checked={settings.sessionTimeoutEnabled}
                onChange={(e) => updateSessionTimeout(e.value)}
              />
            }
          />
        </SettingSection>

        {/* Section 3: Notifications */}
        <SettingSection title="Notifications">
          <SettingItem
            icon={Bell}
            label="Push Notifications"
            description="Receive real-time alerts for project updates and mentions."
            control={
              <InputSwitch
                checked={settings.pushNotifications}
                onChange={(e) => updatePushNotifications(e.value)}
              />
            }
          />
          <SettingItem
            icon={Mail}
            label="Marketing & Digest"
            description="Weekly summary of company news and platform updates."
            control={
              <InputSwitch
                checked={settings.marketingDigest}
                onChange={(e) => updateMarketingDigest(e.value)}
              />
            }
          />
        </SettingSection>

        {/* Section 4: Appearance */}
        <SettingSection title="Appearance">
          <SettingItem
            icon={settings.darkMode ? Moon : Sun}
            label="Dark Mode"
            description="Optimize use for low-light environments with a refined dark palette."
            control={
              <InputSwitch
                checked={settings.darkMode}
                onChange={(e) => updateDarkMode(e.value)}
              />
            }
          />
          <SettingItem
            icon={Palette}
            label="Theme Accent Color"
            description="Customize the primary highlights of the system interface."
            control={
              <div className="flex items-center gap-3">
                {THEME_COLORS.map(({ color, name }) => {
                  const isSelected = settings.accentColor.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      title={name}
                      onClick={() => updateAccentColor(color)}
                      className={`w-7 h-7 rounded-full cursor-pointer border-2 border-white shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-125 ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select accent color ${name}`}
                    >
                      {isSelected && <Check size={14} className="text-white drop-shadow-md" />}
                    </button>
                  );
                })}
              </div>
            }
          />
        </SettingSection>

        {/* Section 5: Advanced & Data */}
        <SettingSection title="Advanced & Data">
          <SettingItem
            icon={Database}
            label="Auto-Archive Records"
            description="Periodically move closed projects to the historical database."
            control={
              <InputSwitch
                checked={settings.autoArchive}
                onChange={(e) => updateAutoArchive(e.value)}
              />
            }
          />
          <SettingItem
            icon={Share2}
            label="Integration API Access"
            description="Manage tokens for external system connections and bots."
            control={
              <Button
                variant="secondary"
                onClick={() => setTokenModalVisible(true)}
                className="h-10 px-4 rounded-md! font-bold text-xs uppercase underline tracking-wider cursor-pointer hover:bg-primary-soft hover:text-primary transition-colors"
              >
                Manage Tokens
              </Button>
            }
          />
        </SettingSection>

        {/* Section 6: Danger Zone */}
        <SettingSection title="Danger Zone">
          <div className="p-8 rounded-2xl border border-error/20 bg-error/5 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
                <Trash2 size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base font-black text-error uppercase tracking-tight">
                  System Cache Reset
                </span>
                <p className="text-xs font-medium text-error/80 leading-relaxed italic">
                  Clearing the cache will perform a deep logout and refresh all local system
                  meta-data. This action cannot be undone.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleCacheReset}
              className="w-full h-14 rounded-xl! border border-error/30! text-error! hover:bg-error/15 font-black uppercase tracking-widest shadow-lg shadow-error/5 cursor-pointer transition-all active:scale-[0.99]"
            >
              Reset Cache & Logout
            </Button>
          </div>
        </SettingSection>
      </div>

      {/* System Status Card */}
      <div className="mt-10 p-10 rounded-xl bg-surface-subtle border border-border-strong flex flex-col lg:flex-row items-center justify-between gap-8 group">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-surface-elevated flex items-center justify-center text-primary shadow-soft group-hover:scale-110 transition-transform duration-500 shrink-0">
            <Cpu size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
              System Status: <span className="text-success">Optimal</span>
            </h3>
            <p className="text-xs font-medium text-muted-foreground">
              Version 2.4.0 (Aetheradix Core) • Last optimized {relativeText}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleCheckForUpdates}
          disabled={isCheckingUpdates}
          className="h-14 px-10 rounded-xl! font-black tracking-widest shadow-xl shadow-primary/20 bg-primary! text-white! hover:opacity-95 cursor-pointer transition-all active:scale-[0.98]"
        >
          {isCheckingUpdates ? (
            <>
              <RotateCw size={18} className="animate-spin" />
              Checking...
            </>
          ) : (
            'Check for Updates'
          )}
        </Button>
      </div>

      {/* API Token Management Modal */}
      <ApiTokenModal
        visible={tokenModalVisible}
        onHide={() => setTokenModalVisible(false)}
      />
    </div>
  );
}
