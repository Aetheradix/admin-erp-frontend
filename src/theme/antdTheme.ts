import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

/**
 * Build a dynamic Ant Design theme based on the current accent color and dark mode.
 */
export function buildAntdTheme(accentColor: string, isDark: boolean): ThemeConfig {
  const hoverColor = darkenHex(accentColor, 15);

  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: accentColor,
      colorPrimaryHover: hoverColor,
      colorSuccess: '#059669',
      colorWarning: '#d97706',
      colorError: '#e11d48',
      colorInfo: accentColor,
      colorLink: accentColor,
      colorLinkHover: hoverColor,
      borderRadius: 6,
      fontFamily:
        '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      colorBgContainer: isDark ? '#1e1e1e' : '#ffffff',
      colorBgLayout: isDark ? '#141414' : '#f5f4f2',
      colorText: isDark ? '#e5e5e5' : '#1a1a1a',
      colorTextSecondary: isDark ? '#a3a3a3' : '#6b635e',
      colorBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      controlHeight: 40,
    },
    components: {
      Button: {
        borderRadius: 6,
        fontWeight: 500,
        controlHeight: 38,
      },
      Input: {
        borderRadius: 6,
        controlHeight: 48,
        paddingBlock: 12,
        paddingInline: 16,
      },
      Select: {
        borderRadius: 6,
        controlHeight: 48,
      },
      Table: {
        borderRadius: 8,
        headerBg: 'transparent',
        rowHoverBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(250, 249, 248, 0.8)',
      },
      Modal: {
        borderRadiusLG: 12,
        paddingContentHorizontalLG: 32,
      },
      Switch: {
        colorPrimary: accentColor,
      },
      Tag: {
        borderRadiusSM: 4,
      },
      DatePicker: {
        borderRadius: 6,
        controlHeight: 48,
      },
      Pagination: {
        borderRadius: 6,
        itemActiveBg: accentColor,
      },
    },
  };
}

/** Darken a hex color by a percentage (0-100) */
function darkenHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - percent / 100)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - percent / 100)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Static fallback (kept for compatibility) */
export const antdTheme: ThemeConfig = buildAntdTheme('#E8583A', false);
