import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { SettingItem, SettingSection } from './components/SettingUI';
import { 
  Bell, Shield, Palette, Globe, Mail, Lock, Moon, Sun, 
  Monitor, Database, Share2, Trash2, Cpu
} from 'lucide-react';
import { InputSwitch } from 'primereact/inputswitch';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { classNames } from 'primereact/utils';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    marketingEmails: false,
    twoFactor: true,
    darkMode: false,
    language: 'English',
    autoArchive: true,
  });

  const LANGUAGES = [
    { label: 'English (US)', value: 'English' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'German', value: 'German' },
    { label: 'French', value: 'French' },
  ];

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="System Settings"
        description="Configure your workspace environment, security protocols, and communication preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
        {/* General Settings */}
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
               <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl">
                 <Button variant="ghost" className="h-10 px-4 rounded-lg! bg-white shadow-xs text-primary!">Compact</Button>
                 <Button variant="ghost" className="h-10 px-4 rounded-lg! text-muted!">Spacious</Button>
               </div>
            }
          />
        </SettingSection>

        {/* Security Settings */}
        <SettingSection title="Account Security">
          <SettingItem
            icon={Shield}
            label="Two-Factor Authentication"
            description="Enhanced security layer for login and high-privilege actions."
            control={
              <InputSwitch 
                checked={settings.twoFactor} 
                onChange={(e) => updateSetting('twoFactor', e.value)} 
                pt={{
                  root: ({ props }: any) => ({
                    className: classNames('w-12 h-7 rounded-full transition-all duration-300', 
                      props.checked ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-border-strong')
                  }),
                  slider: ({ props }: any) => ({
                    className: classNames(
                      'before:content-[""] before:absolute before:top-[4px] before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 before:shadow-sm',
                      props.checked ? 'before:left-[22px]' : 'before:left-[4px]'
                    )
                  })
                }}
              />
            }
          />
          <SettingItem
            icon={Lock}
            label="Session Timeout"
            description="Automatically sign out after 30 minutes of inactivity."
            control={
              <InputSwitch 
                checked={true} 
                disabled 
                pt={{
                  root: ({ props }: any) => ({
                    className: classNames('w-12 h-7 rounded-full opacity-50 cursor-not-allowed transition-all duration-300', 
                      props.checked ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-border-strong')
                  }),
                  slider: ({ props }: any) => ({
                    className: classNames(
                      'before:content-[""] before:absolute before:top-[4px] before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 before:shadow-sm',
                      props.checked ? 'before:left-[22px]' : 'before:left-[4px]'
                    )
                  })
                }}
              />
            }
          />
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="Notifications">
          <SettingItem
            icon={Bell}
            label="Push Notifications"
            description="Receive real-time alerts for project updates and mentions."
            control={
              <InputSwitch 
                checked={settings.notifications} 
                onChange={(e) => updateSetting('notifications', e.value)} 
                pt={{
                  root: ({ props }: any) => ({
                    className: classNames('w-12 h-7 rounded-full transition-all duration-300', 
                      props.checked ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-border-strong')
                  }),
                  slider: ({ props }: any) => ({
                    className: classNames(
                      'before:content-[""] before:absolute before:top-[4px] before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 before:shadow-sm',
                      props.checked ? 'before:left-[22px]' : 'before:left-[4px]'
                    )
                  })
                }}
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
                pt={{
                  root: ({ props }: any) => ({
                    className: classNames('w-12 h-7 rounded-full transition-all duration-300', 
                      props.checked ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-border-strong')
                  }),
                  slider: ({ props }: any) => ({
                    className: classNames(
                      'before:content-[""] before:absolute before:top-[4px] before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 before:shadow-sm',
                      props.checked ? 'before:left-[22px]' : 'before:left-[4px]'
                    )
                  })
                }}
              />
            }
          />
        </SettingSection>

        {/* Appearance Settings */}
        <SettingSection title="Appearance">
          <SettingItem
            icon={settings.darkMode ? Moon : Sun}
            label="Dark Mode"
            description="Optimize use for low-light environments with a refined dark palette."
            control={
              <InputSwitch 
                checked={settings.darkMode} 
                onChange={(e) => updateSetting('darkMode', e.value)} 
                pt={{
                  root: ({ props }: any) => ({
                    className: classNames('w-12 h-7 rounded-full transition-all duration-300', 
                      props.checked ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-border-strong')
                  }),
                  slider: ({ props }: any) => ({
                    className: classNames(
                      'before:content-[""] before:absolute before:top-[4px] before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 before:shadow-sm',
                      props.checked ? 'before:left-[22px]' : 'before:left-[4px]'
                    )
                  })
                }}
              />
            }
          />
          <SettingItem
            icon={Palette}
            label="Theme Accent Color"
            description="Customize the primary highlights of the system interface."
            control={
               <div className="flex items-center gap-2">
                 {['#F05D5E', '#3B82F6', '#10B981', '#F59E0B'].map(color => (
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

        {/* Advanced & Data */}
        <SettingSection title="Advanced & Data">
           <SettingItem
             icon={Database}
             label="Auto-Archive Records"
             description="Periodically move closed projects to the historical database."
             control={
               <InputSwitch 
                 checked={settings.autoArchive} 
                 onChange={(e) => updateSetting('autoArchive', e.value)} 
                 pt={{
                  root: ({ props }: any) => ({
                    className: classNames('w-12 h-7 rounded-full transition-all duration-300', 
                      props.checked ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-border-strong')
                  }),
                  slider: ({ props }: any) => ({
                    className: classNames(
                      'before:content-[""] before:absolute before:top-[4px] before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-all before:duration-300 before:shadow-sm',
                      props.checked ? 'before:left-[22px]' : 'before:left-[4px]'
                    )
                  })
                }}
               />
             }
           />
           <SettingItem
            icon={Share2}
            label="Integration API Access"
            description="Manage tokens for external system connections and bots."
            control={
              <Button variant="secondary" className="h-10 px-4 rounded-xl! font-bold text-xs uppercase underline">Manage Tokens</Button>
            }
          />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Danger Zone">
           <div className="p-8 rounded-4xl border border-error/20 bg-error/5 flex flex-col gap-6">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-3xl bg-error/10 flex items-center justify-center text-error shrink-0">
                    <Trash2 size={24} />
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-base font-black text-error uppercase tracking-tight">System Cache Reset</span>
                    <p className="text-xs font-medium text-error/70 leading-relaxed italic">
                      Clearing the cache will perform a deep logout and refresh all local system meta-data.
                      This action cannot be undone.
                    </p>
                 </div>
              </div>
              <Button variant="ghost" className="w-full h-14 rounded-3xl! border-error/30! text-error! hover:bg-error/10 font-black uppercase tracking-widest shadow-lg shadow-error/5">
                Reset Cache & Logout
              </Button>
           </div>
        </SettingSection>
      </div>

      {/* System Status Footer */}
      <div className="mt-10 p-10 rounded-4xl bg-surface-subtle border border-border-strong flex flex-col lg:flex-row items-center justify-between gap-8 group">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-primary shadow-soft group-hover:scale-110 transition-transform duration-500">
               <Cpu size={32} />
            </div>
            <div className="flex flex-col gap-1">
               <h3 className="text-xl font-black text-foreground uppercase tracking-tight">System Status: <span className="text-success">Optimal</span></h3>
               <p className="text-xs font-medium text-muted-foreground">Version 2.4.0 (Aetheradix Core) • Last optimized 12 hours ago</p>
            </div>
         </div>
         <Button variant="primary" className="h-14 px-10 rounded-3xl! font-black tracking-widest shadow-xl shadow-primary/20 bg-primary! text-white!">
           Check for Updates
         </Button>
      </div>
    </div>
  );
}
