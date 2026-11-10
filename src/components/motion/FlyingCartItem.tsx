import React, { useEffect, useState } from 'react';

export interface FlyingItemData {
  id: string;
  img: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface FlyingCartItemProps {
  item: FlyingItemData | null;
  onLanded: () => void;
}

export const FlyingCartItem: React.FC<FlyingCartItemProps> = ({ item, onLanded }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!item) {
      setAnimating(false);
      return;
    }

    // Trigger animation on next frame
    const raf = requestAnimationFrame(() => {
      setAnimating(true);
    });

    // Complete animation after 520ms
    const timer = setTimeout(() => {
      onLanded();
      setAnimating(false);
    }, 520);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [item, onLanded]);

  if (!item) return null;

  const currentX = animating ? item.endX : item.startX;
  const currentY = animating ? item.endY : item.startY;
  const currentScale = animating ? 0.35 : 1;
  const currentOpacity = animating ? 0.85 : 1;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate3d(${currentX - 24}px, ${currentY - 24}px, 0) scale(${currentScale})`,
        opacity: currentOpacity,
        transition: animating
          ? 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 500ms ease-in'
          : 'none',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#DE9344] shadow-[0_8px_24px_rgba(222,147,68,0.5)] bg-white"
    >
      <img src={item.img} alt="" className="w-full h-full object-cover" />
    </div>
  );
};
