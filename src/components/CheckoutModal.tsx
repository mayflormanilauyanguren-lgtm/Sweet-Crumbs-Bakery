import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { createNewOrder } from '../lib/dataService.ts';
import {
  X,
  Copy,
  Check,
  MapPin,
  Banknote,
  Clock,
  Gift,
  FileText,
  Zap,
  ShoppingBag,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  directItem?: CartItem | null;
  appliedDiscount: number;
  onOrderPlaced: (order: Order) => void;
  onShowToast: (msg: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  directItem,
  appliedDiscount,
  onOrderPlaced,
  onShowToast,
}) => {
  const { user, profile } = useAuth();

  // Active items for this checkout: single instant item or full bag
  const activeItems = directItem ? [directItem] : cart;
  const isInstantMode = Boolean(directItem);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Express ASAP (Next available bake batch: ~45 mins)');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [hasGiftCard, setHasGiftCard] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'gcash' | 'bank' | 'card'>('cod');
  const [paymentReference, setPaymentReference] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedGcash, setCopiedGcash] = useState(false);

  const GCASH_NUMBER = '0900 000 0000';
  const GCASH_NAME = 'Sweet Crumbs Bakery';

  useEffect(() => {
    if (user || profile) {
      if (profile?.name) setName(profile.name);
      if (profile?.email || user?.email) setEmail(profile?.email || user?.email || '');
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.address) setAddress(profile.address);
    }
  }, [user, profile, isOpen]);

  const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = deliveryMethod === 'pickup' || subtotal === 0 || subtotal >= 1000 ? 0 : 50;
  const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleCopyGcash = () => {
    navigator.clipboard.writeText(GCASH_NUMBER.replace(/\s/g, ''));
    setCopiedGcash(true);
    onShowToast('GCash number copied to clipboard!');
    setTimeout(() => setCopiedGcash(false), 2500);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Valid email is required';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      errs.phone = 'Valid phone number is required';
    }
    if (deliveryMethod === 'delivery' && !address.trim()) {
      errs.address = 'Delivery address is required';
    }

    if (paymentMethod === 'gcash') {
      const cleanRef = paymentReference.replace(/[\s-]/g, '');
      if (!/^\d{13}$/.test(cleanRef)) {
        errs.paymentReference = 'Enter the 13-digit reference number from your GCash receipt';
      }
    } else if (paymentMethod === 'bank') {
      if (!paymentReference.trim()) {
        errs.paymentReference = 'Enter the bank transfer reference code';
      }
    } else if (paymentMethod === 'card') {
      if (!paymentReference.trim() || paymentReference.trim().length !== 4) {
        errs.paymentReference = 'Enter the last 4 digits of your card';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const orderId = 'SC-' + Math.floor(1000 + Math.random() * 9000);

    const orderPayload: Order = {
      id: orderId,
      userEmail: user?.email || email.trim(),
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      deliveryMethod,
      address: deliveryMethod === 'delivery' ? address.trim() : 'Sweet Crumbs Bakery Store Pickup (Davao City)',
      deliveryTimeSlot: deliveryTimeSlot.trim(),
      orderNotes: orderNotes.trim() || undefined,
      giftMessage: hasGiftCard && giftMessage.trim() ? giftMessage.trim() : undefined,
      paymentMethod,
      paymentReference: paymentReference.trim() || null,
      items: activeItems,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total,
      status: 'Order Confirmed',
      trackingStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const savedOrder = await createNewOrder(orderPayload);
      onOrderPlaced(savedOrder);
      onShowToast(`Order #${savedOrder.id} placed and recorded in Supabase database!`);
      onClose();
    } catch (err: any) {
      console.error('Checkout error:', err);
      onShowToast('Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1A0E08]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative bg-[#FFFDFB] rounded-3xl shadow-[0_25px_70px_rgba(32,18,13,0.35)] max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-[#DECDBA]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#745C51] hover:text-[#25140C] hover:bg-[#FAF3EB] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Modal Title Banner */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF3EB] border border-[#DECDBA] flex items-center justify-center text-2xl shadow-xs">
            {isInstantMode ? '⚡' : '🍰'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="checkout-title" className="font-display text-2xl font-bold text-[#25140C]">
                {isInstantMode ? 'Instant Express Checkout' : 'Bakery Checkout'}
              </h2>
              {isInstantMode && (
                <span className="bg-[#A8181E] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap size={10} />
                  <span>Instant Order</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#745C51]">
              {isInstantMode
                ? 'Order this item directly with priority kitchen baking and express fulfillment'
                : 'Complete your order with doorstep delivery in Davao City'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer info */}
          <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DECDBA] shadow-2xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[#25140C] uppercase tracking-wider flex items-center gap-2">
              <span>👤</span> Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#25140C] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] focus:border-[#A8181E] focus:outline-hidden bg-[#FAF6F0]"
                  placeholder="e.g. Maria Santos"
                />
                {errors.name && <p className="text-xs text-[#c0392b] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25140C] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] focus:border-[#A8181E] focus:outline-hidden bg-[#FAF6F0]"
                  placeholder="maria@example.com"
                />
                {errors.email && <p className="text-xs text-[#c0392b] mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25140C] mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] focus:border-[#A8181E] focus:outline-hidden bg-[#FAF6F0]"
                placeholder="+63 900 000 0000"
              />
              {errors.phone && <p className="text-xs text-[#c0392b] mt-1">{errors.phone}</p>}
            </div>
          </section>

          {/* Delivery Method & Time Slot */}
          <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DECDBA] shadow-2xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[#25140C] uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} className="text-[#DE9344]" />
              <span>Fulfillment & Time Slot</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'delivery'
                    ? 'border-[#A8181E] bg-[#FAF3EB] text-[#25140C] font-semibold shadow-xs'
                    : 'border-[#DECDBA] bg-white text-[#745C51]'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  checked={deliveryMethod === 'delivery'}
                  onChange={() => setDeliveryMethod('delivery')}
                  className="accent-[#A8181E]"
                />
                <span className="text-xs sm:text-sm">Doorstep Delivery</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'pickup'
                    ? 'border-[#A8181E] bg-[#FAF3EB] text-[#25140C] font-semibold shadow-xs'
                    : 'border-[#DECDBA] bg-white text-[#745C51]'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => setDeliveryMethod('pickup')}
                  className="accent-[#A8181E]"
                />
                <span className="text-xs sm:text-sm">Store Pickup (FREE)</span>
              </label>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#25140C] mb-1">
                Preferred Baking / Delivery Window *
              </label>
              <select
                value={deliveryTimeSlot}
                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] bg-[#FAF6F0] text-[#20120D] focus:border-[#A8181E] focus:outline-hidden"
              >
                <option value="Express ASAP (Next available bake batch: ~45 mins)">
                  ⚡ Express ASAP (Next available bake batch: ~45 mins)
                </option>
                <option value="Morning Oven Fresh (8:00 AM – 11:00 AM)">
                  🌅 Morning Oven Fresh (8:00 AM – 11:00 AM)
                </option>
                <option value="Afternoon Tea & Bakes (1:00 PM – 4:00 PM)">
                  ☕ Afternoon Tea & Bakes (1:00 PM – 4:00 PM)
                </option>
                <option value="Evening Celebration (5:00 PM – 8:00 PM)">
                  🌙 Evening Celebration (5:00 PM – 8:00 PM)
                </option>
              </select>
            </div>

            {deliveryMethod === 'delivery' ? (
              <div>
                <label className="block text-xs font-semibold text-[#25140C] mb-1">
                  Delivery Address in Davao City *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] focus:border-[#A8181E] focus:outline-hidden bg-[#FAF6F0]"
                  placeholder="House/Unit #, Street, Barangay, Davao City"
                />
                {errors.address && (
                  <p className="text-xs text-[#c0392b] mt-1">{errors.address}</p>
                )}
              </div>
            ) : (
              <div className="bg-[#FAF3EB] p-3.5 rounded-xl border border-[#DECDBA] text-xs text-[#20120D]">
                <p className="font-bold">Sweet Crumbs Davao Bakehouse Pickup Counter</p>
                <p className="text-[#6E574C]">Davao City, Philippines · Mon–Sat: 8:00 AM – 8:00 PM</p>
              </div>
            )}
          </section>

          {/* Baker's Notes & Dedication Greeting Card */}
          <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DECDBA] shadow-2xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[#25140C] uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-[#B87326]" />
              <span>Special Instructions & Gift Card</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#25140C] mb-1">
                Special Baker's Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Please pack with extra delicate care, dietary note, or gate/building instructions..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#DECDBA] bg-[#FAF6F0] focus:border-[#A8181E] focus:outline-hidden text-[#20120D]"
              />
            </div>

            <div className="pt-2 border-t border-[#F0E6D8]">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#25140C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGiftCard}
                  onChange={(e) => setHasGiftCard(e.target.checked)}
                  className="accent-[#A8181E] rounded"
                />
                <span className="flex items-center gap-1.5">
                  <Gift size={14} className="text-[#A8181E]" />
                  <span>This is a gift — include a handwritten Sweet Crumbs dedication card</span>
                </span>
              </label>

              {hasGiftCard && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="e.g. Happy 25th Birthday Sarah! Wishing you the sweetest day, Love Michael"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] bg-[#FAF3EB] text-[#20120D] focus:border-[#A8181E] focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DECDBA] shadow-2xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[#25140C] uppercase tracking-wider flex items-center gap-2">
              <Banknote size={16} className="text-[#DE9344]" />
              <span>Payment Method</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when delivered' },
                { id: 'gcash', label: 'GCash', sub: 'Instant mobile payment' },
                { id: 'bank', label: 'Bank Transfer', sub: 'BDO / BPI transfer' },
                { id: 'card', label: 'Debit / Card', sub: 'Card on delivery' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-0.5 ${
                    paymentMethod === m.id
                      ? 'border-[#A8181E] bg-[#FAF3EB] text-[#25140C] font-semibold shadow-xs'
                      : 'border-[#DECDBA] bg-white text-[#745C51]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => {
                        setPaymentMethod(m.id as any);
                        setPaymentReference('');
                        setErrors((prev) => ({ ...prev, paymentReference: '' }));
                      }}
                      className="accent-[#A8181E]"
                    />
                    <span className="text-xs font-semibold">{m.label}</span>
                  </div>
                  <span className="text-[10px] opacity-75 pl-5">{m.sub}</span>
                </label>
              ))}
            </div>

            {/* GCash Panel */}
            {paymentMethod === 'gcash' && (
              <div className="bg-[#eef5ff] border border-[#b9d3fb] rounded-xl p-4 text-xs space-y-3">
                <p className="font-bold text-[#0a56c8] text-sm">Pay with GCash</p>
                <div className="bg-white p-3 rounded-xl border border-[#cfe0fa] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-500">{GCASH_NAME}</div>
                    <div className="font-bold text-sm text-[#20120D] tracking-wide">
                      {GCASH_NUMBER}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyGcash}
                    className="bg-[#0a56c8] hover:bg-[#0846a3] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedGcash ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedGcash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#20120D] mb-1">
                    Enter GCash 13-Digit Reference Number *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    value={paymentReference}
                    onChange={(e) => {
                      setPaymentReference(e.target.value);
                      if (errors.paymentReference) {
                        setErrors((prev) => ({ ...prev, paymentReference: '' }));
                      }
                    }}
                    placeholder="e.g. 1234 567 890123"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#cfe0fa] focus:border-[#0a56c8] focus:outline-hidden bg-white text-[#20120D]"
                  />
                  {errors.paymentReference && (
                    <p className="text-xs text-[#c0392b] mt-1">{errors.paymentReference}</p>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="bg-[#FAF3EB] border border-[#DECDBA] rounded-xl p-4 text-xs space-y-2">
                <p className="font-bold text-[#20120D]">Bank Transfer</p>
                <p className="text-[#6E574C]">BDO / BPI · Sweet Crumbs Bakery · 0012-3456-7890</p>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => {
                    setPaymentReference(e.target.value);
                    if (errors.paymentReference) setErrors((prev) => ({ ...prev, paymentReference: '' }));
                  }}
                  placeholder="Enter bank reference number"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#DECDBA] bg-white text-[#20120D]"
                />
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-[#FAF3EB] border border-[#DECDBA] rounded-xl p-4 text-xs space-y-2">
                <p className="font-bold text-[#20120D]">Card Verification</p>
                <p className="text-[#6E574C]">Enter the last 4 digits of your card for driver verification:</p>
                <input
                  type="text"
                  maxLength={4}
                  value={paymentReference}
                  onChange={(e) => {
                    setPaymentReference(e.target.value);
                    if (errors.paymentReference) setErrors((prev) => ({ ...prev, paymentReference: '' }));
                  }}
                  placeholder="e.g. 4821"
                  className="w-32 text-xs px-3.5 py-2 rounded-xl border border-[#DECDBA] bg-white text-[#20120D]"
                />
              </div>
            )}
          </section>

          {/* Items & Breakdown */}
          <section className="bg-[#FAF6F0] p-4 sm:p-5 rounded-2xl border border-[#DECDBA] space-y-3">
            <h3 className="font-display text-sm font-bold text-[#25140C] uppercase tracking-wider flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-[#9C8578] font-normal">
                {activeItems.reduce((s, i) => s + i.qty, 0)} item{activeItems.length > 1 ? 's' : ''}
              </span>
            </h3>

            <div className="max-h-36 overflow-y-auto divide-y divide-[#EFE6D8] pr-1">
              {activeItems.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs text-[#6E574C]">
                  <div className="flex items-center gap-2 truncate pr-2">
                    {item.img && (
                      <img src={item.img} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-[#DECDBA]" />
                    )}
                    <span className="truncate font-medium text-[#20120D]">
                      {item.name} × {item.qty}
                    </span>
                  </div>
                  <span className="font-bold text-[#20120D] shrink-0">
                    ₱{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#DECDBA] space-y-1.5 text-xs text-[#6E574C]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₱${deliveryFee}`}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-[#A8181E] font-semibold">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span>-₱{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#20120D] pt-2 border-t border-[#DECDBA]">
                <span>Total Amount Due</span>
                <span className="text-[#A8181E] text-lg">₱{total.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#20120D] hover:bg-[#A8181E] disabled:opacity-50 text-white font-semibold py-4 rounded-full shadow-lg transition-all duration-200 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            {isInstantMode ? <Zap size={16} /> : <ShoppingBag size={16} />}
            <span>{isSubmitting ? 'Recording Order in Database...' : (isInstantMode ? `Place Instant Order — ₱${total.toLocaleString()}` : `Place Order — ₱${total.toLocaleString()}`)}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
