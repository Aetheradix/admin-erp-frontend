import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#E8583A',
    colorPrimaryHover: '#d04a2e',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#e11d48',
    colorInfo: '#0284c7',
    borderRadius: 16,
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f4f2',
    colorText: '#1a1a1a',
    colorTextSecondary: '#6b635e',
    colorBorder: 'rgba(0, 0, 0, 0.06)',
    controlHeight: 44,
  },
  components: {
    Button: {
      borderRadius: 9999,
      fontWeight: 500,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 16,
      controlHeight: 56,
      paddingBlock: 16,
      paddingInline: 20,
    },
    Select: {
      borderRadius: 16,
      controlHeight: 56,
    },
    Table: {
      borderRadius: 16,
      headerBg: 'transparent',
      rowHoverBg: 'rgba(250, 249, 248, 0.8)',
    },
    Modal: {
      borderRadiusLG: 48,
      paddingContentHorizontalLG: 40,
    },
    Switch: {
      colorPrimary: '#E8583A',
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    DatePicker: {
      borderRadius: 16,
      controlHeight: 56,
    },
    Pagination: {
      borderRadius: 12,
      itemActiveBg: '#E8583A',
    },
  },
};
