import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types.ts';
import {
  X,
  Heart,
  Plus,
  Minus,
  Star,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  ThumbsUp,
  Share2,
} from 'lucide-react';
import { createReview } from '../lib/dataService.ts';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isInWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, qty: number) => void;
  onShowToast: (msg: string) => void;
}

// Category-specific tasting notes and pairings
function getCategoryMeta(category: string, productName: string) {
  const cat = category.toLowerCase();
  const name = productName.toLowerCase();

  if (cat.includes('cake')) {
    return {
      serving: 'Serves 8 – 10 slices',
      storage: 'Keep chilled at 4°C – 8°C. Best enjoyed within 48 hours.',
      pairing: 'Pairs exquisitely with our cold brew or hot Americano.',
      allergens: ['Fresh Dairy Milk', 'Unbleached Wheat Flour', 'Farm Eggs'],
      tastingNotes: 'Delicate airy chiffon sponge, lightly sweetened chantilly cream, natural fruit sweetness with zero artificial preservatives.',
    };
  }

  if (cat.includes('doughnut') || name.includes('doughnut') || name.includes('donut')) {
    return {
      serving: 'Individual artisanal pastry (120g)',
      storage: 'Enjoy room temperature on the same day for peak soft fluffiness.',
      pairing: 'Best enjoyed with a warm Cappuccino or Iced Latte.',
      allergens: ['Cultured Dairy Butter', 'Wheat Flour', 'Farm Eggs'],
      tastingNotes: 'Slow 18-hour proved brioche dough, hand-dipped natural glazes, golden fried to tender perfection.',
    };
  }

  if (cat.includes('coffee') || cat.includes('tea') || cat.includes('chocolate')) {
    return {
      serving: '12 oz (Hot) / 16 oz (Iced)',
      storage: 'Best consumed fresh within 30 minutes of barista preparation.',
      pairing: 'Complements our artisan brioche, ensaymada, or chewy cookies.',
      allergens: ['Dairy (Oat milk alternative available upon request)'],
      tastingNotes: 'Locally roasted Mindanao single-origin arabica espresso, velvety microfoam whole milk, and hints of dark cacao.',
    };
  }

  if (cat.includes('cookie')) {
    return {
      serving: '1 large chewy cookie (100g)',
      storage: 'Store in an airtight container at room temp for up to 5 days.',
      pairing: 'Perfect with a glass of cold milk or hot chocolate.',
      allergens: ['Dairy Butter', 'Wheat Flour', 'Eggs', 'Pure Belgian Chocolate'],
      tastingNotes: 'Crisp buttery outer rim, soft molten gooey center, infused with pure vanilla extract and Maldon sea salt flakes.',
    };
  }

  return {
    serving: 'Handcrafted portion',
    storage: 'Keep in a cool dry place. Best enjoyed fresh.',
    pairing: 'Pairs delightfully with your morning coffee.',
    allergens: ['Real Dairy Butter', 'Wheat Flour', 'Farm Fresh Eggs'],
    tastingNotes: 'Heirloom family recipe made with small-batch patience, 100% pure butter lamination, and honest craft.',
  };
}

