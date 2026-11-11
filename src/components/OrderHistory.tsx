import React, { useState, useEffect } from 'react';
import { Order, CartItem } from '../types.ts';
import { fetchUserOrders, getTrackingStepFromStatus } from '../lib/dataService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { isSupabaseConfigured } from '../lib/supabase.ts';
import { ReceiptModal } from './ReceiptModal.tsx';
import {
  X,
  ShoppingBag,
  Clock,
  Truck,
  PackageCheck,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Gift,
  AlertCircle,
  Printer,
  FileText,
  ChefHat,
} from 'lucide-react';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTracking: (order: Order) => void;
  onReorderItems: (items: CartItem[]) => void;
  onOpenShop: () => void;
  onOpenAuth: () => void;
  onShowToast: (msg: string) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  isOpen,
  onClose,
  onOpenTracking,
  onReorderItems,
  onOpenShop,
  onOpenAuth,
  onShowToast,
}) => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const userEmail = (user?.email || profile?.email || '').trim();

  // Load orders when modal opens or user changes
  const loadOrders = async (isManualRefresh = false) => {
    if (!userEmail) {
      setOrders([]);
      setLoading(false);
      return;
    }

    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const userOrders = await fetchUserOrders(userEmail);
      setOrders(userOrders);
      // Auto-expand the most recent order on initial load
      if (userOrders.length > 0 && !isManualRefresh) {
        setExpandedOrders((prev) => ({
          ...prev,
          [userOrders[0].id]: true,
        }));
      }
      if (isManualRefresh) {
        onShowToast(`Refreshed ${userOrders.length} past orders.`);
      }
    } catch (err) {
      console.error('Error fetching user order history:', err);
      onShowToast('Could not load order history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, userEmail]);

  // Periodic subtle background poll while modal is open to capture live status changes
  useEffect(() => {
    if (!isOpen || !userEmail) return;

    const interval = setInterval(async () => {
      try {
        const latest = await fetchUserOrders(userEmail);
        setOrders(latest);
      } catch {
        // silent fail for background poll
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Maps order status to 4-stage fulfillment milestones
  const getOrderStep = (status: string, trackingStep?: number): number => {
    const s = status.toLowerCase();
    if (s.includes('cancel')) return 0;
    if (s.includes('complete') || s.includes('delivered') || (trackingStep && trackingStep >= 5)) return 4;
    if (s.includes('deliver') || s.includes('pickup') || s.includes('dispatch') || (trackingStep && trackingStep === 4)) return 3;
    if (s.includes('oven') || s.includes('prepar') || s.includes('baking') || s.includes('qual') || (trackingStep && (trackingStep === 2 || trackingStep === 3))) return 2;
    return 1; // Confirmed
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.paymentReference && o.paymentReference.toLowerCase().includes(q)) ||
      o.items.some((it) => it.name.toLowerCase().includes(q));

    const s = o.status.toLowerCase();
    const isCompleted = s.includes('complete');
    const isCancelled = s.includes('cancel');
    const isActive = !isCompleted && !isCancelled;

    if (statusFilter === 'active') return matchesSearch && isActive;
    if (statusFilter === 'completed') return matchesSearch && isCompleted;
    if (statusFilter === 'cancelled') return matchesSearch && isCancelled;
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('complete')) {
      return {
        bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        dot: 'bg-emerald-400',
        label: 'Delivered / Completed',
      };
    }
    if (s.includes('cancel')) {
      return {
        bg: 'bg-rose-950/80 text-rose-300 border-rose-800',
        dot: 'bg-rose-400',
        label: 'Cancelled',
      };
    }
    if (s.includes('oven') || s.includes('prepar')) {
      return {
        bg: 'bg-amber-950/80 text-amber-300 border-amber-800',
        dot: 'bg-amber-400 animate-pulse',
        label: 'Baking in Kitchen',
      };
    }
    if (s.includes('qual') || s.includes('qa')) {
      return {
        bg: 'bg-purple-950/80 text-purple-300 border-purple-800',
        dot: 'bg-purple-400 animate-pulse',
        label: 'QA & Hand Piping',
      };
    }
    if (s.includes('deliver') || s.includes('pickup') || s.includes('dispatch')) {
      return {
        bg: 'bg-sky-950/80 text-sky-300 border-sky-800',
        dot: 'bg-sky-400 animate-pulse',
        label: s.includes('deliver') ? 'Out for Delivery' : 'Ready for Pickup',
      };
    }
    return {
      bg: 'bg-[#3D2316] text-[#DE9344] border-[#5E3622]',
      dot: 'bg-[#DE9344]',
      label: 'Order Confirmed',
    };
  };

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    onReorderItems(order.items);
    onShowToast(`Added ${order.items.length} items from #${order.id} to your bag!`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-history-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1A0E08]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative bg-[#FFFDFB] rounded-3xl shadow-[0_25px_70px_rgba(32,18,13,0.4)] max-w-3xl w-full border border-[#DECDBA] overflow-hidden flex flex-col max-h-[92vh] animate-modal-scale">
        
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b border-[#F0E6D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF3EB] border border-[#DECDBA] flex items-center justify-center shadow-xs">
              <img src="/logo.svg" alt="Sweet Crumbs Logo" className="w-6 h-6 object-cover rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="order-history-title" className="font-display font-bold text-lg sm:text-xl text-[#20120D] leading-tight">
                  My Past Orders
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Tracking Active</span>
                </span>
              </div>
              <p className="text-xs text-[#745C51]">
                {userEmail ? (
                  <span>Showing orders linked to <strong className="text-[#20120D]">{userEmail}</strong></span>
                ) : (
                  <span>Track status, view past bakes, and re-order in one click</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userEmail && (
              <button
                type="button"
                onClick={() => loadOrders(true)}
                disabled={refreshing}
                className="p-2 text-[#745C51] hover:text-[#20120D] hover:bg-[#FAF3EB] rounded-full transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh Orders"
              >
                <RefreshCw size={17} className={refreshing ? 'animate-spin text-[#DE9344]' : ''} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#745C51] hover:text-[#20120D] hover:bg-[#FAF3EB] rounded-full transition-colors cursor-pointer"
              aria-label="Close Order History"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* Guest State Notice */}
          {!userEmail ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF0E4] border border-[#DECDBA] mx-auto flex items-center justify-center text-3xl shadow-xs">
                👤
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-display font-bold text-xl text-[#20120D]">
                  Log In to View Your Past Orders
                </h3>
                <p className="text-xs sm:text-sm text-[#745C51] leading-relaxed">
                  Your order history and live delivery tracking are securely stored with your Sweet Crumbs account.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="bg-[#20120D] hover:bg-[#B81D24] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-7 py-3 rounded-full transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
                >
                  <span>Log In to My Account</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-16 space-y-3">
              <RefreshCw size={28} className="animate-spin text-[#DE9344] mx-auto" />
              <p className="font-display font-bold text-sm text-[#20120D]">
                Loading your artisan order history...
              </p>
              <p className="text-xs text-[#745C51]">Synchronizing live order status</p>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="text-center py-14 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF3EB] border border-[#DECDBA] mx-auto flex items-center justify-center text-3xl shadow-xs">
                🍰
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-display font-bold text-xl text-[#20120D]">
                  No Orders Yet
                </h3>
                <p className="text-xs sm:text-sm text-[#745C51] leading-relaxed">
                  You haven't placed an order yet. Treat yourself to our signature freshly baked cakes and pastries!
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenShop();
                  }}
                  className="bg-[#DE9344] hover:bg-[#EEA858] text-[#20120D] text-xs sm:text-sm font-bold uppercase tracking-wider px-7 py-3 rounded-full transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
                >
                  <ShoppingBag size={16} />
                  <span>Explore Bakery Menu</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Controls & Filter Tabs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                {/* Status tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-[#FAF3EB] rounded-xl border border-[#DECDBA]">
                  {[
                    { id: 'all', label: `All (${orders.length})` },
                    { id: 'active', label: 'Active' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'cancelled', label: 'Cancelled' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === tab.id
                          ? 'bg-[#20120D] text-white shadow-xs'
                          : 'text-[#745C51] hover:text-[#20120D]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-56">
                  <Search size={14} className="absolute left-3 top-2.5 text-[#9C8578]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order # or bake..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white border border-[#DECDBA] text-[#20120D] placeholder-[#9C8578] focus:border-[#A8181E] focus:outline-hidden"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 bg-[#FAF7F2] rounded-2xl border border-[#DECDBA] text-xs text-[#745C51]">
                  No orders match your filter criteria.
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    const isExpanded = !!expandedOrders[order.id];
                    const itemCount = order.items.reduce((sum, it) => sum + (it.qty || 1), 0);
                    const isCancelled = order.status.toLowerCase().includes('cancel');
                    const activeStep = getOrderStep(order.status, order.trackingStep);
                    const isDelivery = order.deliveryMethod === 'delivery';

                    const trackerSteps = [
                      {
                        step: 1,
                        title: 'Confirmed',
                        subtitle: 'Order Accepted',
                        icon: PackageCheck,
                      },
                      {
                        step: 2,
                        title: 'Preparing',
                        subtitle: 'Baking in Oven',
                        icon: ChefHat,
                      },
                      {
                        step: 3,
                        title: isDelivery ? 'Out for Delivery' : 'Ready for Pickup',
                        subtitle: isDelivery ? 'Courier En Route' : 'At Bakehouse',
                        icon: isDelivery ? Truck : ShoppingBag,
                      },
                      {
                        step: 4,
                        title: 'Completed',
                        subtitle: isDelivery ? 'Delivered' : 'Collected',
                        icon: CheckCircle2,
                      },
                    ];

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-[#DECDBA] shadow-xs overflow-hidden transition-all duration-200 hover:border-[#C4B29E]"
                      >
                        {/* Order Header Summary */}
                        <div
                          onClick={() => toggleExpand(order.id)}
                          className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none bg-[#FFFDFB] hover:bg-[#FAF6F0] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF3EB] border border-[#DECDBA] flex items-center justify-center text-sm font-bold text-[#DE9344]">
                              #{order.id.slice(-4)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-bold text-base text-[#20120D]">
                                  Order #{order.id}
                                </span>
                                {/* Status badge with smooth fade-in and scale-up transition animation */}
                                <span
                                  key={`${order.id}-${order.status}`}
                                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border transition-all duration-300 animate-status-change ${badge.bg}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                  <span>{badge.label}</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-[#745C51] mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} className="text-[#9C8578]" />
                                  <span>{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </span>
                                <span>·</span>
                                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                                <span>·</span>
                                <span className="capitalize">{order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 ml-auto">
                            {/* Receipt / Invoice Quick Action Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptOrder(order);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#FAF3EB] hover:bg-[#F2DEC9] border border-[#DECDBA] text-xs font-semibold text-[#20120D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Print or Download Receipt"
                            >
                              <Printer size={13} className="text-[#DE9344]" />
                              <span className="hidden sm:inline">Receipt</span>
                            </button>

                            <span className="font-display font-bold text-lg text-[#20120D]">
                              ₱{order.total.toLocaleString()}
                            </span>

                            <div className="p-1 rounded-full bg-[#FAF3EB] text-[#745C51]">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </div>

                        {/* Visual Progress Tracker */}
                        {!isCancelled ? (
                          <div className="px-4 py-3 sm:px-5 sm:py-4 bg-[#FAF7F2] border-t border-b border-[#F0E6D8]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] uppercase tracking-wider font-bold text-[#6E574C] flex items-center gap-1.5">
                                <Sparkles size={12} className="text-[#DE9344]" />
                                <span>Order Fulfillment Tracker</span>
                              </span>
                              <span className="text-xs font-semibold text-[#DE9344]">
                                {activeStep >= 4 ? 'Order Completed 🎉' : `Active: ${trackerSteps[activeStep - 1]?.title || 'Processing'}`}
                              </span>
                            </div>

                            {/* Stepper with connecting line */}
                            <div className="relative pt-2 pb-1">
                              {/* Horizontal track line for desktop */}
                              <div className="absolute top-6.5 left-8 right-8 h-1 bg-[#E8D9C5] rounded-full z-0 hidden sm:block">
                                <div
                                  className="h-full bg-gradient-to-r from-[#20120D] to-[#DE9344] rounded-full transition-all duration-500"
                                  style={{
                                    width: `${((Math.max(1, activeStep) - 1) / 3) * 100}%`,
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
                                {trackerSteps.map((st) => {
                                  const isDone = activeStep > st.step;
                                  const isActive = activeStep === st.step;
                                  const Icon = st.icon;

                                  return (
                                    <div
                                      key={st.step}
                                      className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                                        isActive ? 'bg-white shadow-xs border border-[#DECDBA]' : ''
                                      }`}
                                    >
                                      {/* Step circle with subtle pulse animation for active status */}
                                      <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1.5 ${
                                          isDone
                                            ? 'bg-[#20120D] text-white shadow-xs'
                                            : isActive
                                            ? 'bg-[#DE9344] text-white animate-status-pulse ring-4 ring-[#DE9344]/25 shadow-md'
                                            : 'bg-[#EFE6D8] text-[#9C8578] border border-[#DECDBA]'
                                        }`}
                                      >
                                        {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                      </div>

                                      {/* Status label with smooth transition animation */}
                                      <span
                                        key={`${order.id}-${st.step}-${isActive}`}
                                        className={`text-xs leading-tight ${
                                          isActive
                                            ? 'font-bold text-[#20120D] animate-status-change'
                                            : isDone
                                            ? 'font-semibold text-[#20120D]'
                                            : 'text-[#9C8578]'
                                        }`}
                                      >
                                        {st.title}
                                      </span>
                                      <span className="text-[10px] text-[#745C51] hidden sm:block mt-0.5">
                                        {st.subtitle}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-2.5 sm:px-5 bg-rose-50 border-t border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                            <AlertCircle size={14} className="text-rose-600 shrink-0" />
                            <span>This order was cancelled. Please contact bakery dispatch if you have questions.</span>
                          </div>
                        )}

                        {/* Collapsible Details Panel */}
                        {isExpanded && (
                          <div className="p-5 border-t border-[#F0E6D8] bg-[#FCFAF7] space-y-5 animate-in slide-in-from-top-1 duration-150">
                            
                            {/* Fulfillment & Payment Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                              {/* Destination */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#E8D9C5] space-y-1">
                                <span className="text-[10px] uppercase font-bold text-[#9C8578] flex items-center gap-1">
                                  <MapPin size={11} className="text-[#DE9344]" />
                                  <span>Destination</span>
                                </span>
                                <p className="font-semibold text-[#20120D] leading-snug">
                                  {order.address}
                                </p>
                                {order.deliveryTimeSlot && (
                                  <p className="text-[11px] text-[#DE9344] font-medium flex items-center gap-1 pt-0.5">
                                    <Clock size={11} />
                                    <span>Time: {order.deliveryTimeSlot}</span>
                                  </p>
                                )}
                              </div>

                              {/* Customer Contact */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#E8D9C5] space-y-1">
                                <span className="text-[10px] uppercase font-bold text-[#9C8578] flex items-center gap-1">
                                  <span>👤</span>
                                  <span>Recipient</span>
                                </span>
                                <p className="font-semibold text-[#20120D]">{order.customerName}</p>
                                <p className="text-[#745C51]">{order.customerPhone}</p>
                                <p className="text-[#745C51] text-[11px] truncate">{order.customerEmail}</p>
                              </div>

                              {/* Payment Info */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#E8D9C5] space-y-1">
                                <span className="text-[10px] uppercase font-bold text-[#9C8578] flex items-center gap-1">
                                  <CreditCard size={11} className="text-[#DE9344]" />
                                  <span>Payment ({order.paymentMethod.toUpperCase()})</span>
                                </span>
                                <p className="font-semibold text-[#20120D]">
                                  Total: ₱{order.total.toLocaleString()}
                                </p>
                                {order.paymentReference ? (
                                  <p className="font-mono text-[11px] text-[#745C51] bg-[#FAF3EB] px-2 py-0.5 rounded border border-[#DECDBA] inline-block">
                                    Ref: {order.paymentReference}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-[#745C51]">Cash on Delivery / Counter</p>
                                )}
                              </div>
                            </div>

                            {/* Gift Dedication Message / Order Delivery Notes / Baker Notes */}
                            {(order.giftMessage || order.deliveryNotes || order.orderNotes) && (
                              <div className="p-3.5 rounded-xl bg-[#FAF0E4] border border-[#DECDBA] text-xs space-y-2">
                                {order.giftMessage && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE9344] flex items-center gap-1">
                                      <Gift size={11} />
                                      <span>Dedication Card Message:</span>
                                    </span>
                                    <p className="font-serif italic text-sm text-[#20120D] mt-0.5">
                                      "{order.giftMessage}"
                                    </p>
                                  </div>
                                )}
                                {order.deliveryNotes && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE9344] flex items-center gap-1">
                                      <Truck size={11} />
                                      <span>Order Delivery Notes (Instructions for Delivery Rider):</span>
                                    </span>
                                    <p className="text-[#20120D] mt-0.5 font-medium">{order.deliveryNotes}</p>
                                  </div>
                                )}
                                {order.orderNotes && order.orderNotes !== order.deliveryNotes && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C8578]">
                                      Baker's Kitchen Notes:
                                    </span>
                                    <p className="text-[#745C51] mt-0.5">{order.orderNotes}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Items List */}
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-[#20120D] uppercase tracking-wider block">
                                Artisan Bakery Items ({order.items.length})
                              </span>
                              <div className="divide-y divide-[#F0E6D8] border border-[#E8D9C5] rounded-xl bg-white overflow-hidden">
                                {order.items.map((item, idx) => (
                                  <div key={`${order.id}-item-${idx}`} className="p-3 flex items-center gap-3">
                                    <img
                                      src={item.img}
                                      alt={item.name}
                                      className="w-12 h-12 rounded-lg object-cover border border-[#E8D9C5] shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs text-[#20120D] truncate">
                                        {item.name}
                                      </p>
                                      {item.meta && (
                                        <p className="text-[10px] text-[#DE9344] font-medium truncate">
                                          {item.meta}
                                        </p>
                                      )}
                                      <p className="text-[11px] text-[#745C51]">
                                        ₱{item.price.toLocaleString()} × {item.qty}
                                      </p>
                                    </div>
                                    <div className="text-right font-bold text-xs text-[#20120D]">
                                      ₱{(item.price * item.qty).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="p-3.5 bg-white rounded-xl border border-[#E8D9C5] text-xs space-y-1.5">
                              <div className="flex justify-between text-[#745C51]">
                                <span>Subtotal</span>
                                <span>₱{order.subtotal.toLocaleString()}</span>
                              </div>
                              {order.deliveryFee > 0 && (
                                <div className="flex justify-between text-[#745C51]">
                                  <span>Delivery Fee</span>
                                  <span>₱{order.deliveryFee.toLocaleString()}</span>
                                </div>
                              )}
                              {order.discount > 0 && (
                                <div className="flex justify-between text-[#DE9344] font-semibold">
                                  <span>Discount Applied</span>
                                  <span>-₱{order.discount.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-sm text-[#20120D] pt-1.5 border-t border-[#F0E6D8]">
                                <span>Total Paid</span>
                                <span className="font-display text-base text-[#B81D24]">
                                  ₱{order.total.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onOpenTracking(order);
                                  }}
                                  className="bg-[#20120D] hover:bg-[#3D2316] text-[#FAF7F2] text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                                >
                                  <PackageCheck size={14} className="text-[#DE9344]" />
                                  <span>Track Live Delivery Status</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setReceiptOrder(order)}
                                  className="bg-white hover:bg-[#FAF3EB] text-[#20120D] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#DECDBA] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Printer size={13} className="text-[#DE9344]" />
                                  <span>Print / Download Receipt</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleReorder(order)}
                                className="bg-[#FAF3EB] hover:bg-[#F2DEC9] text-[#20120D] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#DECDBA] transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <RotateCcw size={13} className="text-[#DE9344]" />
                                <span>Re-order These Items</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF3EB] px-6 py-3 border-t border-[#DECDBA] flex flex-wrap items-center justify-between gap-3 text-xs text-[#745C51]">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DE9344]" />
            <span>Need order assistance? Call bakery dispatch: <strong>+63 917 829 3388</strong></span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#20120D] hover:text-[#A8181E] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Printable & Downloadable Sweet Crumbs Receipt Modal */}
      <ReceiptModal
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
