import { useEffect, useState } from "react";

const MouseGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30"
      style={{
        background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(232, 88, 58, 0.09), rgba(232, 88, 58, 0.03) 45%, transparent 75%)`,
        transition: 'background 0.05s linear',
      }}
    />
  );
};

export default MouseGlow;
