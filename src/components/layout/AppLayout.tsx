import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/sidebar/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/composed/ConfirmDialog';
import { Toast } from '@/components/ui/composed/Toast';
import { CursorGlow } from '@/components/ui/composed/CursorGlow';
import { useAppSelector } from '@/store/hooks';
import { selectAccentColor, selectDarkMode, selectDensity } from '@/store/slices/settingsSlice';

import { useSessionTimeout } from '@/hooks/useSessionTimeout';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
    root.style.setProperty('--primary-glow', `rgba(${r}, ${g}, ${b}, 0.2)`);
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
        <Header onMenuClick={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-background custom-scrollbar">
          <div className="max-w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
