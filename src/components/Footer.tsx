import React from 'react';
import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onSecretPortalTrigger?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSecretPortalTrigger,
}) => {
  const [clickCount, setClickCount] = React.useState(0);

  const handleSecretClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        if (onSecretPortalTrigger) onSecretPortalTrigger();
        return 0;
      }
      return next;
    });

    setTimeout(() => {
      setClickCount(0);
    }, 1500);
  };
  return (
    <footer className="bg-[#20120D] text-[#FAF7F2] pt-16 pb-12 border-t border-[#341F16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#341F16]">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#341F16] border border-[#4D2E21] flex items-center justify-center text-xl">
                🍰
              </div>
              <div>
                <span className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight block">
                  Sweet Crumbs
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#DE9344] font-semibold block">
                  Artisan Bakery & Café
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#C8B8AB] leading-relaxed max-w-sm">
              Artisan cakes, slow-risen pastries, fresh dough, and signature espresso. Handcrafted from scratch with real butter, farm eggs, and pure love in Davao City.
            </p>
            <div className="text-xs text-[#DE9344] font-medium pt-1">
              Freshly baked every morning since 2024.
            </div>
          </div>

          {/* Quick Menu Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 style={{ color: '#FFFFFF' }} className="font-display text-sm font-bold !text-white text-white uppercase tracking-wider">
              Artisan Menu
            </h4>
            <ul className="space-y-2 text-xs text-[#C8B8AB]">
              <li>
                <button
                  onClick={() => onNavigate?.('shop')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Layered Celebration Cakes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('custom-cake')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Custom Cake Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('categories')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Artisan Doughnuts & Pastries
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('categories')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Specialty Coffee & Cold Brew
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('promotions')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Special Offers & Bundles
                </button>
              </li>
            </ul>
          </div>

          {/* Store Hours */}
          <div className="lg:col-span-2 space-y-3">
            <h4 style={{ color: '#FFFFFF' }} className="font-display text-sm font-bold !text-white text-white uppercase tracking-wider">
              Bakehouse Hours
            </h4>
            <ul className="space-y-2 text-xs text-[#C8B8AB]">
              <li className="flex items-start gap-2">
                <Clock size={14} className="text-[#DE9344] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-white font-medium">Monday – Saturday</span>
                  <span>8:00 AM – 8:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={14} className="text-[#DE9344] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-white font-medium">Sunday</span>
                  <span>9:00 AM – 6:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Davao City Store Location */}
          <div className="lg:col-span-3 space-y-3">
            <h4 style={{ color: '#FFFFFF' }} className="font-display text-sm font-bold !text-white text-white uppercase tracking-wider">
              Visit or Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C8B8AB]">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-[#DE9344] mt-0.5 shrink-0" />
                <span>Davao City, Davao del Sur, Philippines</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#DE9344] shrink-0" />
                <span>+63 900 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#DE9344] shrink-0" />
                <span>sweetcrumbs@example.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9C8578]">
          <p
            onClick={handleSecretClick}
            className="flex items-center gap-1 cursor-default select-none"
            title=""
          >
            <span>© {new Date().getFullYear()} Sweet Crumbs Bakery. Made with</span>
            <Heart size={12} className="text-[#B81D24] fill-current" />
            <span>in Davao City.</span>
          </p>

          <div className="flex items-center gap-4 text-[11px] text-[#745C51]">
            <span>100% Real Dairy Butter</span>
            <span>•</span>
            <span>Artisan Small-Batch Craft</span>
            <span>•</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
