import React from 'react';
import { Globe, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { SettingItem, SettingSection } from '../SettingUI';

interface GeneralSettingsSectionProps {
    language: string;
    density: 'compact' | 'spacious';
    languages: { label: string; value: string }[];
    onLanguageChange: (lang: string) => void;
    onDensityChange: (density: 'compact' | 'spacious') => void;
}

export const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
    language,
    density,
    languages,
    onLanguageChange,
    onDensityChange,
}) => {
    const { t } = useTranslation();

    return (
        <SettingSection title={t('settings.generalSection')}>
            <SettingItem
                icon={Globe}
                label={t('settings.systemLanguage')}
                description={t('settings.systemLanguageDesc')}
                control={
                    <Select
                        options={languages}
                        value={language}
                        onChange={(e) => {
                            const val = typeof e === 'string' ? e : e?.value || e;
                            if (val) onLanguageChange(val as string);
                        }}
                        className="w-48!"
                    />
                }
            />
            <SettingItem
                icon={Monitor}
                label={t('settings.displayDensity')}
                description={t('settings.displayDensityDesc')}
                control={
                    <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg border border-border-subtle">
                        <Button
                            variant="ghost"
                            onClick={() => onDensityChange('compact')}
                            className={`h-10 px-4 rounded-lg! text-xs font-bold transition-all ${density === 'compact'
                                    ? 'bg-surface-elevated shadow-xs text-primary! font-black'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t('common.compact')}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onDensityChange('spacious')}
                            className={`h-10 px-4 rounded-lg! text-xs font-bold transition-all ${density === 'spacious'
                                    ? 'bg-surface-elevated shadow-xs text-primary! font-black'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t('common.spacious')}
                        </Button>
                    </div>
                }
            />
        </SettingSection>
    );
};
