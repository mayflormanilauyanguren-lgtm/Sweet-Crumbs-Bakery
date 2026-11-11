import React, { useEffect, useState } from 'react';
import { RealtimeOrderAlert, Order } from '../types.ts';
import {
  Truck,
  CheckCircle2,
  X,
  PackageCheck,
  Printer,
  Sparkles,
  ShoppingBag,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface RealtimeOrderToastProps {
  alerts: RealtimeOrderAlert[];
  onDismiss: (alertId: string) => void;
  onTrackOrder: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
}

const TOAST_DURATION_MS = 9000;

export const RealtimeOrderToast: React.FC<RealtimeOrderToastProps> = ({
  alerts,
  onDismiss,
  onTrackOrder,
  onViewReceipt,
}) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] pointer-events-none"
    >
      {alerts.map((alert) => (
        <SingleOrderToast
          key={alert.id}
          alert={alert}
          onDismiss={() => onDismiss(alert.id)}
          onTrackOrder={() => onTrackOrder(alert.order)}
          onViewReceipt={() => onViewReceipt(alert.order)}
        />
      ))}
    </div>
  );
};

interface SingleOrderToastProps {
  alert: RealtimeOrderAlert;
  onDismiss: () => void;
  onTrackOrder: () => void;
  onViewReceipt: () => void;
}

const SingleOrderToast: React.FC<SingleOrderToastProps> = ({
  alert,
  onDismiss,
  onTrackOrder,
  onViewReceipt,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const decrement = (intervalTime / TOAST_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return Math.max(0, prev - decrement);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, onDismiss]);

  const isDelivery = alert.order.deliveryMethod === 'delivery';
  const isOutForDelivery = alert.type === 'out_for_delivery';
  const itemCount = alert.order.items?.reduce((sum, it) => sum + (it.qty || 1), 0) || 1;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto relative overflow-hidden bg-[#20120D] text-[#FAF7F2] rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(20,10,7,0.55)] border border-[#DE9344]/40 backdrop-blur-xl animate-in slide-in-from-top-3 fade-in duration-300"
      style={{
        boxShadow: isOutForDelivery
          ? '0 12px 40px -10px rgba(222, 147, 68, 0.4), 0 0 0 1px rgba(222, 147, 68, 0.35)'
          : '0 12px 40px -10px rgba(16, 185, 129, 0.35), 0 0 0 1px rgba(16, 185, 129, 0.35)',
      }}
    >
      {/* Background ambient glow aura */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-25 ${
          isOutForDelivery ? 'bg-[#DE9344]' : 'bg-emerald-400'
        }`}
      />

      <div className="relative z-10 space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {/* Status Icon with Glowing Pulse Ring */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isOutForDelivery
                  ? 'bg-[#3D2115] text-[#DE9344] border border-[#DE9344]/50 animate-status-pulse'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-700/60 animate-status-pulse'
              }`}
            >
              {isOutForDelivery ? (
                isDelivery ? (
                  <Truck size={20} className="text-[#DE9344]" />
                ) : (
                  <ShoppingBag size={20} className="text-[#DE9344]" />
                )
              ) : (
                <CheckCircle2 size={20} className="text-emerald-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isOutForDelivery
                      ? 'bg-[#DE9344]/20 text-[#DE9344] border border-[#DE9344]/40'
                      : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                  }`}
                >
                  {isOutForDelivery
                    ? isDelivery
                      ? 'Out for Delivery'
                      : 'Ready for Pickup'
                    : 'Order Completed'}
                </span>
                <span className="font-mono text-[11px] text-[#A88A6D]">
                  #{alert.order.id.slice(-6)}
                </span>
              </div>
              <h4 className="font-display font-bold text-sm sm:text-base text-white leading-tight mt-0.5">
                {isOutForDelivery
                  ? isDelivery
                    ? 'Your Bakes are on the Way! 🚚'
                    : 'Fresh Bakes Ready at Davao Bakehouse! 🛍️'
                  : 'Delivered & Completed! Enjoy Every Bite 🍰'}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1 text-[#A88A6D] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        </div>

        {/* Informative text */}
        <p className="text-xs text-[#DECDBA] leading-relaxed">
          {isOutForDelivery
            ? isDelivery
              ? `Status updated from Preparing. Our courier has departed with your ${itemCount} fresh artisan ${itemCount === 1 ? 'item' : 'items'} heading to ${alert.order.address}.`
              : `Status updated from Preparing. Your ${itemCount} handcrafted bakery ${itemCount === 1 ? 'item is' : 'items are'} boxed and waiting for pickup at our counter.`
            : `Order #${alert.order.id} has successfully reached its destination. Thank you for welcoming Sweet Crumbs into your sweetest moments!`}
        </p>

        {/* Quick Details Chips */}
        <div className="flex flex-wrap gap-2 text-[11px] text-[#C4AC8F]">
          <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 truncate max-w-[240px]">
            <MapPin size={11} className="text-[#DE9344] shrink-0" />
            <span className="truncate">{alert.order.address}</span>
          </span>
          {alert.order.deliveryTimeSlot && (
            <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              <Clock size={11} className="text-[#DE9344] shrink-0" />
              <span>{alert.order.deliveryTimeSlot}</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              onTrackOrder();
              onDismiss();
            }}
            className="bg-[#DE9344] hover:bg-[#EEA858] text-[#20120D] text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <PackageCheck size={13} />
            <span>Track Live Delivery</span>
            <ArrowRight size={12} />
          </button>

          <button
            type="button"
            onClick={() => {
              onViewReceipt();
              onDismiss();
            }}
            className="bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Printer size={13} className="text-[#DE9344]" />
            <span>View Receipt</span>
          </button>
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className={`h-full transition-all duration-75 ${
            isOutForDelivery ? 'bg-[#DE9344]' : 'bg-emerald-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
