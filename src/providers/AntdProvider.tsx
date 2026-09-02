import { type ReactNode, useMemo, useEffect } from 'react';
import { ConfigProvider, App } from 'antd';
import { buildAntdTheme } from '@/theme/antdTheme';
import { useAppSelector } from '@/store/hooks';
import { selectAccentColor, selectDarkMode, selectDensity } from '@/store/slices/settingsSlice';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export const AntdProvider = ({ children }: { children: ReactNode }) => {
  const darkMode = useAppSelector(selectDarkMode);
  const accentColor = useAppSelector(selectAccentColor);
  const density = useAppSelector(selectDensity);

  const dynamicTheme = useMemo(
    () => buildAntdTheme(accentColor, darkMode),
    [accentColor, darkMode]
  );

  // Global Theme & CSS Variable Initializer (applies across ALL routes including Auth pages)
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    root.setAttribute('data-density', density || 'compact');

    const { r, g, b } = hexToRgb(accentColor || '#E8583A');
    const hoverR = Math.max(0, Math.round(r * 0.85));
    const hoverG = Math.max(0, Math.round(g * 0.85));
    const hoverB = Math.max(0, Math.round(b * 0.85));
    const hoverHex = `#${((hoverR << 16) | (hoverG << 8) | hoverB).toString(16).padStart(6, '0')}`;

    root.style.setProperty('--primary', accentColor || '#E8583A');
    root.style.setProperty('--accent', accentColor || '#E8583A');
    root.style.setProperty('--primary-hover', hoverHex);
    root.style.setProperty(
      '--primary-soft',
      darkMode ? `rgba(${r}, ${g}, ${b}, 0.15)` : `rgba(${r}, ${g}, ${b}, 0.08)`
    );
    root.style.setProperty('--primary-glow', `rgba(${r}, ${g}, ${b}, 0.2)`);
    root.style.setProperty(
      '--accent-light',
      darkMode ? `rgba(${r}, ${g}, ${b}, 0.18)` : `rgba(${r}, ${g}, ${b}, 0.1)`
    );
    root.style.setProperty('--info', accentColor || '#E8583A');

    // Dynamic Theme Cursor & Selection Styling
    let styleEl = document.getElementById('dynamic-theme-cursor') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-theme-cursor';
      document.head.appendChild(styleEl);
    }

    const strokeColor = darkMode ? '%23ffffff' : '%23000000';
    const encColor = encodeURIComponent(accentColor || '#E8583A');

    const defaultSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 3l7 18 3-7 7-3L3 3z' fill='${encColor}' stroke='${strokeColor}' stroke-width='1.5' stroke-linejoin='round'/></svg>`;
    const pointerSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 3l7 18 3-7 7-3L3 3z' fill='${encColor}' stroke='${strokeColor}' stroke-width='1.5' stroke-linejoin='round'/><circle cx='16.5' cy='16.5' r='4' fill='${encColor}' stroke='${strokeColor}' stroke-width='1.2'/></svg>`;

    styleEl.innerHTML = `
      * {
        caret-color: ${accentColor || '#E8583A'} !important;
      }
      ::selection {
        background-color: ${accentColor || '#E8583A'} !important;
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
    <ConfigProvider theme={dynamicTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
};
