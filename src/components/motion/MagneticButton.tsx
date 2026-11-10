import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number; // 2 to 6 px
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 3.5,
  className = '',
  onClick,
  ...rest
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    // Check if pointer is fine and supports hover (mouse/trackpad, not touch)
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(mql.matches);

    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canHover || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    setOffset({
      x: deltaX * strength,
      y: deltaY * strength,
    });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: canHover ? `translate3d(${offset.x}px, ${offset.y}px, 0)` : undefined,
        transition: offset.x === 0 && offset.y === 0 ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.1s ease-out',
      }}
      className={`btn-shimmer cursor-pointer select-none ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
