

import { useEffect, useState } from "react";

const MouseGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e:any) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.08), rgba(59, 130, 246, 0.03) 50%, transparent 85%)`,
      }}
    />
  );
};

export default MouseGlow;
