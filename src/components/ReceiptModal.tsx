import React, { useState } from 'react';
import { Order } from '../types.ts';
import {
  X,
  Printer,
  Download,
  Check,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Gift,
  Sparkles,
  Truck,
} from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      const receiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sweet Crumbs Receipt - Order #${order.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #20120D;
      background: #FAF6F0;
      padding: 30px;
      margin: 0;
    }
    .receipt-container {
      max-width: 650px;
      margin: 0 auto;
      background: #FFFFFF;
      padding: 36px;
      border: 1px solid #DECDBA;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(32,18,13,0.08);
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #DECDBA;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand-name {
      font-size: 26px;
      font-weight: bold;
      color: #20120D;
      margin: 8px 0 4px;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #B87326;
      font-weight: 600;
    }
    .contact-info {
      font-size: 11px;
      color: #6E574C;
      margin-top: 6px;
    }
    .order-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 20px;
      background: #FAF3EB;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .meta-col {
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    th {
      text-align: left;
      padding: 10px 8px;
      border-bottom: 1.5px solid #DECDBA;
      color: #6E574C;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 12px 8px;
      border-bottom: 1px solid #EFE6D8;
    }
    .text-right {
      text-align: right;
    }
    .total-section {
      margin-top: 20px;
      border-top: 2px dashed #DECDBA;
      padding-top: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 6px;
      color: #6E574C;
    }
    .grand-total {
      font-size: 18px;
      font-weight: bold;
      color: #A8181E;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #DECDBA;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #9B8477;
      margin-top: 30px;
      border-top: 1px dashed #DECDBA;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="brand-name">Sweet Crumbs Bakery & Café</div>
      <div class="tagline">Artisan Bakes & Specialty Coffee · Davao City</div>
      <div class="contact-info">
        Davao City, Philippines · Phone: +63 917 829 3388 · sweetcrumbsbakery@gmail.com
      </div>
    </div>

    <div class="order-meta">
      <div class="meta-col">
        <strong>Receipt No:</strong> #${order.id}<br>
        <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}<br>
        <strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}${order.paymentReference ? ` (Ref: ${order.paymentReference})` : ''}
      </div>
      <div class="meta-col text-right">
        <strong>Customer:</strong> ${order.customerName}<br>
        <strong>Phone:</strong> ${order.customerPhone}<br>
        <strong>Method:</strong> ${order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
      </div>
    </div>

    <div>
      <strong>Delivery Destination:</strong> ${order.address}
      ${order.deliveryTimeSlot ? `<br><strong>Time Slot:</strong> ${order.deliveryTimeSlot}` : ''}
      ${order.deliveryNotes ? `<br><strong>Delivery Rider Notes:</strong> "${order.deliveryNotes}"` : ''}
      ${order.giftMessage ? `<br><strong>Dedication Card:</strong> "${order.giftMessage}"` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Price</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it) => `
          <tr>
            <td>
              <strong>${it.name}</strong>
              ${it.meta ? `<br><small style="color: #B87326;">${it.meta}</small>` : ''}
            </td>
            <td class="text-right">₱${Number(it.price).toLocaleString()}</td>
            <td class="text-right">${it.qty}</td>
            <td class="text-right"><strong>₱${(Number(it.price) * it.qty).toLocaleString()}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row">
        <span>Subtotal</span>
        <span>₱${Number(order.subtotal).toLocaleString()}</span>
      </div>
      ${order.deliveryFee > 0 ? `
      <div class="total-row">
        <span>Delivery Fee</span>
        <span>₱${Number(order.deliveryFee).toLocaleString()}</span>
      </div>` : ''}
      ${order.discount > 0 ? `
      <div class="total-row" style="color: #B87326; font-weight: bold;">
        <span>Discount Applied</span>
        <span>-₱${Number(order.discount).toLocaleString()}</span>
      </div>` : ''}
      <div class="total-row grand-total">
        <span>Amount Paid (${order.paymentMethod.toUpperCase()})</span>
        <span>₱${Number(order.total).toLocaleString()}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for supporting small-batch artisan baking in Davao City!</p>
      <p style="font-size: 10px;">Sweet Crumbs Bakery · Est. 2026 · Freshly baked with pure dairy butter and farm eggs.</p>
    </div>
  </div>
</body>
</html>
      `;

      const blob = new Blob([receiptHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SweetCrumbs-Receipt-${order.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast(`Receipt for Order #${order.id} downloaded successfully!`);
    } catch {
      onShowToast('Could not download receipt. You can also click Print.');
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1A0E08]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative bg-[#FFFDFB] rounded-3xl shadow-[0_25px_70px_rgba(32,18,13,0.45)] max-w-xl w-full border border-[#DECDBA] overflow-hidden flex flex-col max-h-[94vh] animate-modal-scale">
        
        {/* Sticky Action Toolbar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-[#F0E6D8] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#20120D]">Receipt & Invoice</span>
            <span className="font-mono text-xs bg-[#FAF3EB] text-[#DE9344] font-bold px-2 py-0.5 rounded border border-[#DECDBA]">
              #{order.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#20120D] hover:bg-[#3E2115] text-[#FAF7F2] text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print Receipt"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="bg-[#FAF3EB] hover:bg-[#EFE4D6] text-[#20120D] text-xs font-semibold px-3.5 py-1.5 rounded-full border border-[#DECDBA] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download Receipt HTML"
            >
              <Download size={13} className="text-[#DE9344]" />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#745C51] hover:text-[#20120D] hover:bg-[#FAF3EB] rounded-full transition-colors cursor-pointer"
              aria-label="Close Receipt"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white" id="printable-receipt">
          
          {/* Bakery Header */}
          <div className="text-center pb-6 border-b-2 border-dashed border-[#DECDBA] space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#FAF3EB] border border-[#DE9344] p-1 mx-auto flex items-center justify-center shadow-xs">
              <img src="/logo.svg" alt="Sweet Crumbs Logo" className="w-full h-full object-cover rounded-full" />
            </div>

            <div>
              <h2 id="receipt-title" className="font-display font-bold text-2xl text-[#20120D] tracking-tight">
                Sweet Crumbs Bakery & Café
              </h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#B87326]">
                Artisan Confections & Specialty Coffee · Davao City
              </p>
            </div>

            <p className="text-[11px] text-[#745C51] leading-relaxed">
              Davao City, Philippines · Contact: +63 917 829 3388 · sweetcrumbsbakery@gmail.com
            </p>
          </div>

          {/* Meta Ribbon */}
          <div className="bg-[#FAF3EB] p-4 rounded-2xl border border-[#DECDBA] text-xs space-y-2.5">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-[10px] text-[#9C8578] uppercase font-bold block">Order Reference</span>
                <span className="font-display font-bold text-sm text-[#20120D]">#{order.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#9C8578] uppercase font-bold block">Order Date & Time</span>
                <span className="font-semibold text-[#20120D]">{formattedDate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DECDBA]/60 flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-[10px] text-[#9C8578] uppercase font-bold block">Customer / Recipient</span>
                <span className="font-semibold text-[#20120D]">{order.customerName} ({order.customerPhone})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#9C8578] uppercase font-bold block">Payment Method</span>
                <span className="font-semibold text-[#B81D24] uppercase">
                  {order.paymentMethod} {order.paymentReference ? `(Ref: ${order.paymentReference})` : ''}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DECDBA]/60 text-[11px] text-[#745C51]">
              <span className="font-bold text-[#20120D]">Destination: </span>
              <span>{order.address}</span>
              {order.deliveryTimeSlot && (
                <span className="block text-[#DE9344] font-medium mt-0.5">
                  Scheduled Slot: {order.deliveryTimeSlot}
                </span>
              )}
            </div>
          </div>

          {/* Dedication card if present */}
          {order.giftMessage && (
            <div className="bg-[#FAF0E4] p-3.5 rounded-xl border border-[#DECDBA] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE9344] flex items-center gap-1">
                <Gift size={12} />
                <span>Personal Dedication Card:</span>
              </span>
              <p className="font-serif italic text-sm text-[#20120D] mt-1">"{order.giftMessage}"</p>
            </div>
          )}

          {/* Delivery Rider Notes if present */}
          {order.deliveryNotes && (
            <div className="bg-[#FFF9F2] p-3.5 rounded-xl border border-[#DE9344]/40 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DE9344] flex items-center gap-1.5 font-sans">
                <Truck size={12} />
                <span>Order Delivery Notes (Instructions for Delivery Rider):</span>
              </span>
              <p className="text-xs text-[#20120D] mt-1.5 font-medium leading-relaxed bg-white/80 p-2.5 rounded-lg border border-[#DECDBA]/60">
                "{order.deliveryNotes}"
              </p>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E574C] block">
              Purchased Bakery Items
            </span>
            <div className="border border-[#DECDBA] rounded-xl overflow-hidden divide-y divide-[#EFE6D8]">
              {order.items.map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {it.img && (
                      <img src={it.img} alt="" className="w-10 h-10 rounded-md object-cover border border-[#DECDBA] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-[#20120D] truncate">{it.name}</p>
                      {it.meta && <p className="text-[10px] text-[#B87326] truncate">{it.meta}</p>}
                      <p className="text-[10px] text-[#745C51]">
                        ₱{Number(it.price).toLocaleString()} × {it.qty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-bold text-[#20120D] shrink-0">
                    ₱{(Number(it.price) * it.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="border-t-2 border-dashed border-[#DECDBA] pt-4 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#745C51]">
              <span>Subtotal</span>
              <span>₱{Number(order.subtotal).toLocaleString()}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-[#745C51]">
                <span>Doorstep Delivery Fee</span>
                <span>₱{Number(order.deliveryFee).toLocaleString()}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-[#B87326] font-semibold">
                <span>Discount Saved</span>
                <span>-₱{Number(order.discount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-[#DECDBA] font-bold text-sm">
              <span className="text-[#20120D]">Total Amount Paid</span>
              <span className="font-display text-xl text-[#A8181E]">
                ₱{Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Receipt Stamp / Footer */}
          <div className="pt-6 border-t border-[#EFE6D8] text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#FAF3EB] text-[#DE9344] border border-[#DECDBA] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <Sparkles size={11} />
              <span>Official Bakehouse Invoice</span>
            </div>
            <p className="text-xs text-[#6E574C] font-serif italic max-w-sm mx-auto">
              "Thank you for welcoming Sweet Crumbs into your happiest moments. Handcrafted with farm eggs, dairy butter, and love."
            </p>
            <p className="text-[9px] text-[#9C8578] tracking-widest uppercase">
              Sweet Crumbs Bakery · Davao City, Philippines · Est. 2026
            </p>
          </div>

        </div>

        {/* Modal Bottom Close Button */}
        <div className="bg-[#FAF3EB] px-6 py-3 border-t border-[#DECDBA] flex items-center justify-between no-print">
          <span className="text-[11px] text-[#745C51]">Press Print to print or save as PDF</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#20120D] hover:text-[#A8181E] cursor-pointer"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
};
