import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#22d3ee',
    colorBgBase: '#020617',
    colorBgContainer: '#0f172a',
    colorTextBase: '#e5e7eb',
    fontFamily: "'Montserrat', sans-serif",
    borderRadius: 12,
  },
  components: {
    Layout: {
      colorBgHeader: 'transparent',
      colorBgBody: '#020617',
      colorBgTrigger: '#020617',
    },
    Menu: {
      colorItemBg: 'transparent',
      colorItemText: 'rgba(229, 231, 235, 0.5)',
      colorItemTextSelected: '#020617',
      colorItemBgSelected: '#22d3ee',
      itemBorderRadius: 8,
    },
    Table: {
      colorBgContainer: 'transparent',
      headerColor: 'rgba(229, 231, 235, 0.5)',
      cellPaddingInline: 24,
      cellPaddingBlock: 16,
    },
    Input: {
      colorBgContainer: '#0f172a',
      colorBorder: 'rgba(148, 163, 184, 0.2)',
      activeBorderColor: '#22d3ee',
      hoverBorderColor: '#22d3ee',
    },
    Button: {
      colorPrimary: '#22d3ee',
      colorPrimaryHover: '#06b6d4',
      borderRadius: 999,
    }
  },
};
