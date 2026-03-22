export const labelVariants = {
  open: { opacity: 1, x: 0, width: 'auto', transition: { duration: 0.25, delay: 0.05 } },
  closed: { opacity: 0, x: -8, width: 0, transition: { duration: 0.2 } },
};

export const sidebarVariants = {
  open: () => ({ 
    width: 256,
    x: 0,
  }),
  closed: (isMobile: boolean) => ({ 
    width: isMobile ? 256 : 80,
    x: isMobile ? '-100%' : 0,
  }),
};
