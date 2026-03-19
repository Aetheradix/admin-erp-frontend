import { Bell, Globe, Lock, Palette, User } from 'lucide-react';

const sections = [
  { icon: User, title: 'Profile Information', desc: 'Manage your public and private details.' },
  { icon: Lock, title: 'Security & Access', desc: 'Configure passwords and multi-factor auth.' },
  { icon: Bell, title: 'Notification Settings', desc: 'Choose what alerts you want to see.' },
  { icon: Palette, title: 'Appearance & UI', desc: 'Customize themes, layout, and colors.' },
  { icon: Globe, title: 'Regional & Language', desc: 'Set your timezone and preferred language.' },
];

export default function SettingsPage() {
  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure your dashboard preferences and account security.</p>
      </div>

      <div className="bg-[#1b212f] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="divide-y divide-white/5">
          {sections.map((sec, i) => (
            <button key={i} className="w-full flex items-center gap-6 p-8 hover:bg-white/5 transition-all group text-left">
               <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-black transition-all">
                  <sec.icon size={24} />
               </div>
               <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{sec.title}</h3>
                  <p className="text-sm text-white/30">{sec.desc}</p>
               </div>
               <div className="text-white/10 group-hover:text-primary transition-colors pr-4">
                  <Globe size={20} className="rotate-90" /> {/* Just using as arrow placeholder */}
               </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
