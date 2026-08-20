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
} from 'lucide-react';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';

export function SettingsPage() {
  const { settings, updateSetting, LANGUAGES, THEME_COLORS } = useSettings();

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="System Settings"
        description="Configure your workspace environment, security protocols, and communication preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
        <SettingSection title="General & Localization">
          <SettingItem
            icon={Globe}
            label="System Language"
            description="Global language preference for menus, reports, and system messages."
            control={
              <Select
                options={LANGUAGES}
                value={settings.language}
                onChange={(e) => updateSetting('language', e.value)}
                className="w-48!"
              />
            }
          />
          <SettingItem
            icon={Monitor}
            label="Display Density"
            description="Choose between compact and spacious interface layouts."
            control={
              <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg">
                <Button
                  variant="ghost"
                  className="h-10 px-4 rounded-lg! bg-white shadow-xs text-primary!"
                >
                  Compact
                </Button>
                <Button variant="ghost" className="h-10 px-4 rounded-lg! text-muted!">
                  Spacious
                </Button>
              </div>
            }
          />
        </SettingSection>

        <SettingSection title="Account Security">
          <SettingItem
            icon={Shield}
            label="Two-Factor Authentication"
            description="Enhanced security layer for login and high-privilege actions."
            control={
              <InputSwitch
                checked={settings.twoFactor}
                onChange={(e) => updateSetting('twoFactor', e.value)}
              />
            }
          />
          <SettingItem
            icon={Lock}
            label="Session Timeout"
            description="Automatically sign out after 30 minutes of inactivity."
            control={<InputSwitch checked={true} disabled />}
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <SettingItem
            icon={Bell}
            label="Push Notifications"
            description="Receive real-time alerts for project updates and mentions."
            control={
              <InputSwitch
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.value)}
              />
            }
          />
          <SettingItem
            icon={Mail}
            label="Marketing & Digest"
            description="Weekly summary of company news and platform updates."
            control={
              <InputSwitch
                checked={settings.marketingEmails}
                onChange={(e) => updateSetting('marketingEmails', e.value)}
              />
            }
          />
        </SettingSection>

        <SettingSection title="Appearance">
          <SettingItem
            icon={settings.darkMode ? Moon : Sun}
            label="Dark Mode"
            description="Optimize use for low-light environments with a refined dark palette."
            control={
              <InputSwitch
                checked={settings.darkMode}
                onChange={(e) => updateSetting('darkMode', e.value)}
              />
            }
          />
          <SettingItem
            icon={Palette}
            label="Theme Accent Color"
            description="Customize the primary highlights of the system interface."
            control={
              <div className="flex items-center gap-2">
                {THEME_COLORS.map((color) => (
                  <div
                    key={color}
                    className="w-6 h-6 rounded-full cursor-pointer border-2 border-white shadow-sm ring-1 ring-border-subtle hover:scale-125 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            }
          />
        </SettingSection>

        <SettingSection title="Advanced & Data">
          <SettingItem
            icon={Database}
            label="Auto-Archive Records"
            description="Periodically move closed projects to the historical database."
            control={
              <InputSwitch
                checked={settings.autoArchive}
                onChange={(e) => updateSetting('autoArchive', e.value)}
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
                className="h-10 px-4 rounded-md! font-bold text-xs uppercase underline"
              >
                Manage Tokens
              </Button>
            }
          />
        </SettingSection>

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
                <p className="text-xs font-medium text-error/70 leading-relaxed italic">
                  Clearing the cache will perform a deep logout and refresh all local system
                  meta-data. This action cannot be undone.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full h-14 rounded-xl! border-error/30! text-error! hover:bg-error/10 font-black uppercase tracking-widest shadow-lg shadow-error/5"
            >
              Reset Cache & Logout
            </Button>
          </div>
        </SettingSection>
      </div>

      <div className="mt-10 p-10 rounded-xl bg-surface-subtle border border-border-strong flex flex-col lg:flex-row items-center justify-between gap-8 group">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-primary shadow-soft group-hover:scale-110 transition-transform duration-500">
            <Cpu size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
              System Status: <span className="text-success">Optimal</span>
            </h3>
            <p className="text-xs font-medium text-muted-foreground">
              Version 2.4.0 (Aetheradix Core) • Last optimized 12 hours ago
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          className="h-14 px-10 rounded-xl! font-black tracking-widest shadow-xl shadow-primary/20 bg-primary! text-white!"
        >
          Check for Updates
        </Button>
      </div>
    </div>
  );
}
