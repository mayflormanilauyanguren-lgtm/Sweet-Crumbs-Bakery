import React, { useState, useEffect } from 'react';

interface ArtisanDoorEntranceProps {
  onComplete?: () => void;
}

export const ArtisanDoorEntrance: React.FC<ArtisanDoorEntranceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'initial' | 'logo' | 'tagline' | 'doors-parting' | 'finished'>('initial');
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('sc_entrance_shown') === 'true';
  });

  useEffect(() => {
    if (dismissed) {
      if (onComplete) onComplete();
      return;
    }

    // Step 1: Logo & background (0ms)
    setStage('logo');

    // Step 2: Tagline & expanding golden line (280ms)
    const t1 = setTimeout(() => {
      setStage('tagline');
    }, 280);

    // Step 3: Artisan doors parting smoothly (750ms)
    const t2 = setTimeout(() => {
      setStage('doors-parting');
    }, 750);

    // Step 4: Finished & unmounted (1150ms)
    const t3 = setTimeout(() => {
      setStage('finished');
      setDismissed(true);
      sessionStorage.setItem('sc_entrance_shown', 'true');
      if (onComplete) onComplete();
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dismissed, onComplete]);

  if (dismissed || stage === 'finished') {
    return null;
  }

  const handleSkip = () => {
    setDismissed(true);
    sessionStorage.setItem('sc_entrance_shown', 'true');
    if (onComplete) onComplete();
  };

  return (
    <aside
      aria-label="Welcome to Sweet Crumbs"
      onClick={handleSkip}
      className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center transition-opacity duration-500 ${
        stage === 'doors-parting' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Left Bakery Door Panel */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 bg-[#20120D] border-r border-[#3E2115] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          stage === 'doors-parting' ? '-translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Right Bakery Door Panel */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-[#20120D] border-l border-[#3E2115] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          stage === 'doors-parting' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Center Insignia & Warm Glow */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          stage === 'doors-parting'
            ? 'opacity-0 scale-95 blur-xs'
            : stage === 'tagline'
            ? 'opacity-100 scale-100 blur-none'
            : 'opacity-80 scale-98'
        }`}
      >
        {/* Artisan Bakery Seal */}
        <div className="w-16 h-16 rounded-full bg-[#2A1710] border-2 border-[#DE9344] p-1.5 shadow-[0_0_40px_rgba(222,147,68,0.3)] mb-4 flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="Sweet Crumbs Logo"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF7F2] tracking-tight">
          Sweet Crumbs
        </h2>

        {/* Expanding Golden Pastry Line */}
        <div
          className={`h-[1.5px] bg-gradient-to-r from-transparent via-[#DE9344] to-transparent my-3 transition-all duration-500 ease-out ${
            stage === 'tagline' ? 'w-48 opacity-100' : 'w-8 opacity-40'
          }`}
        />

        <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#DE9344] font-semibold">
          Artisan Bakery & Café · Davao City
        </p>

        <span className="text-[10px] text-[#A68F80] mt-3 font-light">
          Baking fresh for you...
        </span>
      </div>
    </aside>
  );
};
