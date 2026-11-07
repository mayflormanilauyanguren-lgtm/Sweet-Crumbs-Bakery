import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShoppingBag, Heart, User as UserIcon, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, targetId?: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAuth,
}) => {
  const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'home', label: 'Featured', targetId: 'featured-section' },
    { id: 'shop', label: 'Shop' },
    { id: 'categories', label: 'Categories' },
    { id: 'custom-cake', label: 'Custom Cake' },
    { id: 'promotions', label: 'Promotions' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'home', label: 'Feedback', targetId: 'feedback-section' },
  ];

  const handleLinkClick = (page: string, targetId?: string) => {
    onNavigate(page, targetId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Editorial Announcement Bar */}
      <aside aria-label="Announcement" className="bg-[#25140C] text-[#FAF7F2] text-[11px] py-1.5 px-4 text-center border-b border-[#3D2316] relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-medium">
          <Sparkles size={12} className="text-[#DE9344]" />
          <span>Freshly baked daily at 5:00 AM in Davao City · Free delivery on orders over ₱1,000</span>
          <span className="hidden sm:inline text-[#DE9344] font-bold">Use code SWEET10 for 10% off</span>
        </div>
      </aside>

      {/* Main Artisan Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-b border-[#F0E6D8] shadow-[0_2px_16px_rgba(45,26,18,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Tagline */}
            <button
              onClick={() => handleLinkClick('home')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF0E4] border border-[#E8D9C5] flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform duration-200">
                🍰
              </div>
              <div>
                <span className="font-display font-bold text-xl sm:text-2xl text-[#25140C] tracking-tight block leading-tight group-hover:text-[#B81D24] transition-colors">
                  Sweet Crumbs
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#9C8578] font-semibold block">
                  Artisan Bakery & Café
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-7">
              {navItems.map((item, idx) => {
                const isActive = currentPage === item.id && !item.targetId;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleLinkClick(item.id, item.targetId)}
                    className={`text-[13px] font-medium transition-colors relative py-2 cursor-pointer ${
                      isActive
                        ? 'text-[#B81D24] font-semibold'
                        : 'text-[#4A2718] hover:text-[#B81D24]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B81D24] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Medium screen Navigation (condensed) */}
            <nav className="hidden lg:flex xl:hidden items-center gap-5">
              {[
                { id: 'home', label: 'Home' },
                { id: 'shop', label: 'Shop' },
                { id: 'categories', label: 'Categories' },
                { id: 'custom-cake', label: 'Custom Cake' },
                { id: 'promotions', label: 'Promos' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' },
              ].map((item, idx) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={`med-${item.id}-${idx}`}
                    onClick={() => handleLinkClick(item.id)}
                    className={`text-[13px] font-medium transition-colors relative py-1 cursor-pointer ${
                      isActive
                        ? 'text-[#B81D24] font-semibold'
                        : 'text-[#4A2718] hover:text-[#B81D24]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B81D24] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Utility Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist */}
              <button
                onClick={onOpenWishlist}
                className="relative w-10 h-10 rounded-full bg-white border border-[#EBDCCB] flex items-center justify-center text-[#4A2718] hover:text-[#B81D24] hover:border-[#B81D24]/40 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                title="View Wishlist"
                aria-label="Wishlist"
              >
                <Heart size={18} className={wishlistCount > 0 ? 'fill-[#B81D24] text-[#B81D24]' : ''} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#25140C] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Shopping Bag / Cart */}
              <button
                onClick={onOpenCart}
                className="relative w-10 h-10 rounded-full bg-[#25140C] hover:bg-[#B81D24] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                title="View Shopping Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B81D24] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Account */}
              <button
                onClick={onOpenAuth}
                className="relative w-10 h-10 rounded-full bg-white border border-[#EBDCCB] flex items-center justify-center text-[#25140C] hover:border-[#B81D24]/40 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer overflow-hidden"
                title={user ? `Signed in as ${user.email}` : 'Sign In'}
                aria-label="Account"
              >
                {user ? (
                  <span className="font-bold text-xs text-[#25140C]">
                    {(profile?.name || user.email || 'U')[0].toUpperCase()}
                  </span>
                ) : (
                  <UserIcon size={18} />
                )}
              </button>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#25140C] hover:bg-[#FAF0E4] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-[#F0E6D8] space-y-1 bg-[#FFFDFB]">
              {navItems.map((item, idx) => (
                <button
                  key={`mobile-${item.id}-${idx}`}
                  onClick={() => handleLinkClick(item.id, item.targetId)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#25140C] hover:bg-[#FAF0E4] rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  {currentPage === item.id && !item.targetId && (
                    <span className="text-[#B81D24] text-xs font-bold">Current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  );
};
