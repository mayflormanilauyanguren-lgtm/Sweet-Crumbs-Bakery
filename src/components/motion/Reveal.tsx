import React, { useEffect, useRef, useState } from 'react';

export type RevealVariant =
  | 'fade-up'
  | 'fade-in'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in'
  | 'blur-reveal'
  | 'image-reveal';

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  threshold?: number;
  className?: string;
  as?: React.ElementType;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 550,
  threshold = 0.12,
  className = '',
  as: Component = 'div',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user prefers reduced motion, show immediately without animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const el = ref.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold]);

  // Variant-specific styles
  const getInitialStyle = (): React.CSSProperties => {
    if (isVisible) {
      return {
        opacity: 1,
        transform: 'none',
        filter: 'none',
        clipPath: variant === 'image-reveal' ? 'inset(0 0 0 0)' : undefined,
        transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      };
    }

    switch (variant) {
      case 'fade-up':
        return {
          opacity: 0,
          transform: 'translateY(28px)',
          transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };
      case 'fade-in':
        return {
          opacity: 0,
          transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };
      case 'slide-left':
        return {
          opacity: 0,
          transform: 'translateX(36px)',
          transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };
      case 'slide-right':
        return {
          opacity: 0,
          transform: 'translateX(-36px)',
          transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };
      case 'scale-in':
        return {
          opacity: 0,
          transform: 'scale(0.94) translateY(14px)',
          transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };
      case 'blur-reveal':
        return {
          opacity: 0,
          transform: 'translateY(16px)',
          filter: 'blur(8px)',
          transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };
      case 'image-reveal':
        return {
          opacity: 0,
          clipPath: 'inset(0 100% 0 0)',
          transform: 'scale(1.04)',
          transition: `all ${duration + 200}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms`,
        };
      default:
        return {
          opacity: 0,
          transform: 'translateY(24px)',
          transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };
    }
  };

  return (
    <Component
      ref={ref}
      style={getInitialStyle()}
      className={`will-change-transform ${className}`}
    >
      {children}
    </Component>
  );
};
