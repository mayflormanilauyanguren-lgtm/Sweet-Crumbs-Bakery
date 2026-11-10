import React from 'react';
import { CartItem } from '../types.ts';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onOpenCheckout: () => void;
  appliedDiscount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onOpenCheckout,
  appliedDiscount,
}) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 1000 ? 0 : 50;
  const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#25140C]/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-[#FFFDFB] shadow-2xl flex flex-col z-10 border-l border-[#F0E6D8] animate-drawer-slide">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E6D8] bg-white">
            <div className="flex items-center gap-3">
              <span className="text-xl">🍰</span>
              <div>
                <h2 className="font-display text-lg font-bold text-[#25140C]">
                  Your Shopping Bag
                </h2>
                <span className="text-[11px] text-[#745C51]">
                  {cart.reduce((s, i) => s + i.qty, 0)} freshly baked items
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#745C51] hover:text-[#25140C] hover:bg-[#FAF3EB] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#F5EDE3]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAF3EB] border border-[#E8D9C5] flex items-center justify-center text-3xl mb-4">
                  🧁
                </div>
                <h3 className="font-display text-lg font-bold text-[#25140C] mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-[#745C51] max-w-xs mb-6 leading-relaxed">
                  Treat yourself or someone special to artisan celebration cakes, flaky pastries, and barista coffee.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#25140C] hover:bg-[#B81D24] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
                >
                  Explore Bakery Menu
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="py-4 flex gap-4 items-start">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-18 h-18 rounded-xl object-cover border border-[#E2D2BE] bg-[#F7F2EA] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-sm font-bold text-[#25140C] truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-[#9C8578] hover:text-[#B81D24] p-1 rounded-md transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {item.meta && (
                      <p className="text-[11px] text-[#745C51] mt-1 line-clamp-2 bg-[#FAF3EB] px-2.5 py-1 rounded-md border border-[#E8D9C5] leading-relaxed">
                        {item.meta}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#E2D2BE] rounded-full overflow-hidden bg-white">
                        <button
                          onClick={() => onUpdateQty(index, item.qty - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#25140C] hover:bg-[#FAF3EB] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-[#25140C]">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(index, item.qty + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#25140C] hover:bg-[#FAF3EB] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <span className="font-display font-bold text-sm text-[#25140C] tabular-nums">
                        ₱{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-[#F0E6D8] px-6 py-5 bg-white space-y-2.5">
              <div className="flex justify-between text-xs text-[#745C51]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#25140C] tabular-nums">₱{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-[#745C51]">
                <div className="flex items-center gap-1">
                  <span>Davao Delivery</span>
                  {subtotal >= 1000 ? (
                    <span className="text-[10px] bg-[#FAF3EB] text-[#C0772C] font-bold px-1.5 py-0.5 rounded border border-[#E8D9C5]">
                      FREE over ₱1,000
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#C0772C]">
                      (Add ₱{(1000 - subtotal).toLocaleString()} for free delivery)
                    </span>
                  )}
                </div>
                <span className="font-semibold text-[#25140C]">
                  {deliveryFee === 0 ? 'FREE' : `₱${deliveryFee}`}
                </span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-xs text-[#B81D24] font-semibold">
                  <span>Discount Voucher ({appliedDiscount}%)</span>
                  <span>-₱{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-[#25140C] pt-2.5 border-t border-[#F0E6D8]">
                <span>Total Amount</span>
                <span className="font-display text-lg text-[#25140C] tabular-nums">₱{grandTotal.toLocaleString()}</span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={onOpenCheckout}
                  className="w-full bg-[#25140C] hover:bg-[#B81D24] text-white text-xs sm:text-sm font-semibold py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag size={17} />
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-center text-xs font-semibold text-[#745C51] hover:text-[#25140C] py-2 transition-colors cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
