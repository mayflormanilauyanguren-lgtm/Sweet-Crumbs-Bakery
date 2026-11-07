import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { createNewOrder } from '../lib/dataService.ts';
import { X, Copy, Check, MapPin, Banknote } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedDiscount: number;
  onOrderPlaced: (order: Order) => void;
  onShowToast: (msg: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  appliedDiscount,
  onOrderPlaced,
  onShowToast,
}) => {
  const { user, profile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
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
      paymentMethod,
      paymentReference: paymentReference.trim() || null,
      items: cart,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total,
      status: 'Order Confirmed',
      createdAt: new Date().toISOString(),
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#25140C]/55 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#FFFDFB] rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-[#F0E6D8]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#745C51] hover:text-[#25140C] hover:bg-[#FAF3EB] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2.5 mb-6">
          <span className="text-2xl">🍰</span>
          <div>
            <h2 className="font-display text-2xl font-bold text-[#25140C]">Checkout</h2>
            <p className="text-xs text-[#745C51]">Complete your order with doorstep delivery in Davao City</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer info */}
          <section className="bg-white/80 p-4 sm:p-5 rounded-lg border border-[#f0e5d5] space-y-4">
            <h3 className="font-display text-base font-bold text-[#34170e] flex items-center gap-2">
              <span>👤</span> Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#34170e] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-md border border-[#eaddc8] focus:border-[#d3213a] focus:outline-hidden bg-white"
                  placeholder="e.g. Maria Santos"
                />
                {errors.name && <p className="text-xs text-[#c0392b] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#34170e] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-md border border-[#eaddc8] focus:border-[#d3213a] focus:outline-hidden bg-white"
                  placeholder="maria@example.com"
                />
                {errors.email && <p className="text-xs text-[#c0392b] mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#34170e] mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                className="w-full text-sm px-3.5 py-2.5 rounded-md border border-[#eaddc8] focus:border-[#d3213a] focus:outline-hidden bg-white"
                placeholder="+63 900 000 0000"
              />
              {errors.phone && <p className="text-xs text-[#c0392b] mt-1">{errors.phone}</p>}
            </div>
          </section>

          {/* Delivery Method */}
          <section className="bg-white/80 p-4 sm:p-5 rounded-lg border border-[#f0e5d5] space-y-4">
            <h3 className="font-display text-base font-bold text-[#34170e] flex items-center gap-2">
              <MapPin size={18} className="text-[#6a3220]" /> Delivery Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  deliveryMethod === 'delivery'
                    ? 'border-[#d3213a] bg-[#fff2dc]/60 text-[#34170e] font-semibold'
                    : 'border-[#eaddc8] bg-white text-[#7a5a4e]'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  checked={deliveryMethod === 'delivery'}
                  onChange={() => setDeliveryMethod('delivery')}
                  className="accent-[#d3213a]"
                />
                <span className="text-xs sm:text-sm">Home Delivery</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  deliveryMethod === 'pickup'
                    ? 'border-[#d3213a] bg-[#fff2dc]/60 text-[#34170e] font-semibold'
                    : 'border-[#eaddc8] bg-white text-[#7a5a4e]'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => setDeliveryMethod('pickup')}
                  className="accent-[#d3213a]"
                />
                <span className="text-xs sm:text-sm">Store Pickup (FREE)</span>
              </label>
            </div>

            {deliveryMethod === 'delivery' ? (
              <div>
                <label className="block text-xs font-semibold text-[#34170e] mb-1">
                  Delivery Address in Davao City *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-md border border-[#eaddc8] focus:border-[#d3213a] focus:outline-hidden bg-white"
                  placeholder="Street, Barangay, Davao City"
                />
                {errors.address && (
                  <p className="text-xs text-[#c0392b] mt-1">{errors.address}</p>
                )}
              </div>
            ) : (
              <div className="bg-[#fff2dc]/70 p-3.5 rounded-md border border-[#f0dfc8] text-xs text-[#6a3220]">
                <p className="font-bold">Sweet Crumbs Bakery — Pickup Counter</p>
                <p>Location: Davao City, Philippines</p>
                <p className="text-[#7a5a4e] mt-1">Available Mon–Sat: 8:00 AM – 8:00 PM</p>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="bg-white/80 p-4 sm:p-5 rounded-lg border border-[#f0e5d5] space-y-4">
            <h3 className="font-display text-base font-bold text-[#34170e] flex items-center gap-2">
              <Banknote size={18} className="text-[#6a3220]" /> Payment Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when delivered' },
                { id: 'gcash', label: 'GCash', sub: 'Send via GCash app' },
                { id: 'bank', label: 'Bank Transfer', sub: 'Online banking' },
                { id: 'card', label: 'Debit / Credit Card', sub: 'Last 4 digits only' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col gap-0.5 ${
                    paymentMethod === m.id
                      ? 'border-[#d3213a] bg-[#fff2dc]/60 text-[#34170e]'
                      : 'border-[#eaddc8] bg-white text-[#7a5a4e]'
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
                      className="accent-[#d3213a]"
                    />
                    <span className="text-xs sm:text-sm font-semibold">{m.label}</span>
                  </div>
                  <span className="text-[11px] opacity-75 pl-5">{m.sub}</span>
                </label>
              ))}
            </div>

            {/* GCash Panel */}
            {paymentMethod === 'gcash' && (
              <div className="bg-[#eef5ff] border border-[#b9d3fb] rounded-lg p-4 text-xs space-y-3">
                <p className="font-bold text-[#0a56c8] text-sm">Pay with GCash</p>
                <ol className="list-decimal pl-4 space-y-1.5 text-[#3a211a]">
                  <li>Open your GCash app and tap <strong>Send Money</strong>.</li>
                  <li>
                    Send exactly <strong className="text-[#0a56c8]">₱{total.toLocaleString()}</strong> to:
                    <div className="mt-2 bg-white p-2.5 rounded border border-[#cfe0fa] flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-gray-500">{GCASH_NAME}</div>
                        <div className="font-bold text-sm text-[#34170e] tracking-wide">
                          {GCASH_NUMBER}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyGcash}
                        className="bg-[#0a56c8] hover:bg-[#0846a3] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                      >
                        {copiedGcash ? <Check size={12} /> : <Copy size={12} />}
                        {copiedGcash ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </li>
                  <li>Enter the 13-digit <strong>Ref No.</strong> from your GCash receipt below:</li>
                </ol>
                <div>
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
                    className="w-full text-sm px-3.5 py-2.5 rounded-md border border-[#cfe0fa] focus:border-[#0a56c8] focus:outline-hidden bg-white"
                  />
                  {errors.paymentReference && (
                    <p className="text-xs text-[#c0392b] mt-1">{errors.paymentReference}</p>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="bg-[#fff2dc]/60 border border-[#f0dfc8] rounded-lg p-4 text-xs space-y-2">
                <p className="font-bold text-[#6a3220]">Bank Transfer Details</p>
                <p className="text-[#7a5a4e]">
                  Bank: BDO / BPI • Account: Sweet Crumbs Bakery • Account #: 0012-3456-7890
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[#34170e] mb-1">
                    Transfer Reference Code *
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => {
                      setPaymentReference(e.target.value);
                      if (errors.paymentReference) {
                        setErrors((prev) => ({ ...prev, paymentReference: '' }));
                      }
                    }}
                    placeholder="Enter bank reference number"
                    className="w-full text-sm px-3.5 py-2 rounded-md border border-[#eaddc8] focus:border-[#d3213a] bg-white"
                  />
                  {errors.paymentReference && (
                    <p className="text-xs text-[#c0392b] mt-1">{errors.paymentReference}</p>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-[#fff2dc]/60 border border-[#f0dfc8] rounded-lg p-4 text-xs space-y-2">
                <p className="font-bold text-[#6a3220]">Card Verification</p>
                <p className="text-[#7a5a4e]">
                  We confirm card payment upon delivery. Please provide the last 4 digits of your card for verification:
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[#34170e] mb-1">
                    Last 4 Digits *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={paymentReference}
                    onChange={(e) => {
                      setPaymentReference(e.target.value);
                      if (errors.paymentReference) {
                        setErrors((prev) => ({ ...prev, paymentReference: '' }));
                      }
                    }}
                    placeholder="e.g. 4821"
                    className="w-32 text-sm px-3.5 py-2 rounded-md border border-[#eaddc8] focus:border-[#d3213a] bg-white"
                  />
                  {errors.paymentReference && (
                    <p className="text-xs text-[#c0392b] mt-1">{errors.paymentReference}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Order Summary */}
          <section className="bg-[#fff2dc]/50 p-4 sm:p-5 rounded-lg border border-[#f0dfc8] space-y-2.5">
            <h3 className="font-display text-base font-bold text-[#34170e] mb-2">
              Order Summary ({cart.reduce((s, i) => s + i.qty, 0)} items)
            </h3>

            <div className="max-h-36 overflow-y-auto divide-y divide-[#f0dfc8] pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="py-1.5 flex justify-between text-xs text-[#7a5a4e]">
                  <span className="truncate pr-2">
                    {item.name} × {item.qty}
                  </span>
                  <span className="font-medium shrink-0">
                    ₱{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#eaddc8] space-y-1.5 text-xs text-[#7a5a4e]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₱${deliveryFee}`}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-[#d3213a] font-semibold">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span>-₱{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#34170e] pt-2 border-t border-[#eaddc8]">
                <span>Total Amount Due</span>
                <span className="text-[#6a3220] text-lg">₱{total.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#25140C] hover:bg-[#B81D24] disabled:opacity-50 text-white font-semibold py-3.5 rounded-full shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? 'Recording Order in Database...' : `Place Order — ₱${total.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};
