import React from 'react';
import { Order } from '../types.ts';
import { X, Clock, MapPin, PackageCheck } from 'lucide-react';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const isDelivery = order.deliveryMethod === 'delivery';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#25140C]/55 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#FFFDFB] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-[#F0E6D8]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#745C51] hover:text-[#25140C] hover:bg-[#FAF3EB] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#FAF3EB] text-[#C0772C] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-[#E8D9C5]">
            <PackageCheck size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#25140C]">
            Order Confirmed!
          </h2>
          <p className="text-xs text-[#745C51] mt-1">
            Your fresh bake ticket has been received and queued at our bakehouse.
          </p>

          <div className="mt-3 inline-block bg-[#FAF3EB] border border-[#E8D9C5] px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm text-[#25140C] tracking-wider">
            ORDER #{order.id}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3.5 my-6 bg-white p-5 rounded-2xl border border-[#F0E6D8]">
          {[
            { label: 'Order Placed', desc: 'Saved in database ticket queue', done: true },
            { label: 'Kitchen Confirmed', desc: 'Baker assigned to batch', done: true },
            { label: 'In the Oven & Decorating', desc: 'Baking and piping fresh', done: true },
            {
              label: isDelivery ? 'Dispatched for Delivery' : 'Ready at Davao Bakehouse Counter',
              desc: isDelivery ? 'Chilled doorstep delivery en route' : 'Waiting at store counter',
              done: false,
            },
            { label: 'Delivered / Completed', desc: 'Enjoy your handcrafted treats!', done: false },
          ].map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  step.done
                    ? 'bg-[#B81D24] text-white shadow-2xs'
                    : 'border border-[#E2D2BE] text-[#9C8578] bg-[#FAF7F2]'
                }`}
              >
                {step.done ? '✓' : idx + 1}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${step.done ? 'text-[#25140C]' : 'text-[#745C51]'}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-[#9C8578]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#FAF3EB] p-4 rounded-2xl border border-[#E8D9C5] text-xs text-[#25140C] mb-6 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <Clock size={14} className="text-[#C0772C]" />
            <span>
              Estimated {isDelivery ? 'Delivery' : 'Pickup'}:{' '}
              {isDelivery ? '45–60 minutes' : '30–45 minutes'}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-[#745C51]">
            <MapPin size={14} className="shrink-0 mt-0.5 text-[#C0772C]" />
            <span>{order.address}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#25140C] hover:bg-[#B81D24] text-white text-xs sm:text-sm font-semibold py-3.5 rounded-full transition-all duration-200 shadow-md cursor-pointer"
        >
          Back to Sweet Crumbs Bakery
        </button>
      </div>
    </div>
  );
};
