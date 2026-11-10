import React from 'react';

export const FloatingCrumbs: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Golden Crumb 1 (Top Left) */}
      <div className="absolute top-12 left-[10%] w-2 h-2 rounded-full bg-[#DE9344]/35 blur-[0.5px] animate-crumb-1" />

      {/* Warm Butter Sparkle 2 (Center Right) */}
      <div
        className="absolute top-36 right-[14%] w-2.5 h-2.5 rounded-full bg-[#F3B562]/30 blur-[0.8px] animate-crumb-2"
        style={{ animationDelay: '1.2s' }}
      />

      {/* Tiny Flake 3 (Mid Left) */}
      <div
        className="absolute top-[60%] left-[6%] w-1.5 h-2 rounded-xs rotate-45 bg-[#B87326]/25 animate-crumb-1"
        style={{ animationDelay: '2.5s' }}
      />

      {/* Delicate Gold Crumb 4 (Bottom Right) */}
      <div
        className="absolute bottom-20 right-[22%] w-2 h-1.5 rounded-full bg-[#DE9344]/30 animate-crumb-2"
        style={{ animationDelay: '3.8s' }}
      />

      {/* Warm Sugar Shimmer 5 (Bottom Left) */}
      <div
        className="absolute bottom-8 left-[30%] w-1.5 h-1.5 rounded-full bg-[#FAF3EB]/50 blur-[0.4px] animate-crumb-1"
        style={{ animationDelay: '5s' }}
      />
    </div>
  );
};
