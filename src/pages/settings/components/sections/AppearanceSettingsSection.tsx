import React from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { SettingItem, SettingSection } from '../SettingUI';

interface ThemeColor {
    name: string;
    color: string;
}

interface AppearanceSettingsSectionProps {
    darkMode: boolean;
    accentColor: string;
    themeColors: ThemeColor[];
    onDarkModeChange: (enabled: boolean) => void;
    onAccentColorChange: (color: string) => void;
}

export const AppearanceSettingsSection: React.FC<AppearanceSettingsSectionProps> = ({
    darkMode,
    accentColor,
    themeColors,
    onDarkModeChange,
    onAccentColorChange,
}) => {
    return (
        <SettingSection title="Appearance">
            <SettingItem
                icon={darkMode ? Moon : Sun}
                label="Dark Mode"
                description="Optimize use for low-light environments with a refined dark palette."
                control={
                    <InputSwitch checked={darkMode} onChange={(e) => onDarkModeChange(e.value)} />
                }
            />
            <SettingItem
                icon={Palette}
                label="Theme Accent Color"
                description="Customize the primary highlights of the system interface."
                control={
                    <div className="flex items-center gap-3">
                        {themeColors.map(({ color, name }) => {
                            const isSelected = accentColor.toLowerCase() === color.toLowerCase();
                            return (
                                <button
                                    key={color}
                                    type="button"
                                    title={name}
                                    onClick={() => onAccentColorChange(color)}
                                    className={`w-7 h-7 rounded-full cursor-pointer border-2 border-white shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-125 ${isSelected
                                            ? 'ring-2 ring-primary ring-offset-2 scale-110'
                                            : 'opacity-80 hover:opacity-100'
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
    );
};
