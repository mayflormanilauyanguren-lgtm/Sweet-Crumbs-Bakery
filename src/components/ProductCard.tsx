import React from 'react';
import { Product } from '../types.ts';
import { Heart, Plus, Eye, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  const ratingValue = product.rating || 5;
  const starCount = Math.min(5, Math.max(1, Math.round(ratingValue)));
  const reviewsCount = product.reviewsCount || 12;

  // Tasteful badge styling matching bakery palette
  const getBadgeStyle = (badgeText?: string | null) => {
    if (!badgeText) return null;
    const lower = badgeText.toLowerCase();
    if (lower.includes('bestseller')) {
      return 'bg-[#25140C] text-[#FAF7F2] border border-[#DE9344]/30';
    }
    if (lower.includes('special') || lower.includes('deal')) {
      return 'bg-[#B81D24] text-white shadow-xs';
    }
    return 'bg-[#C0772C] text-white shadow-xs';
  };

  const badgeClass = getBadgeStyle(product.badge);

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onSelectProduct) {
      e.preventDefault();
      onSelectProduct(product);
    }
  };

  return (
    <article
      tabIndex={onSelectProduct ? 0 : undefined}
      role={onSelectProduct ? 'button' : undefined}
      aria-label={onSelectProduct ? `View details and reviews for ${product.name}` : undefined}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="group bg-white rounded-2xl overflow-hidden border border-[#F0E6D8] shadow-[0_4px_18px_rgba(45,26,18,0.05)] hover:shadow-[0_16px_36px_rgba(45,26,18,0.11)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col relative focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A8181E] cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative overflow-hidden aspect-[4/3] w-full bg-[#F7F2EA]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Subtle Gradient Sheen */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

        {/* Hover Quick View Pill */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="bg-[#20120D]/90 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <Eye size={13} />
            <span>View Details & Reviews</span>
          </span>
        </div>

        {/* Refined Badge */}
        {product.badge && badgeClass && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${badgeClass}`}>
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
            isInWishlist
              ? 'bg-[#B81D24] text-white'
              : 'bg-white/90 text-[#745C51] hover:text-[#B81D24] hover:bg-white backdrop-blur-xs'
          }`}
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={15}
            className={isInWishlist ? 'fill-current' : 'transition-transform group-hover:scale-110'}
          />
        </button>
      </div>

      {/* Product Content & Purchasing */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white">
        {/* Category & Interactive Rating Star trigger */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C0772C]">
            {product.category}
          </span>

          <div
            className="flex items-center text-xs text-[#DE9344] bg-[#FAF3EB] px-2 py-0.5 rounded-md border border-[#DECDBA]/60"
            title={`${ratingValue.toFixed(1)} out of 5 stars (${reviewsCount} customer reviews)`}
          >
            <Star size={11} className="fill-[#DE9344] text-[#DE9344] mr-1" />
            <span className="font-bold text-[11px] text-[#20120D]">{ratingValue.toFixed(1)}</span>
            <span className="text-[10px] text-[#9C8578] ml-1 font-medium tabular-nums">
              ({reviewsCount})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-[17px] font-bold text-[#25140C] group-hover:text-[#B81D24] transition-colors leading-snug mb-1.5">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#745C51] line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F5EDE3]">
          <div>
            <span className="text-[11px] text-[#9C8578] block -mb-0.5 font-medium">Price</span>
            <span className="font-display font-bold text-lg text-[#25140C] tabular-nums">
              ₱{product.price.toLocaleString()}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="inline-flex items-center gap-1.5 bg-[#20120D] hover:bg-[#A8181E] active:bg-[#160B07] text-white text-[11px] font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            title={`Add ${product.name} to bag`}
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>
    </article>
  );
};

