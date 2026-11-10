import React, { useEffect, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 750,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // If user prefers reduced motion, jump straight to end value
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(end);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;

      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setValue(end);
      }
    };

    const raf = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString();

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
