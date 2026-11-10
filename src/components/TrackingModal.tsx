import React, { useState, useEffect } from 'react';
import { Order } from '../types.ts';
import { subscribeToOrderUpdates, fetchOrderById, getTrackingStepFromStatus } from '../lib/dataService.ts';
import { isSupabaseConfigured } from '../lib/supabase.ts';
import {
  X,
  Clock,
  MapPin,
  PackageCheck,
  CheckCircle2,
  Truck,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Search,
  Gift,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose, order: initialOrder }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [searchOrderId, setSearchOrderId] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync with initial order prop when modal opens
  useEffect(() => {
    if (initialOrder) {
      setCurrentOrder(initialOrder);
      setSearchOrderId(initialOrder.id);
    }
  }, [initialOrder, isOpen]);

  // Real-time listener for current order updates from Supabase
  useEffect(() => {
    if (!isOpen || !currentOrder?.id) return;

    const unsubscribe = subscribeToOrderUpdates(currentOrder.id, (freshOrder) => {
      setCurrentOrder(freshOrder);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, currentOrder?.id]);

  if (!isOpen) return null;

  const handleManualRefresh = async () => {
    if (!currentOrder?.id) return;
    setIsSyncing(true);
    try {
      const fresh = await fetchOrderById(currentOrder.id);
      if (fresh) {
        setCurrentOrder(fresh);
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  };

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const found = await fetchOrderById(searchOrderId.trim());
      if (found) {
        setCurrentOrder(found);
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setSearchError(`Order #${searchOrderId.trim()} could not be found in our database.`);
      }
    } catch {
      setSearchError('Error querying database. Please check your order ID.');
    } finally {
      setIsSearching(false);
    }
  };

  const isDelivery = currentOrder?.deliveryMethod === 'delivery';
  const status = currentOrder?.status || 'Order Confirmed';
  const currentStep = currentOrder?.trackingStep || getTrackingStepFromStatus(status);
  const isCancelled = status.toLowerCase().includes('cancel');

  const steps = [
    {
      num: 1,
      title: 'Order Confirmed',
      desc: 'Ticket queued in database & recipe sent to baker',
      icon: PackageCheck,
      time: '0 min',
    },
    {
      num: 2,
      title: 'Baking & In Oven',
      desc: 'Pure European butter creamed, dough proved & oven baked',
      icon: Sparkles,
      time: '15–25 min',
    },
    {
      num: 3,
      title: 'Artisan Decorating & QA',
      desc: 'Hand piping, fruit topping, and quality seal applied',
      icon: CheckCircle2,
      time: '30–40 min',
    },
    {
      num: 4,
      title: isDelivery ? 'Dispatched with Courier' : 'Ready at Store Counter',
      desc: isDelivery ? 'En route in temperature-controlled bag' : 'Available for pickup at Davao bakehouse',
      icon: Truck,
      time: '45–55 min',
    },
    {
      num: 5,
      title: isDelivery ? 'Delivered to Doorstep' : 'Collected by Customer',
      desc: 'Freshly baked moments ready to savor',
      icon: ShoppingBag,
      time: 'Delivered',
    },
  ];

  // Calculate progress percentage
  const progressPercent = isCancelled ? 0 : Math.min(100, Math.max(10, (currentStep / 5) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracking-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1A0E08]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative bg-[#FFFDFB] rounded-3xl shadow-[0_25px_70px_rgba(32,18,13,0.35)] max-w-2xl w-full border border-[#DECDBA] overflow-hidden flex flex-col max-h-[92vh] animate-modal-scale">
        
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#F0E6D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FAF3EB] border border-[#DECDBA] flex items-center justify-center text-sm">
              🍰
            </div>
            <div>
              <h2 id="tracking-modal-title" className="font-display font-bold text-base text-[#20120D] leading-tight">
                Real-Time Order Tracking
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-[#9C8578]">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Live Database Sync</span>
                </span>
                <span>•</span>
                <span>Updated: {lastSyncedTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isSyncing}
              className="p-2 rounded-full text-[#6E574C] hover:text-[#20120D] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              title="Refresh order status from Supabase"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin text-[#B81D24]' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#6E574C] hover:text-[#20120D] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          
          {/* Order Search / Switch Bar */}
          <form onSubmit={handleSearchOrder} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-3 text-[#9C8578]" />
              <input
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="Track another order (e.g. SC-1024 or full ID)..."
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DECDBA] bg-white focus:outline-hidden focus:border-[#A8181E] text-[#20120D]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-[#20120D] hover:bg-[#A8181E] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              {isSearching ? 'Checking...' : 'Track'}
            </button>
          </form>

          {searchError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {currentOrder ? (
            <>
              {/* Order Hero Status Card */}
              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#20120D] via-[#2A150E] to-[#20120D] text-white border border-[#442316] shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#DE9344] text-[11px] font-bold uppercase tracking-wider border border-white/15">
                      <Clock size={12} />
                      <span>{isCancelled ? 'Order Cancelled' : status}</span>
                    </div>
                    <h3 className="font-display font-bold text-2xl text-white">
                      Order #{currentOrder.id}
                    </h3>
                    <p className="text-xs text-[#D5C2AD]">
                      Placed on {new Date(currentOrder.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right sm:border-l sm:border-white/15 sm:pl-6 shrink-0">
                    <span className="text-[11px] uppercase tracking-wider text-[#D5C2AD] block">
                      Estimated {isDelivery ? 'Delivery' : 'Pickup'}
                    </span>
                    <span className="font-display font-bold text-xl text-[#DE9344]">
                      {isCancelled ? 'N/A' : (isDelivery ? '40–55 mins' : '25–35 mins')}
                    </span>
                    <span className="text-[10px] text-gray-300 block">Davao City Bakehouse</span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                {!isCancelled && (
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold text-[#D5C2AD]">
                      <span>Kitchen Queue</span>
                      <span className="text-[#DE9344]">{Math.round(progressPercent)}% Completed</span>
                      <span>{isDelivery ? 'Doorstep Handover' : 'Counter Ready'}</span>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-[#C0772C] via-[#DE9344] to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-lg"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Live Stepper Timeline */}
              <div className="bg-white rounded-3xl p-6 border border-[#DECDBA] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0E6D8]">
                  <h4 className="font-display font-bold text-sm text-[#20120D] uppercase tracking-wider">
                    Bakehouse Journey Timeline
                  </h4>
                  <span className="text-[11px] text-[#9C8578]">
                    Step {currentStep} of 5
                  </span>
                </div>

                <div className="space-y-4">
                  {steps.map((st) => {
                    const isDone = !isCancelled && currentStep >= st.num;
                    const isCurrent = !isCancelled && currentStep === st.num;
                    const Icon = st.icon;

                    return (
                      <div key={st.num} className="flex items-start gap-4 relative">
                        {/* Connecting Line */}
                        {st.num < 5 && (
                          <div
                            className={`absolute left-4 top-8 w-0.5 h-10 ${
                              isDone && currentStep > st.num ? 'bg-[#A8181E]' : 'bg-[#EFE6D8]'
                            }`}
                          />
                        )}

                        {/* Step Icon Badge */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                            isCurrent
                              ? 'bg-[#A8181E] text-white shadow-md ring-4 ring-[#A8181E]/20 scale-110'
                              : isDone
                              ? 'bg-[#20120D] text-white'
                              : 'bg-[#FAF6F0] text-[#9C8578] border border-[#DECDBA]'
                          }`}
                        >
                          <Icon size={15} />
                        </div>

                        {/* Step Description */}
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <h5
                              className={`text-xs font-bold ${
                                isCurrent
                                  ? 'text-[#A8181E]'
                                  : isDone
                                  ? 'text-[#20120D]'
                                  : 'text-[#9C8578]'
                              }`}
                            >
                              {st.title}
                            </h5>
                            <span className="text-[10px] font-mono text-[#9C8578]">{st.time}</span>
                          </div>
                          <p className="text-[11px] text-[#6E574C] mt-0.5">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rich Order Details Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Fulfillment Information */}
                <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#DECDBA] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#20120D] uppercase tracking-wider">
                    <MapPin size={15} className="text-[#DE9344]" />
                    <span>Fulfillment & Time Slot</span>
                  </div>
                  <div className="text-xs text-[#6E574C] space-y-1">
                    <p className="font-semibold text-[#20120D]">
                      {isDelivery ? 'Doorstep Delivery' : 'Bakehouse Store Pickup'}
                    </p>
                    <p className="leading-relaxed">{currentOrder.address}</p>
                    {currentOrder.deliveryTimeSlot && (
                      <p className="pt-1 text-[#B87326] font-medium flex items-center gap-1">
                        <Clock size={12} />
                        <span>Slot: {currentOrder.deliveryTimeSlot}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer & Payment Info */}
                <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#DECDBA] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#20120D] uppercase tracking-wider">
                    <FileText size={15} className="text-[#DE9344]" />
                    <span>Recipient & Payment</span>
                  </div>
                  <div className="text-xs text-[#6E574C] space-y-1">
                    <p className="font-semibold text-[#20120D]">{currentOrder.customerName}</p>
                    <p>{currentOrder.customerPhone} · {currentOrder.customerEmail}</p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white border border-[#DECDBA] text-[10px] uppercase font-bold text-[#20120D]">
                        {currentOrder.paymentMethod.toUpperCase()}
                      </span>
                      {currentOrder.paymentReference && (
                        <span className="font-mono text-[10px] text-[#9C8578]">
                          Ref: {currentOrder.paymentReference}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Gift Card Message & Baker's Notes (if present) */}
              {(currentOrder.giftMessage || currentOrder.orderNotes) && (
                <div className="p-5 rounded-2xl bg-[#FAF3EB] border border-[#DECDBA] space-y-3">
                  {currentOrder.giftMessage && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8181E] flex items-center gap-1">
                        <Gift size={12} />
                        <span>Artisan Dedication Greeting Card</span>
                      </span>
                      <p className="text-xs text-[#20120D] italic bg-white p-3 rounded-xl border border-[#DECDBA]">
                        "{currentOrder.giftMessage}"
                      </p>
                    </div>
                  )}

                  {currentOrder.orderNotes && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#6E574C] block">
                        Special Baker's Instructions
                      </span>
                      <p className="text-xs text-[#6E574C]">
                        {currentOrder.orderNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Items Summary */}
              <div className="bg-white rounded-2xl p-5 border border-[#DECDBA] space-y-3">
                <span className="text-xs font-bold text-[#20120D] uppercase tracking-wider block">
                  Items In This Order ({currentOrder.items?.reduce((s, i) => s + i.qty, 0) || 0})
                </span>
                <div className="divide-y divide-[#F0E6D8] max-h-48 overflow-y-auto pr-1">
                  {currentOrder.items?.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {item.img && (
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border border-[#DECDBA] shrink-0"
                          />
                        )}
                        <div className="truncate">
                          <span className="font-semibold text-[#20120D] block truncate">{item.name}</span>
                          <span className="text-[10px] text-[#9C8578]">Qty: {item.qty} {item.meta ? `(${item.meta})` : ''}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#20120D] shrink-0">
                        ₱{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#DECDBA] flex justify-between items-center text-xs">
                  <span className="text-[#6E574C]">Order Total Paid</span>
                  <span className="font-display font-bold text-base text-[#20120D]">
                    ₱{currentOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#9C8578] space-y-2">
              <PackageCheck size={36} className="mx-auto text-[#DECDBA]" />
              <p className="font-display font-bold text-base text-[#20120D]">No order active to track</p>
              <p className="text-xs">Enter your Order ID above to track your fresh bake delivery in real-time.</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-[#20120D] hover:bg-[#A8181E] text-white text-xs sm:text-sm font-semibold py-3.5 rounded-full transition-colors cursor-pointer shadow-md"
          >
            Continue Browsing Sweet Crumbs
          </button>
        </div>

      </div>
    </div>
  );
};
