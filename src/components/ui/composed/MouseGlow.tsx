import { useEffect, useState } from 'react';
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
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const accentColor = useAppSelector(selectAccentColor);
  const darkMode = useAppSelector(selectDarkMode);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { r, g, b } = hexToRgb(accentColor || '#e8583a');
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
