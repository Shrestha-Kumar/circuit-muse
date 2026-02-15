import { useEffect, useRef } from "react";

const GridBackground = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, hsla(155, 100%, 50%, 0.04), transparent 40%)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 grid-bg" />
      <div ref={glowRef} className="absolute inset-0 transition-[background] duration-300" />
    </div>
  );
};

export default GridBackground;