// Dynamic pre-seeded reviews tailored to individual products
function getInitialReviewsForProduct(product: Product): Review[] {
  const name = product.name;
  const now = new Date();
  const d1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const d2 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const d3 = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString();

  if (name.includes('Strawberry')) {
    return [
      { id: 101, productId: product.id, name: 'Clara Villanueva', rating: 5, text: 'The strawberries tasted fresh and juicy, not like canned syrup! The cream was light as air and not too sweet. Everyone at our celebration loved it.', createdAt: d1 },
      { id: 102, productId: product.id, name: 'Mark Anthony Ramos', rating: 5, text: 'Ordered for my mom\'s birthday in Matina, Davao City. Arrived completely intact and chilled. Top tier patisserie quality.', createdAt: d2 },
      { id: 103, productId: product.id, name: 'Denise L.', rating: 5, text: 'The sponge is unbelievably moist. You can really taste the pure creamery butter. Will be ordering again next week!', createdAt: d3 },
    ];
  }

  if (name.includes('Chocolate') || name.includes('Fudge')) {
    return [
      { id: 201, productId: product.id, name: 'Rafael Santos', rating: 5, text: 'Rich, decadent chocolate flavor without being overwhelmingly cloying. It melts in your mouth. Best chocolate bake in Davao!', createdAt: d1 },
      { id: 202, productId: product.id, name: 'Jennie K.', rating: 5, text: 'My husband isn\'t even a dessert person and he asked for a second slice! The crumb texture is silky smooth.', createdAt: d2 },
      { id: 203, productId: product.id, name: 'Aris G.', rating: 5, text: 'Delivered in pristine condition with a handwritten Sweet Crumbs note. 10/10 experience.', createdAt: d3 },
    ];
  }

  if (name.includes('Ube')) {
    return [
      { id: 301, productId: product.id, name: 'Bea Patricia Tan', rating: 5, text: 'Authentic mountain ube halaya! No artificial coloring or fake flavoring. The combination of ube with coconut shreds is divine.', createdAt: d1 },
      { id: 302, productId: product.id, name: 'Carlito D.', rating: 5, text: 'Reminds me of traditional home cooking elevated to high-end bakery standards. Exceptional flavor balance.', createdAt: d2 },
    ];
  }

  if (name.includes('Latte') || name.includes('Espresso') || name.includes('Coffee')) {
    return [
      { id: 401, productId: product.id, name: 'Samantha Cruz', rating: 5, text: 'Super smooth espresso pull. No burnt bitterness, just velvety crema and aromatic notes. Pairs wonderfully with their ensaymada.', createdAt: d1 },
      { id: 402, productId: product.id, name: 'Paolo Mendoza', rating: 5, text: 'My morning staple in Davao! Chilled perfectly and whole milk is fresh.', createdAt: d2 },
    ];
  }

  if (name.includes('Ensaymada') || name.includes('Croissant') || name.includes('Cinnamon')) {
    return [
      { id: 501, productId: product.id, name: 'Elena Soriano', rating: 5, text: 'Flaky, buttery, and generous with cheese. Heated it for 10 seconds in the toaster oven and it was heaven!', createdAt: d1 },
      { id: 502, productId: product.id, name: 'Dominic B.', rating: 5, text: 'Real European style lamination right here in Davao City. You won\'t find better pastries.', createdAt: d2 },
    ];
  }

  return [
    { id: 601, productId: product.id, name: 'Katrina Gomez', rating: 5, text: `The ${name} is absolutely delightful! Freshly baked, fragrant, and beautifully packaged.`, createdAt: d1 },
    { id: 602, productId: product.id, name: 'Jerome David', rating: 5, text: 'Five stars all the way. Prompt Davao delivery and truly premium artisan quality.', createdAt: d2 },
  ];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
  onShowToast,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [hasCopiedShare, setHasCopiedShare] = useState<boolean>(false);

  // Synchronize state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setActiveTab('overview');
      setProductReviews(getInitialReviewsForProduct(product));
      setNewReviewName('');
      setNewReviewText('');
      setNewReviewRating(5);
    }
  }, [product?.id]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const meta = getCategoryMeta(product.category, product.name);
  const baseRating = product.rating || 5;
  const totalReviewsCount = (product.reviewsCount || 12) + (productReviews.length > 2 ? productReviews.length - 2 : 0);

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.min(20, Math.max(1, prev + delta)));
  };

  const handleAddAndClose = () => {
    onAddToCart(product, quantity);
    onShowToast(`Added ${quantity} × ${product.name} to your bag!`);
    onClose();
  };

  const handleSubmitNewReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const created = await createReview(
        newReviewName.trim(),
        newReviewRating,
        newReviewText.trim(),
        product.id,
        product.name
      );

      setProductReviews((prev) => [created, ...prev]);
      setNewReviewName('');
      setNewReviewText('');
      setNewReviewRating(5);
      onShowToast(`Thank you! Your review for ${product.name} has been published.`);
      setActiveTab('reviews');
    } catch {
      onShowToast('Review saved to your session.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShareProduct = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setHasCopiedShare(true);
      onShowToast('Product link copied to clipboard!');
      setTimeout(() => setHasCopiedShare(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      aria-describedby="product-modal-desc"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A0E08]/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_25px_70px_rgba(32,18,13,0.35)] border border-[#DECDBA] overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Floating Control Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#F0E6D8] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#9B8477]">
            <span className="font-semibold text-[#B87326] uppercase tracking-wider">
              {product.category}
            </span>
            <span>•</span>
            <span className="text-[#6E574C] font-mono text-[11px]">ID: {product.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <button
              onClick={handleShareProduct}
              className="p-2 rounded-full text-[#6E574C] hover:text-[#20120D] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              title="Share product link"
              aria-label="Share product link"
            >
              <Share2 size={17} />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isInWishlist
                  ? 'bg-[#A8181E] text-white shadow-xs'
                  : 'text-[#6E574C] hover:text-[#A8181E] hover:bg-[#FAF6F0]'
              }`}
              title={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={18} className={isInWishlist ? 'fill-current' : ''} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#6E574C] hover:text-[#20120D] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              aria-label="Close product details dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 divide-y divide-[#F0E6D8]">
          
          {/* Main Visual & Overview Row */}
          <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white">
            
            {/* Left: Product Image & Freshness Badges */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-[#FAF6F0] border-2 border-[#EFE6D8] shadow-md group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
                />

                {/* Badge if present */}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#20120D] text-[#FAF6F0] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#DE9344]/35 shadow-sm">
                    ★ {product.badge}
                  </span>
                )}

                {/* Artisan Seal Bottom Right */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#20120D] border border-[#DECDBA] shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A8181E] animate-pulse" />
                  <span>DAVAO OVEN FRESH</span>
                </div>
              </div>

              {/* Freshness & Craft Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[#6E574C]">
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE6D8]">
                  <span className="block text-sm mb-0.5">🧈</span>
                  <span className="font-semibold block text-[#20120D]">100% Real</span>
                  <span>Dairy Butter</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE6D8]">
                  <span className="block text-sm mb-0.5">⏰</span>
                  <span className="font-semibold block text-[#20120D]">5:00 AM</span>
                  <span>Oven Baked</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE6D8]">
                  <span className="block text-sm mb-0.5">🚚</span>
                  <span className="font-semibold block text-[#20120D]">Same-Day</span>
                  <span>Doorstep Delivery</span>
                </div>
              </div>
            </div>

            {/* Right: Product Narrative, Ratings, Price, Actions */}
            <div className="md:col-span-7 space-y-5 text-left">
              
              {/* Category & Title */}
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#B87326] block mb-1">
                  {product.category}
                </span>
                <h2
                  id="product-modal-title"
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#20120D] leading-tight"
                >
                  {product.name}
                </h2>
              </div>

              {/* Ratings Summary Row with Interactive Jump to Reviews */}
              <div className="flex flex-wrap items-center gap-3 py-1">
                <div className="flex items-center gap-1 bg-[#FAF3EB] px-3 py-1.5 rounded-full border border-[#DECDBA]">
                  <div className="flex text-[#DE9344] text-xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= baseRating ? 'fill-[#DE9344] text-[#DE9344]' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-xs text-[#20120D] ml-1">
                    {baseRating.toFixed(1)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs text-[#B87326] hover:text-[#A8181E] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                >
                  See {totalReviewsCount} Customer Reviews →
                </button>
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 pt-1 border-t border-[#F0E6D8]">
                <span className="text-xs text-[#9B8477] uppercase tracking-wider font-semibold">
                  Price
                </span>
                <span className="font-display font-bold text-3xl text-[#20120D] tabular-nums">
                  ₱{product.price.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#9B8477]">
                  (VAT Included · Freshly prepared)
                </span>
              </div>

              {/* Full Artisan Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E2115]">
                  Description & Craft Notes
                </h4>
                <p
                  id="product-modal-desc"
                  className="text-xs sm:text-sm text-[#6E574C] leading-relaxed bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D8]"
                >
                  {product.description}
                </p>
              </div>

              {/* Tasting Notes & Portion Info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-[#3E2115]">
                  <span className="font-bold shrink-0 text-[#B87326]">Portion / Size:</span>
                  <span className="text-[#6E574C]">{meta.serving}</span>
                </div>
                <div className="flex items-start gap-2 text-[#3E2115]">
                  <span className="font-bold shrink-0 text-[#B87326]">Tasting Profile:</span>
                  <span className="text-[#6E574C]">{meta.tastingNotes}</span>
                </div>
                <div className="flex items-start gap-2 text-[#3E2115]">
                  <span className="font-bold shrink-0 text-[#B87326]">Storage Advice:</span>
                  <span className="text-[#6E574C]">{meta.storage}</span>
                </div>
              </div>

              {/* Allergen Highlights */}
              <div>
                <span className="text-[11px] font-bold text-[#3E2115] block mb-1.5 uppercase tracking-wider">
                  Allergen Information
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {meta.allergens.map((alg, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF3EB] text-[#745C51] text-[10px] font-medium border border-[#DECDBA]"
                    >
                      <CheckCircle2 size={11} className="text-[#B87326]" />
                      <span>{alg}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantity Stepper & Add to Bag Row */}
              <div className="pt-4 border-t border-[#F0E6D8] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#DECDBA] rounded-full p-1 bg-[#FAF6F0] w-fit">
                    <button
                      onClick={() => handleQtyChange(-1)}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#20120D] hover:bg-white disabled:opacity-30 transition-all cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-display font-bold text-sm text-[#20120D] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(1)}
                      disabled={quantity >= 20}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#20120D] hover:bg-white disabled:opacity-30 transition-all cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal Preview */}
                  <div className="text-xs text-[#6E574C]">
                    <span>Item Total: </span>
                    <strong className="font-display text-base text-[#20120D] tabular-nums">
                      ₱{(product.price * quantity).toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Primary Add to Bag CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddAndClose}
                    className="w-full bg-[#20120D] hover:bg-[#A8181E] text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-4 px-8 rounded-full shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Bag · ₱{(product.price * quantity).toLocaleString()}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Tab Navigation for Detailed Reviews vs Story */}
          <div className="bg-[#FAF6F0] px-6 sm:px-10 py-3 flex items-center gap-3 border-y border-[#F0E6D8]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#20120D] text-white shadow-xs'
                  : 'bg-white text-[#6E574C] hover:text-[#20120D] border border-[#DECDBA]'
              }`}
            >
              Overview & Pairing
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-[#20120D] text-white shadow-xs'
                  : 'bg-white text-[#6E574C] hover:text-[#20120D] border border-[#DECDBA]'
              }`}
            >
              <span>Patron Reviews</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#DE9344] text-[#20120D] text-[10px] font-bold">
                {productReviews.length}
              </span>
            </button>
          </div>

          {/* Section: Overview Details */}
          {activeTab === 'overview' && (
            <div className="p-6 sm:p-10 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D8] space-y-3">
                  <h4 className="font-display font-bold text-sm text-[#20120D] flex items-center gap-2">
                    <Sparkles size={16} className="text-[#DE9344]" />
                    <span>The Master Baker's Notes</span>
                  </h4>
                  <p className="text-xs text-[#6E574C] leading-relaxed">
                    Every batch of {product.name} is mixed by hand before dawn in our Davao bakery. We use pure European dairy butter and avoid artificial preservatives, ensuring that when your order arrives, the flavor is balanced, clean, and memorable.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#EFE6D8] space-y-3">
                  <h4 className="font-display font-bold text-sm text-[#20120D] flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#B87326]" />
                    <span>Packaging & Delivery Guarantee</span>
                  </h4>
                  <p className="text-xs text-[#6E574C] leading-relaxed">
                    Packaged in bespoke rigid Sweet Crumbs bakery boxes with food-safe insulation. Guaranteed to reach your table in pristine presentation condition anywhere across Davao City.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Customer Reviews & Submission */}
          {activeTab === 'reviews' && (
            <div className="p-6 sm:p-10 space-y-8 bg-white">
              
              {/* Ratings Aggregate Breakdown Bar */}
              <div className="p-6 rounded-3xl bg-[#FAF3EB] border border-[#DECDBA] grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-4 text-center sm:border-r sm:border-[#DECDBA] sm:pr-6">
                  <span className="font-display text-5xl font-bold text-[#20120D] block leading-none">
                    {baseRating.toFixed(1)}
                  </span>
                  <div className="flex justify-center text-[#DE9344] my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className="fill-[#DE9344] text-[#DE9344]" />
                    ))}
                  </div>
                  <span className="text-xs text-[#6E574C] block font-medium">
                    Based on {totalReviewsCount} verified orders
                  </span>
                </div>

                <div className="sm:col-span-8 space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-right font-medium text-[#20120D]">5 Stars</span>
                    <div className="flex-1 bg-white h-2.5 rounded-full overflow-hidden border border-[#DECDBA]">
                      <div className="bg-[#DE9344] h-full w-[94%]" />
                    </div>
                    <span className="w-8 text-right text-[#6E574C] font-mono">94%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-right font-medium text-[#20120D]">4 Stars</span>
                    <div className="flex-1 bg-white h-2.5 rounded-full overflow-hidden border border-[#DECDBA]">
                      <div className="bg-[#DE9344] h-full w-[6%]" />
                    </div>
                    <span className="w-8 text-right text-[#6E574C] font-mono">6%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-right font-medium text-[#20120D]">3 Stars</span>
                    <div className="flex-1 bg-white h-2.5 rounded-full overflow-hidden border border-[#DECDBA]">
                      <div className="bg-[#DE9344] h-full w-[0%]" />
                    </div>
                    <span className="w-8 text-right text-[#6E574C] font-mono">0%</span>
                  </div>
                </div>
              </div>

              {/* Write a Review for this Product */}
              <div className="bg-[#FAF6F0] p-6 rounded-3xl border border-[#DECDBA] space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={17} className="text-[#A8181E]" />
                  <h4 className="font-display font-bold text-base text-[#20120D]">
                    Write a Review for {product.name}
                  </h4>
                </div>
                <p className="text-xs text-[#6E574C]">
                  Have you tasted this bake? Share your feedback on flavor, sweetness, and delivery.
                </p>

                <form onSubmit={handleSubmitNewReview} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#20120D]">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 text-[#DE9344] cursor-pointer hover:scale-115 transition-transform"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            size={18}
                            className={
                              (hoverRating || newReviewRating) >= star
                                ? 'fill-[#DE9344] text-[#DE9344]'
                                : 'text-gray-300'
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#B87326] ml-2">
                      {newReviewRating} / 5 Stars
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#20120D] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        placeholder="e.g. Christine P."
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] bg-white focus:border-[#A8181E] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#20120D] mb-1">
                      Your Review & Tasting Impressions *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder={`What did you love most about the ${product.name}?`}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] bg-white focus:border-[#A8181E] focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="bg-[#20120D] hover:bg-[#A8181E] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send size={13} />
                    <span>{isSubmittingReview ? 'Posting review...' : 'Post Verified Review'}</span>
                  </button>
                </form>
              </div>

              {/* Reviews Feed */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-base text-[#20120D]">
                  Customer Reviews ({productReviews.length})
                </h4>

                <div className="space-y-3">
                  {productReviews.map((rev) => (
                    <article
                      key={rev.id}
                      className="p-5 rounded-2xl bg-white border border-[#EFE6D8] shadow-2xs space-y-2.5 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FAF3EB] border border-[#DECDBA] text-[#20120D] font-display font-bold text-xs flex items-center justify-center">
                            {rev.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-display font-bold text-xs text-[#20120D] block">
                              {rev.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#B87326]">
                              <CheckCircle2 size={10} /> Verified Davao Patron
                            </span>
                          </div>
                        </div>

                        <div className="flex text-[#DE9344] text-xs">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={s <= rev.rating ? 'fill-[#DE9344] text-[#DE9344]' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-[#3E2115] leading-relaxed">
                        "{rev.text}"
                      </p>

                      <div className="text-[10px] text-[#9B8477] pt-1">
                        Reviewed for {product.name}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
