import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { SettingSection } from '../SettingUI';

interface DangerZoneSectionProps {
    onCacheReset: () => void;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ onCacheReset }) => {
    return (
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
                    onClick={onCacheReset}
                    className="w-full h-14 rounded-xl! border border-error/30! text-error! hover:bg-error/15 font-black uppercase tracking-widest shadow-lg shadow-error/5 cursor-pointer transition-all active:scale-[0.99]"
                >
                    Reset Cache & Logout
                </Button>
            </div>
        </SettingSection>
    );
};
