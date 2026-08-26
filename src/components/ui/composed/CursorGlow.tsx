import { useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { selectAccentColor, selectDarkMode } from '@/store/slices/settingsSlice';

export function CursorGlow() {
  const accentColor = useAppSelector(selectAccentColor);
  const darkMode = useAppSelector(selectDarkMode);

  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  // Smooth physics spring for fluid background aura movement
  const springConfig = { damping: 28, stiffness: 170, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden select-none">
      {/* Background Soft Radial Glow Aura */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: accentColor,
          opacity: darkMode ? 0.18 : 0.09,
        }}
        className="absolute w-[500px] h-[500px] rounded-full blur-[110px] transition-colors duration-500"
      />

      {/* Subtle Inner Interactive Cursor Ring */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: accentColor,
          boxShadow: `0 0 15px ${accentColor}40`,
          opacity: darkMode ? 0.4 : 0.25,
        }}
        className="absolute w-7 h-7 rounded-full border border-dashed transition-colors duration-300 pointer-events-none"
      />
    </div>
  );
}
