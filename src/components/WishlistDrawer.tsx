import React from 'react';
import { Product } from '../types.ts';
import { X, Heart, Trash2, Plus } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#25140C]/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-[#FFFDFB] shadow-2xl flex flex-col z-10 border-l border-[#F0E6D8]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E6D8] bg-white">
            <div className="flex items-center gap-2.5">
              <Heart size={20} className="text-[#B81D24] fill-[#B81D24]" />
              <div>
                <h2 className="font-display text-lg font-bold text-[#25140C]">
                  Saved Favorites
                </h2>
                <span className="text-[11px] text-[#745C51]">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#745C51] hover:text-[#25140C] hover:bg-[#FAF3EB] transition-colors cursor-pointer"
              aria-label="Close wishlist"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#F5EDE3]">
            {wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAF3EB] border border-[#E8D9C5] flex items-center justify-center text-3xl mb-4 text-[#B81D24]">
                  ♡
                </div>
                <h3 className="font-display text-lg font-bold text-[#25140C] mb-1">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-[#745C51] max-w-xs mb-6 leading-relaxed">
                  Tap the heart icon on any cake, pastry, or espresso to save your favorites for later.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#25140C] hover:bg-[#B81D24] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
                >
                  Browse Bakery Menu
                </button>
              </div>
            ) : (
              wishlist.map((product) => (
                <div key={product.id} className="py-4 flex gap-4 items-center">
                  <button
                    onClick={() => {
                      if (onSelectProduct) {
                        onClose();
                        onSelectProduct(product);
                      }
                    }}
                    className="w-16 h-16 rounded-xl overflow-hidden border border-[#E2D2BE] bg-[#F7F2EA] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    title="View details and reviews"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div
                    onClick={() => {
                      if (onSelectProduct) {
                        onClose();
                        onSelectProduct(product);
                      }
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                    title="View details and reviews"
                  >
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C0772C] block">
                      {product.category}
                    </span>
                    <h4 className="font-display text-sm font-bold text-[#25140C] truncate hover:text-[#B81D24] transition-colors">
                      {product.name}
                    </h4>
                    <p className="font-display font-bold text-sm text-[#25140C] mt-0.5 tabular-nums">
                      ₱{product.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-[#25140C] hover:bg-[#B81D24] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(product)}
                      className="text-[11px] text-[#9C8578] hover:text-[#B81D24] flex items-center justify-center gap-1 py-1 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
