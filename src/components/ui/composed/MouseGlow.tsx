import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectAccentColor, selectDarkMode } from '@/store/slices/settingsSlice';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

const MouseGlow = () => {
  const location = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const accentColor = useAppSelector(selectAccentColor);
  const darkMode = useAppSelector(selectDarkMode);

  // Restrict Cursor Glow strictly to Dashboard and Login / Auth pages
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';
  const isLogin = location.pathname === '/login' || location.pathname.startsWith('/auth');
  const isEnabled = isDashboard || isLogin;

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  const { r, g, b } = hexToRgb(accentColor || '#3b82f6');
  const opacity1 = darkMode ? 0.12 : 0.08;
  const opacity2 = darkMode ? 0.04 : 0.02;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 select-none"
      style={{
        background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(${r}, ${g}, ${b}, ${opacity1}), rgba(${r}, ${g}, ${b}, ${opacity2}) 45%, transparent 75%)`,
        transition: 'background 0.05s linear',
      }}
    />
  );
};

export default MouseGlow;
