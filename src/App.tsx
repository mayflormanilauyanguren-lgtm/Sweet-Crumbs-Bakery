import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Product, CartItem, Order, Review } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { WishlistDrawer } from './components/WishlistDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { TrackingModal } from './components/TrackingModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import {
  fetchProducts,
  fetchReviews,
  createReview,
  createContactMessage,
} from './lib/dataService.ts';
import {
  Sparkles,
  Search,
  ArrowRight,
  Gift,
  Cake,
  Truck,
  Send,
  Upload,
  Clock,
  ShieldCheck,
  Coffee,
  CheckCircle2,
  ShoppingBag,
  Plus,
  Eye,
  Star,
  Zap,
} from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { user, profile } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Admin access state
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return window.location.hash === '#admin' || window.location.hash === '#portal';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('sc_admin_authenticated') === 'true';
  });

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sc_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>(undefined);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Shop filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('default');
  const [specialTab, setSpecialTab] = useState<'strawberry' | 'ube'>('strawberry');

  // Custom cake builder state
  const [cakeFlavor, setCakeFlavor] = useState('Chocolate');
  const [cakeSize, setCakeSize] = useState<'6' | '8' | '10' | '12'>('8');
  const [cakeFrosting, setCakeFrosting] = useState('Vanilla');
  const [cakeDesign, setCakeDesign] = useState('Simple');
  const [cakeMessage, setCakeMessage] = useState('');
  const [cakeQty, setCakeQty] = useState(1);
  const [cakePhoto, setCakePhoto] = useState<string>('');

  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState('5');
  const [reviewerText, setReviewerText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync hash changes and secret keyboard shortcuts for Admin Portal
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#portal') {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
        const cleanPage = hash.replace('#', '') || 'home';
        if (['home', 'shop', 'categories', 'custom-cake', 'promotions', 'about', 'contact'].includes(cleanPage)) {
          setCurrentPage(cleanPage);
        }
      }
    };

    // Secret keyboard shortcut for bakery staff: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminView((prev) => {
          const next = !prev;
          if (next) {
            window.location.hash = '#admin';
          } else {
            window.location.hash = '';
          }
          return next;
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load products and reviews via Supabase dataService
  const loadInitialData = async () => {
    setLoadingProducts(true);
    try {
      const [prodList, revList] = await Promise.all([fetchProducts(), fetchReviews()]);
      setProducts(prodList);
      setReviews(revList);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync cart & wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('sc_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('sc_wishlist', JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds]);

  // Cart operations
  const handleAddToCart = (product: Product, quantityToAdd: number = 1) => {
    const qtyToAdd = Math.max(1, quantityToAdd);
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === product.id && !item.meta);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += qtyToAdd;
        return copy;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: qtyToAdd,
          img: product.image,
        },
      ];
    });
    showToast(`${qtyToAdd > 1 ? `${qtyToAdd} × ` : ''}${product.name} added to cart!`);
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(index);
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      copy[index].qty = newQty;
      return copy;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => {
      const item = prev[index];
      if (item) showToast(`${item.name} removed from cart`);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(`${product.name} removed from wishlist`);
        return prev.filter((id) => id !== product.id);
      }
      showToast(`${product.name} added to wishlist!`);
      return [...prev, product.id];
    });
  };

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Custom cake pricing
  const sizePrices: Record<string, number> = { '6': 650, '8': 850, '10': 1100, '12': 1400 };
  const frostingPrices: Record<string, number> = { Vanilla: 0, Chocolate: 0, Strawberry: 50, 'Cream Cheese': 80 };
  const designPrices: Record<string, number> = { Simple: 0, Birthday: 100, Wedding: 300, Anniversary: 200, Graduation: 150 };

  const customCakeUnitPrice =
    (sizePrices[cakeSize] || 850) +
    (frostingPrices[cakeFrosting] || 0) +
    (designPrices[cakeDesign] || 0);

  const customCakeTotal = customCakeUnitPrice * cakeQty;

  const FLAVOR_IMAGES: Record<string, string> = {
    Chocolate: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80',
    Vanilla: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=700&q=80',
    'Red Velvet': 'https://images.unsplash.com/photo-1586985289906-406988974504?auto=format&fit=crop&w=700&q=80',
    Strawberry: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=700&q=80',
    Ube: 'https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=700&q=80',
  };

  const handleCustomCakePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Please select a photo smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCakePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomCakeToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const metaParts = [`${cakeSize}" • ${cakeFlavor} • ${cakeFrosting} frosting • ${cakeDesign}`];
    if (cakeMessage.trim()) metaParts.push(`Message: "${cakeMessage.trim()}"`);
    if (cakePhoto) metaParts.push('Inspiration photo attached');

    const customItem: CartItem = {
      id: 'custom-' + Date.now(),
      name: `Custom Cake (${cakeFlavor})`,
      price: customCakeUnitPrice,
      qty: cakeQty,
      img: cakePhoto || FLAVOR_IMAGES[cakeFlavor] || FLAVOR_IMAGES['Chocolate'],
      meta: metaParts.join(' — '),
    };

    setCart((prev) => [...prev, customItem]);
    showToast('Custom dream cake added to your cart!');
    setIsCartOpen(true);
  };

  // Promo code
  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoMessage({ text: 'Please enter a discount code.', isError: true });
      return;
    }
    if (code === 'SWEET10') {
      setAppliedDiscount(10);
      setPromoMessage({ text: 'Code "SWEET10" applied — 10% off your entire order!', isError: false });
      showToast('10% discount applied to your order!');
    } else if (code === 'WELCOME15') {
      setAppliedDiscount(15);
      setPromoMessage({ text: 'Code "WELCOME15" applied — 15% off your entire order!', isError: false });
      showToast('15% discount applied to your order!');
    } else {
      setAppliedDiscount(0);
      setPromoMessage({ text: 'Invalid discount code. Try SWEET10 or WELCOME15.', isError: true });
    }
  };

  // Daily kitchen specials data
  const dailySpecials = {
    strawberry: {
      id: 'special-strawberry-bliss',
      name: 'Strawberry Bliss Cake',
      tag: "Today's Kitchen Highlight",
      desc: 'Layers of delicate vanilla sponge, freshly sliced sweet strawberries, and rich chantilly cream. Baked fresh this morning with 15% special savings applied.',
      originalPrice: 950,
      specialPrice: 807,
      image: 'https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=900&q=80',
    },
    ube: {
      id: 'special-ube-halaya',
      name: 'Signature Ube Halaya Cake',
      tag: "Today's Kitchen Highlight",
      desc: 'Real boiled mountain ube halaya gently folded into chiffon sponge layers, topped with whipped vanilla cream and toasted coconut shreds.',
      originalPrice: 999,
      specialPrice: 849,
      image: 'https://images.unsplash.com/photo-1640839954789-ca0049648b18?auto=format&fit=crop&w=900&q=80',
    },
  };

  const handleOrderSpecial = (spec: typeof dailySpecials.strawberry) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === spec.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: spec.id,
          name: spec.name,
          price: spec.specialPrice,
          qty: 1,
          img: spec.image,
          meta: `Today's Special (15% Off Reg. ₱${spec.originalPrice.toLocaleString()})`,
        },
      ];
    });
    showToast(`${spec.name} added to cart with 15% savings!`);
    setIsCartOpen(true);
  };

  // Review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerText.trim()) return;

    setSubmittingReview(true);
    try {
      const newRev = await createReview(
        reviewerName.trim(),
        Number(reviewerRating),
        reviewerText.trim()
      );
      setReviews((prev) => [newRev, ...prev]);
      setReviewerName('');
      setReviewerText('');
      setReviewerRating('5');
      showToast('Thank you! Your review has been saved.');
    } catch {
      showToast('Could not save review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Contact form submission
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setSubmittingContact(true);
    try {
      await createContactMessage(
        contactName.trim(),
        contactEmail.trim(),
        contactMessage.trim()
      );
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      showToast('Message sent! Our bakehouse team will contact you soon.');
    } catch {
      showToast('Failed to send message. Please try again.');
    } finally {
      setSubmittingContact(false);
    }
  };

  const navigateTo = (page: string, targetId?: string) => {
    setIsAdminView(false);
    window.location.hash = page === 'home' ? '' : `#${page}`;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (targetId) {
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  // Categories list
  const categoryList = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products for Shop page
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-low') return a.price - b.price;
    if (sortOption === 'price-high') return b.price - a.price;
    if (sortOption === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortOption === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const bestsellers = products.filter((p) => p.badge?.toLowerCase() === 'bestseller');
  const featured = products.filter((p) => p.badge?.toLowerCase() === 'featured' || (!p.badge && (p.rating ?? 0) >= 4.9));

  // ================= ADMIN ROUTE SEPARATION =================
  if (isAdminView) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            showToast('Admin authenticated successfully.');
          }}
          onReturnToStore={() => navigateTo('home')}
        />
      );
    }

    return (
      <AdminDashboard
        onClose={() => navigateTo('home')}
        onSignOut={() => {
          sessionStorage.removeItem('sc_admin_authenticated');
          setIsAdminAuthenticated(false);
          navigateTo('home');
          showToast('Signed out from Admin Dashboard.');
        }}
        onShowToast={showToast}
        onProductsUpdated={loadInitialData}
      />
    );
  }

  // ================= CUSTOMER STOREFRONT =================
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D1A12]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#25140C] text-[#FAF7F2] px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-medium border border-[#DE9344]/30 flex items-center gap-2.5 animate-bounce">
          <span className="text-base">🍰</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Customer Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Pages */}
      <main className="flex-1">
        {/* ================= HOME PAGE (EDITORIAL STORYTELLING) ================= */}
        {currentPage === 'home' && (
          <div className="page-animate space-y-16 sm:space-y-24 pb-16">
            
            {/* 1. IMMERSIVE HERO ("BAKED FOR YOUR SWEETEST MOMENTS") */}
            <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 sm:pt-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                
                {/* Left: Editorial Statement & CTAs */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  {/* Baked Today Badge (Requirement 16) */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3EB] border border-[#DECDBA] text-[#B87326] text-xs font-semibold tracking-wide shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#A8181E] animate-pulse" />
                    <span>BAKED TODAY · 5:00 AM OVEN FRESH · DAVAO CITY</span>
                  </div>

                  {/* Oversized Editorial Typography */}
                  <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-bold text-[#20120D] leading-[0.98] tracking-tight">
                    BAKED<br />
                    FOR YOUR<br />
                    <span className="italic font-normal text-[#A8181E]">SWEETEST</span><br />
                    MOMENTS.
                  </h1>

                  <p className="text-sm sm:text-base text-[#6E574C] max-w-lg leading-relaxed">
                    Where pure creamery butter, slow-proved brioche dough, and simmered mountain ube meet your morning coffee in Davao City. Every confection tells a story of patience, warmth, and craft.
                  </p>

                  {/* Primary & Secondary Action Pair */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    <button
                      onClick={() => navigateTo('shop')}
                      className="bg-[#20120D] hover:bg-[#A8181E] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer inline-flex items-center gap-2.5"
                    >
                      <span>Shop The Collection</span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={() => navigateTo('about')}
                      className="border border-[#DECDBA] hover:border-[#20120D] bg-white hover:bg-[#FAF6F0] text-[#20120D] font-semibold text-xs sm:text-sm uppercase tracking-wider px-7 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs"
                    >
                      Explore Our Story
                    </button>
                  </div>

                  {/* Micro Craft Tags */}
                  <div className="pt-6 border-t border-[#EFE6D8] flex flex-wrap items-center gap-6 text-xs text-[#9B8477]">
                    <span className="font-semibold text-[#20120D]">EST. 2026</span>
                    <span>•</span>
                    <span>100% Real Dairy Butter</span>
                    <span>•</span>
                    <span>Farm-Fresh Eggs</span>
                    <span>•</span>
                    <span>Davao Doorstep Delivery</span>
                  </div>
                </div>

                {/* Right: Asymmetric Cinematic Showcase with Floating Product */}
                <div className="lg:col-span-5 relative">
                  <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                    {/* Architectural Arch Image Container */}
                    <div className="relative arch-mask-lg overflow-hidden shadow-[0_24px_60px_rgba(32,18,13,0.14)] border-4 border-white bg-white">
                      <img
                        src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80"
                        alt="Signature strawberry layer cake fresh from oven"
                        className="w-full h-[430px] sm:h-[490px] object-cover object-center hover:scale-103 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Floating Product Card (Requirement 3) */}
                    <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#DECDBA] shadow-xl flex items-center gap-4 max-w-[290px]">
                      <button
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Strawberry Bliss')) || {
                            id: 'classic-cake-2',
                            name: 'Strawberry Bliss Cake',
                            price: 1200,
                            image: 'https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=600&q=80',
                            category: 'Classic Cakes',
                            rating: 5,
                            reviewsCount: 38,
                            description: 'Freshly prepared strawberry bliss cake made for Sweet Crumbs Bakery.',
                          };
                          setSelectedProductModal(prod);
                        }}
                        className="w-13 h-13 rounded-xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#EFE6D8] cursor-pointer hover:opacity-90 transition-opacity"
                        title="View reviews and details"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=200&q=80"
                          alt="Strawberry Bliss Cake thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <div
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Strawberry Bliss')) || {
                            id: 'classic-cake-2',
                            name: 'Strawberry Bliss Cake',
                            price: 1200,
                            image: 'https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=600&q=80',
                            category: 'Classic Cakes',
                            rating: 5,
                            reviewsCount: 38,
                            description: 'Freshly prepared strawberry bliss cake made for Sweet Crumbs Bakery.',
                          };
                          setSelectedProductModal(prod);
                        }}
                        className="min-w-0 flex-1 cursor-pointer"
                        title="View reviews and details"
                      >
                        <span className="text-[10px] uppercase font-bold text-[#B87326] block tracking-wider">
                          Signature Cake
                        </span>
                        <h4 className="font-display font-bold text-xs sm:text-sm text-[#20120D] truncate hover:text-[#A8181E] transition-colors">
                          Strawberry Bliss
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-bold text-xs text-[#20120D]">
                            ₱1,200
                          </span>
                          <span className="text-[10px] text-[#B87326] font-semibold flex items-center">
                            ★ 5.0 (38)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Strawberry Bliss')) || {
                            id: 'classic-cake-2',
                            name: 'Strawberry Bliss Cake',
                            price: 1200,
                            image: 'https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=600&q=80',
                            category: 'Classic Cakes',
                            rating: 5,
                            reviewsCount: 38,
                            description: 'Freshly prepared strawberry bliss cake made for Sweet Crumbs Bakery.',
                          };
                          handleAddToCart(prod);
                        }}
                        className="bg-[#20120D] hover:bg-[#A8181E] text-white p-2 rounded-full transition-colors cursor-pointer shadow-xs shrink-0"
                        title="Add to bag"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Floating Circular Artisan Seal */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[#20120D] text-[#FAF6F0] p-2 flex flex-col items-center justify-center text-center shadow-xl border-2 border-[#DE9344]/40 rotate-12">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#DE9344]">MADE WITH</span>
                      <span className="font-display text-sm font-bold leading-tight">LOVE</span>
                      <span className="text-[8px] text-[#C8B8AB]">DAVAO</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 2. BRAND STORY SECTION ("MORE THAN JUST A BAKERY") (Requirement 5) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl p-8 sm:p-14 lg:p-16 border border-[#EFE6D8] shadow-[0_8px_32px_rgba(32,18,13,0.04)] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                
                {/* Left Story Text */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="text-xs uppercase tracking-widest font-bold text-[#B87326]">
                    01 / OUR CRAFT & ROOTS
                  </div>
                  
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#20120D] leading-[1.12]">
                    "MORE THAN<br />JUST A BAKERY."
                  </h2>

                  <p className="font-display text-lg sm:text-xl italic text-[#3E2115] leading-relaxed">
                    Every Sweet Crumbs creation starts with simple ingredients, careful hands, and a little extra love.
                  </p>

                  <p className="text-xs sm:text-sm text-[#6E574C] leading-relaxed">
                    Founded in Davao City, our bakehouse was born from an unyielding commitment to authentic European lamination, heirloom Filipino delicacies, and small-batch dedication. We never cut corners with hydrogenated shortening or pre-mixed powders. We fire our ovens before sunrise so your morning bite is warm, fragrant, and unforgettable.
                  </p>

                  {/* Heritage Markers */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#EFE6D8] text-center">
                    <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EFE6D8]">
                      <span className="font-display font-bold text-base sm:text-lg text-[#20120D] block">EST. 2026</span>
                      <span className="text-[10px] text-[#9B8477] uppercase tracking-wider">Davao City</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EFE6D8]">
                      <span className="font-display font-bold text-base sm:text-lg text-[#A8181E] block">SMALL-BATCH</span>
                      <span className="text-[10px] text-[#9B8477] uppercase tracking-wider">Baking Daily</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EFE6D8]">
                      <span className="font-display font-bold text-base sm:text-lg text-[#B87326] block">100% REAL</span>
                      <span className="text-[10px] text-[#9B8477] uppercase tracking-wider">Dairy Butter</span>
                    </div>
                  </div>
                </div>

                {/* Right Lifestyle Photo */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-[#FAF6F0] bg-[#FAF6F0]">
                    <img
                      src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                      alt="Artisan baker dusting flour over fresh brioche pastry"
                      className="w-full h-80 sm:h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 text-white text-xs italic font-display">
                      "Slow craft in a fast world."
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 3. FEATURED PRODUCT SPOTLIGHT ("BREAK THE GRID") (Requirement 6) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#FAF3EB] rounded-3xl p-6 sm:p-12 lg:p-14 border border-[#DECDBA] shadow-[0_12px_36px_rgba(32,18,13,0.05)]">
                <div className="text-xs uppercase tracking-widest font-bold text-[#B87326] mb-8">
                  02 / CHEF'S DAILY MASTERPIECE
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Dominant Image (~60%) */}
                  <div className="lg:col-span-7">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
                      <img
                        src="https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=1200&q=80"
                        alt="Strawberry Bliss Cake luxury showcase"
                        className="w-full h-80 sm:h-96 lg:h-[460px] object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-4 left-4 bg-[#20120D] text-[#FAF6F0] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-[#DE9344]/30">
                        FEATURED TODAY
                      </div>
                    </div>
                  </div>

                  {/* Editorial Details (~40%) */}
                  <div className="lg:col-span-5 space-y-5 text-left">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#A8181E] block">
                      Signature Cake Collection
                    </span>
                    <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#20120D] leading-tight">
                      Strawberry Bliss Cake
                    </h3>

                    {/* Tasting Ingredients */}
                    <div className="space-y-2 py-2 border-y border-[#DECDBA] text-xs text-[#3E2115]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#A8181E]">🍓</span>
                        <span>Freshly sliced sweet strawberries</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#B87326]">🧈</span>
                        <span>Delicate vanilla chiffon sponge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#DE9344]">🥛</span>
                        <span>Pure dairy chantilly cream frosting</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#6E574C] leading-relaxed">
                      Our pastry team's crowning achievement. Four layers of airy sponge, hand-brushed with berry coulis and filled with ripe strawberries. Light, balanced, and never overly sweet.
                    </p>

                    <div className="pt-2 flex items-baseline gap-3">
                      <span className="text-xs text-[#9B8477]">Price</span>
                      <span className="font-display font-bold text-3xl text-[#20120D]">₱1,200</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Strawberry Bliss')) || {
                            id: 'classic-cake-2',
                            name: 'Strawberry Bliss Cake',
                            price: 1200,
                            image: 'https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=600&q=80',
                            category: 'Classic Cakes',
                            rating: 5,
                            reviewsCount: 38,
                            description: 'Freshly prepared strawberry bliss cake made for Sweet Crumbs Bakery.',
                          };
                          handleAddToCart(prod);
                        }}
                        className="bg-[#20120D] hover:bg-[#A8181E] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                      >
                        <ShoppingBag size={14} />
                        <span>Add To Bag</span>
                      </button>

                      <button
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Strawberry Bliss')) || {
                            id: 'classic-cake-2',
                            name: 'Strawberry Bliss Cake',
                            price: 1200,
                            image: 'https://images.unsplash.com/photo-1611293388250-580b08c4a145?auto=format&fit=crop&w=600&q=80',
                            category: 'Classic Cakes',
                            rating: 5,
                            reviewsCount: 38,
                            description: 'Freshly prepared strawberry bliss cake made for Sweet Crumbs Bakery.',
                          };
                          setSelectedProductModal(prod);
                        }}
                        className="border border-[#DECDBA] hover:border-[#20120D] bg-white text-[#20120D] font-semibold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-full transition-all duration-200 cursor-pointer shadow-2xs inline-flex items-center gap-2 hover:-translate-y-0.5"
                      >
                        <Eye size={15} />
                        <span>Tasting Notes & Reviews</span>
                      </button>

                      <button
                        onClick={() => navigateTo('custom-cake')}
                        className="border border-[#DECDBA] hover:border-[#20120D] bg-white text-[#20120D] font-semibold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-full transition-all duration-200 cursor-pointer shadow-2xs"
                      >
                        Customize In Studio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. BEST SELLERS — MASONRY / EDITORIAL ARRANGEMENT (Requirement 7 & 8) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest font-bold text-[#B87326] mb-1">
                    03 / THE ONES EVERYONE KEEPS COMING BACK FOR
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#20120D]">
                    BEST SELLERS.
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E574C] mt-1 max-w-md">
                    Handmade daily and beloved by dessert enthusiasts across Davao City.
                  </p>
                </div>

                <button
                  onClick={() => navigateTo('shop')}
                  className="text-xs font-bold uppercase tracking-wider text-[#A8181E] hover:text-[#20120D] transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <span>View All 50+ Bakery Treats</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Asymmetric Masonry Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Hero Slot 1: Tall Dominant Cake Card (Left 5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl overflow-hidden border border-[#EFE6D8] shadow-[0_8px_30px_rgba(32,18,13,0.06)] hover:shadow-xl transition-all duration-300 flex flex-col group">
                  <div
                    onClick={() => {
                      const prod = products.find((p) => p.name.includes('Chocolate Dream')) || {
                        id: 'classic-cake-1',
                        name: 'Chocolate Dream Cake',
                        price: 999,
                        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
                        category: 'Classic Cakes',
                        rating: 5,
                        reviewsCount: 42,
                        description: 'Freshly prepared chocolate dream cake made for Sweet Crumbs Bakery.',
                      };
                      setSelectedProductModal(prod);
                    }}
                    className="relative h-72 sm:h-96 w-full bg-[#FAF6F0] overflow-hidden cursor-pointer"
                    title="View tasting notes, ratings and reviews"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
                      alt="Chocolate Dream Cake bestseller"
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-[#20120D] text-[#FAF6F0] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#DE9344]/30">
                      ★ BESTSELLER #1
                    </div>
                    {/* Hover Quick View pill */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-[#20120D]/90 backdrop-blur-md text-white text-[11px] font-semibold tracking-wider uppercase px-4 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
                        <Eye size={13} />
                        <span>View Reviews & Details</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#B87326]">
                          Classic Cakes
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Chocolate Dream')) || {
                              id: 'classic-cake-1',
                              name: 'Chocolate Dream Cake',
                              price: 999,
                              image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
                              category: 'Classic Cakes',
                              rating: 5,
                              reviewsCount: 42,
                              description: 'Freshly prepared chocolate dream cake made for Sweet Crumbs Bakery.',
                            };
                            setSelectedProductModal(prod);
                          }}
                          className="flex items-center text-xs text-[#DE9344] bg-[#FAF3EB] px-2.5 py-1 rounded-full border border-[#DECDBA] cursor-pointer hover:border-[#A8181E] transition-colors"
                          title="View 42 customer reviews"
                        >
                          <Star size={12} className="fill-[#DE9344] text-[#DE9344] mr-1" />
                          <span className="font-bold text-xs text-[#20120D]">5.0</span>
                          <span className="text-[10px] text-[#9C8578] ml-1 font-medium">(42 reviews)</span>
                        </button>
                      </div>

                      <h3
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Chocolate Dream')) || {
                            id: 'classic-cake-1',
                            name: 'Chocolate Dream Cake',
                            price: 999,
                            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
                            category: 'Classic Cakes',
                            rating: 5,
                            reviewsCount: 42,
                            description: 'Freshly prepared chocolate dream cake made for Sweet Crumbs Bakery.',
                          };
                          setSelectedProductModal(prod);
                        }}
                        className="font-display text-2xl font-bold text-[#20120D] mt-1 group-hover:text-[#A8181E] transition-colors cursor-pointer"
                      >
                        Chocolate Dream Cake
                      </h3>
                      <p className="text-xs text-[#6E574C] mt-2 leading-relaxed">
                        "Silky Belgian dark cocoa ganache layered between velvety chocolate chiffon sponge. Deep, decadent, and impossible to forget."
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#EFE6D8] flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-[#9B8477] uppercase tracking-wider block">Price</span>
                        <span className="font-display font-bold text-xl text-[#20120D]">₱999</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Chocolate Dream')) || {
                              id: 'classic-cake-1',
                              name: 'Chocolate Dream Cake',
                              price: 999,
                              image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
                              category: 'Classic Cakes',
                              rating: 5,
                              reviewsCount: 42,
                              description: 'Freshly prepared chocolate dream cake made for Sweet Crumbs Bakery.',
                            };
                            setSelectedProductModal(prod);
                          }}
                          className="border border-[#DECDBA] hover:border-[#20120D] bg-[#FAF6F0] text-[#20120D] text-xs font-semibold px-3.5 py-2.5 rounded-full transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Eye size={13} />
                          <span>Reviews</span>
                        </button>
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Chocolate Dream')) || {
                              id: 'classic-cake-1',
                              name: 'Chocolate Dream Cake',
                              price: 999,
                              image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
                              category: 'Classic Cakes',
                              rating: 5,
                              reviewsCount: 42,
                              description: 'Freshly prepared chocolate dream cake made for Sweet Crumbs Bakery.',
                            };
                            handleAddToCart(prod);
                          }}
                          className="bg-[#20120D] hover:bg-[#A8181E] text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 inline-flex items-center gap-1.5"
                        >
                          <ShoppingBag size={13} />
                          <span>Add To Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 7 Cols: 4 Varied Specialty Product Blocks */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Card 2: Cookies */}
                  <div className="bg-white rounded-3xl p-5 border border-[#EFE6D8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                    <div
                      onClick={() => {
                        const prod = products.find((p) => p.name.includes('Chocolate Chip Cookies')) || {
                          id: 'cookie-1',
                          name: 'Chocolate Chip Cookies',
                          price: 110,
                          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80',
                          category: 'Cookies',
                          rating: 5,
                          reviewsCount: 62,
                          description: 'Freshly prepared chocolate chip cookies made for Sweet Crumbs Bakery.',
                        };
                        setSelectedProductModal(prod);
                      }}
                      className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF6F0] mb-4 cursor-pointer relative"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80"
                        alt="Chocolate chip cookies"
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-[#DE9344] flex items-center gap-1 border border-[#DECDBA]">
                        <Star size={10} className="fill-[#DE9344]" />
                        <span>5.0 (62)</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87326]">Cookies</span>
                      <h4
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Chocolate Chip Cookies')) || {
                            id: 'cookie-1',
                            name: 'Chocolate Chip Cookies',
                            price: 110,
                            image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80',
                            category: 'Cookies',
                            rating: 5,
                            reviewsCount: 62,
                            description: 'Freshly prepared chocolate chip cookies made for Sweet Crumbs Bakery.',
                          };
                          setSelectedProductModal(prod);
                        }}
                        className="font-display text-lg font-bold text-[#20120D] group-hover:text-[#A8181E] transition-colors cursor-pointer"
                      >
                        Chocolate Chip Cookies
                      </h4>
                      <p className="text-xs text-[#6E574C] mt-1 italic">
                        "Soft center. Crisp edges. Impossible to stop at one."
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#EFE6D8] flex items-center justify-between">
                      <span className="font-display font-bold text-base text-[#20120D]">₱110</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Chocolate Chip Cookies')) || {
                              id: 'cookie-1',
                              name: 'Chocolate Chip Cookies',
                              price: 110,
                              image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80',
                              category: 'Cookies',
                              rating: 5,
                              reviewsCount: 62,
                              description: 'Freshly prepared chocolate chip cookies made for Sweet Crumbs Bakery.',
                            };
                            setSelectedProductModal(prod);
                          }}
                          className="text-[11px] font-semibold text-[#6E574C] hover:text-[#A8181E] cursor-pointer"
                        >
                          Reviews
                        </button>
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Chocolate Chip Cookies')) || {
                              id: 'cookie-1',
                              name: 'Chocolate Chip Cookies',
                              price: 110,
                              image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80',
                              category: 'Cookies',
                              rating: 5,
                              reviewsCount: 62,
                              description: 'Freshly prepared chocolate chip cookies made for Sweet Crumbs Bakery.',
                            };
                            handleAddToCart(prod);
                          }}
                          className="text-xs font-bold uppercase tracking-wider text-[#A8181E] hover:text-[#20120D] transition-colors cursor-pointer"
                        >
                          Add To Bag →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Iced Coffee */}
                  <div className="bg-white rounded-3xl p-5 border border-[#EFE6D8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                    <div
                      onClick={() => {
                        const prod = products.find((p) => p.name.includes('Iced Latte')) || {
                          id: 'iced-coffee-2',
                          name: 'Iced Latte',
                          price: 150,
                          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
                          category: 'Iced Coffee',
                          rating: 5,
                          reviewsCount: 18,
                          description: 'Freshly prepared iced latte made for Sweet Crumbs Bakery.',
                        };
                        setSelectedProductModal(prod);
                      }}
                      className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF6F0] mb-4 cursor-pointer relative"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
                        alt="Iced Vanilla Latte"
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-[#DE9344] flex items-center gap-1 border border-[#DECDBA]">
                        <Star size={10} className="fill-[#DE9344]" />
                        <span>5.0 (18)</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87326]">Iced Brew</span>
                      <h4
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Iced Latte')) || {
                            id: 'iced-coffee-2',
                            name: 'Iced Latte',
                            price: 150,
                            image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
                            category: 'Iced Coffee',
                            rating: 5,
                            reviewsCount: 18,
                            description: 'Freshly prepared iced latte made for Sweet Crumbs Bakery.',
                          };
                          setSelectedProductModal(prod);
                        }}
                        className="font-display text-lg font-bold text-[#20120D] group-hover:text-[#A8181E] transition-colors cursor-pointer"
                      >
                        Iced Vanilla Latte
                      </h4>
                      <p className="text-xs text-[#6E574C] mt-1 italic">
                        "Slow-steeped espresso over farm-fresh whole milk & vanilla."
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#EFE6D8] flex items-center justify-between">
                      <span className="font-display font-bold text-base text-[#20120D]">₱150</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Iced Latte')) || {
                              id: 'iced-coffee-2',
                              name: 'Iced Latte',
                              price: 150,
                              image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
                              category: 'Iced Coffee',
                              rating: 5,
                              reviewsCount: 18,
                              description: 'Freshly prepared iced latte made for Sweet Crumbs Bakery.',
                            };
                            setSelectedProductModal(prod);
                          }}
                          className="text-[11px] font-semibold text-[#6E574C] hover:text-[#A8181E] cursor-pointer"
                        >
                          Reviews
                        </button>
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Iced Latte')) || {
                              id: 'iced-coffee-2',
                              name: 'Iced Latte',
                              price: 150,
                              image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
                              category: 'Iced Coffee',
                              rating: 5,
                              reviewsCount: 18,
                              description: 'Freshly prepared iced latte made for Sweet Crumbs Bakery.',
                            };
                            handleAddToCart(prod);
                          }}
                          className="text-xs font-bold uppercase tracking-wider text-[#A8181E] hover:text-[#20120D] transition-colors cursor-pointer"
                        >
                          Add To Bag →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Doughnut */}
                  <div className="bg-white rounded-3xl p-5 border border-[#EFE6D8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                    <div
                      onClick={() => {
                        const prod = products.find((p) => p.name.includes('Strawberry Sprinkle')) || {
                          id: 'classic-doughnut-3',
                          name: 'Strawberry Sprinkle',
                          price: 70,
                          image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80',
                          category: 'Classic Doughnuts',
                          rating: 5,
                          reviewsCount: 39,
                          description: 'Freshly prepared strawberry sprinkle made for Sweet Crumbs Bakery.',
                        };
                        setSelectedProductModal(prod);
                      }}
                      className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF6F0] mb-4 cursor-pointer relative"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80"
                        alt="Strawberry Sprinkle Doughnut"
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-[#DE9344] flex items-center gap-1 border border-[#DECDBA]">
                        <Star size={10} className="fill-[#DE9344]" />
                        <span>5.0 (39)</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87326]">Doughnuts</span>
                      <h4
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Strawberry Sprinkle')) || {
                            id: 'classic-doughnut-3',
                            name: 'Strawberry Sprinkle',
                            price: 70,
                            image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80',
                            category: 'Classic Doughnuts',
                            rating: 5,
                            reviewsCount: 39,
                            description: 'Freshly prepared strawberry sprinkle made for Sweet Crumbs Bakery.',
                          };
                          setSelectedProductModal(prod);
                        }}
                        className="font-display text-lg font-bold text-[#20120D] group-hover:text-[#A8181E] transition-colors cursor-pointer"
                      >
                        Strawberry Sprinkle Doughnut
                      </h4>
                      <p className="text-xs text-[#6E574C] mt-1 italic">
                        "18-hour proved brioche dipped in natural strawberry puree."
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#EFE6D8] flex items-center justify-between">
                      <span className="font-display font-bold text-base text-[#20120D]">₱70</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Strawberry Sprinkle')) || {
                              id: 'classic-doughnut-3',
                              name: 'Strawberry Sprinkle',
                              price: 70,
                              image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80',
                              category: 'Classic Doughnuts',
                              rating: 5,
                              reviewsCount: 39,
                              description: 'Freshly prepared strawberry sprinkle made for Sweet Crumbs Bakery.',
                            };
                            setSelectedProductModal(prod);
                          }}
                          className="text-[11px] font-semibold text-[#6E574C] hover:text-[#A8181E] cursor-pointer"
                        >
                          Reviews
                        </button>
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Strawberry Sprinkle')) || {
                              id: 'classic-doughnut-3',
                              name: 'Strawberry Sprinkle',
                              price: 70,
                              image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80',
                              category: 'Classic Doughnuts',
                              rating: 5,
                              reviewsCount: 39,
                              description: 'Freshly prepared strawberry sprinkle made for Sweet Crumbs Bakery.',
                            };
                            handleAddToCart(prod);
                          }}
                          className="text-xs font-bold uppercase tracking-wider text-[#A8181E] hover:text-[#20120D] transition-colors cursor-pointer"
                        >
                          Add To Bag →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Ensaymada */}
                  <div className="bg-white rounded-3xl p-5 border border-[#EFE6D8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                    <div
                      onClick={() => {
                        const prod = products.find((p) => p.name.includes('Ensaymada')) || {
                          id: 'bread-4',
                          name: 'Ensaymada',
                          price: 100,
                          image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80',
                          category: 'Bread & Pastries',
                          rating: 5,
                          reviewsCount: 46,
                          description: 'Freshly prepared ensaymada made for Sweet Crumbs Bakery.',
                        };
                        setSelectedProductModal(prod);
                      }}
                      className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF6F0] mb-4 cursor-pointer relative"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
                        alt="Artisan Butter Ensaymada"
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-[#DE9344] flex items-center gap-1 border border-[#DECDBA]">
                        <Star size={10} className="fill-[#DE9344]" />
                        <span>5.0 (46)</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B87326]">Pastries</span>
                      <h4
                        onClick={() => {
                          const prod = products.find((p) => p.name.includes('Ensaymada')) || {
                            id: 'bread-4',
                            name: 'Ensaymada',
                            price: 100,
                            image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80',
                            category: 'Bread & Pastries',
                            rating: 5,
                            reviewsCount: 46,
                            description: 'Freshly prepared ensaymada made for Sweet Crumbs Bakery.',
                          };
                          setSelectedProductModal(prod);
                        }}
                        className="font-display text-lg font-bold text-[#20120D] group-hover:text-[#A8181E] transition-colors cursor-pointer"
                      >
                        Artisan Butter Ensaymada
                      </h4>
                      <p className="text-xs text-[#6E574C] mt-1 italic">
                        "Swirled with pure creamery butter & aged cheddar shreds."
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#EFE6D8] flex items-center justify-between">
                      <span className="font-display font-bold text-base text-[#20120D]">₱100</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Ensaymada')) || {
                              id: 'bread-4',
                              name: 'Ensaymada',
                              price: 100,
                              image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80',
                              category: 'Bread & Pastries',
                              rating: 5,
                              reviewsCount: 46,
                              description: 'Freshly prepared ensaymada made for Sweet Crumbs Bakery.',
                            };
                            setSelectedProductModal(prod);
                          }}
                          className="text-[11px] font-semibold text-[#6E574C] hover:text-[#A8181E] cursor-pointer"
                        >
                          Reviews
                        </button>
                        <button
                          onClick={() => {
                            const prod = products.find((p) => p.name.includes('Ensaymada')) || {
                              id: 'bread-4',
                              name: 'Ensaymada',
                              price: 100,
                              image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80',
                              category: 'Bread & Pastries',
                              rating: 5,
                              reviewsCount: 46,
                              description: 'Freshly prepared ensaymada made for Sweet Crumbs Bakery.',
                            };
                            handleAddToCart(prod);
                          }}
                          className="text-xs font-bold uppercase tracking-wider text-[#A8181E] hover:text-[#20120D] transition-colors cursor-pointer"
                        >
                          Add To Bag →
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 4.5. TODAY'S KITCHEN HIGHLIGHT (Interactive Daily Special Spotlight) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#24130C] rounded-3xl overflow-hidden border border-[#4D2E21] shadow-2xl">
                {/* Header Switcher Tabs */}
                <div className="flex flex-wrap items-center justify-between border-b border-[#4D2E21] px-6 sm:px-10 py-4 gap-4 bg-[#1E0F0A]">
                  <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#DE9344]">
                    <Sparkles size={14} className="text-[#DE9344]" />
                    <span>TODAY'S KITCHEN HIGHLIGHT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSpecialTab('strawberry')}
                      className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                        specialTab === 'strawberry'
                          ? 'bg-[#DE9344] text-[#20120D] shadow-sm'
                          : 'bg-white/5 text-[#D5C2AD] hover:text-white hover:bg-white/10'
                      }`}
                    >
                      🍓 Strawberry Bliss
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpecialTab('ube')}
                      className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                        specialTab === 'ube'
                          ? 'bg-[#DE9344] text-[#20120D] shadow-sm'
                          : 'bg-white/5 text-[#D5C2AD] hover:text-white hover:bg-white/10'
                      }`}
                    >
                      💜 Ube Halaya
                    </button>
                  </div>
                </div>

                {/* Content Grid */}
                {(() => {
                  const spec = dailySpecials[specialTab];
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                      {/* Left Info: High Contrast Cream & Gold */}
                      <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE9344]/15 border border-[#DE9344]/30 text-[#DE9344] text-[11px] font-bold uppercase tracking-wider">
                          <span>15% Special Daily Savings</span>
                        </div>

                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF7F2] !text-[#FAF7F2] tracking-tight leading-tight">
                          {spec.name}
                        </h2>

                        <p className="text-sm text-[#D5C2AD] leading-relaxed max-w-lg">
                          {spec.desc}
                        </p>

                        <div className="flex items-baseline gap-4 pt-2">
                          <div className="text-left">
                            <span className="text-xs text-[#A89487] line-through block">
                              ₱{spec.originalPrice} Reg.
                            </span>
                            <span className="font-display font-bold text-3xl sm:text-4xl text-[#DE9344]">
                              ₱{spec.specialPrice} Today
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleOrderSpecial(spec)}
                            className="bg-[#DE9344] hover:bg-[#EEA858] text-[#20120D] font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2 hover:scale-102"
                          >
                            <ShoppingBag size={16} />
                            <span>Add Today's Special To Bag</span>
                          </button>
                        </div>
                      </div>

                      {/* Right Photo */}
                      <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-full min-h-[340px] bg-black/30 overflow-hidden">
                        <img
                          src={spec.image}
                          alt={spec.name}
                          className="w-full h-full object-cover object-center transition-all duration-700 hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#24130C] via-transparent to-transparent pointer-events-none lg:block hidden" />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20">
                          ★ Fresh From Morning Oven
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* 5. BAKERY CATEGORIES ("A VISUAL BAKERY MENU") (Requirement 10) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs uppercase tracking-widest font-bold text-[#B87326] block mb-1">
                  04 / THE BAKEHOUSE PANTRY
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#20120D]">
                  "WHAT ARE YOU CRAVING TODAY?"
                </h2>
                <p className="text-xs sm:text-sm text-[#6E574C] mt-2">
                  Select a collection to browse everything we bake and brew every morning.
                </p>
              </div>

              {/* Varied Proportion Photographic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Cakes (Large Feature) */}
                <div
                  onClick={() => {
                    setSelectedCategory('Classic Cakes');
                    navigateTo('shop');
                  }}
                  className="group relative h-80 rounded-3xl overflow-hidden shadow-md cursor-pointer border border-[#DECDBA]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
                    alt="Layered celebration cakes"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DE9344]">Signature Cakes</span>
                    <h3 className="font-display text-2xl font-bold text-white">Classic Cakes</h3>
                    <p className="text-xs text-gray-200">"Celebrate beautifully with bespoke chiffon & fudge layers."</p>
                  </div>
                </div>

                {/* 2. Doughnuts */}
                <div
                  onClick={() => {
                    setSelectedCategory('Classic Doughnuts');
                    navigateTo('shop');
                  }}
                  className="group relative h-80 rounded-3xl overflow-hidden shadow-md cursor-pointer border border-[#DECDBA]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80"
                    alt="Brioche glazed doughnuts"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DE9344]">Hand-Dipped</span>
                    <h3 className="font-display text-2xl font-bold text-white">Artisan Doughnuts</h3>
                    <p className="text-xs text-gray-200">"Brioche dough proved 18 hours, glazed fresh each morning."</p>
                  </div>
                </div>

                {/* 3. Coffee & Brews */}
                <div
                  onClick={() => {
                    setSelectedCategory('Coffee');
                    navigateTo('shop');
                  }}
                  className="group relative h-80 rounded-3xl overflow-hidden shadow-md cursor-pointer border border-[#DECDBA]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
                    alt="Specialty espresso coffee"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DE9344]">Slow Pulled</span>
                    <h3 className="font-display text-2xl font-bold text-white">Specialty Coffee</h3>
                    <p className="text-xs text-gray-200">"Single-origin espresso & chilled cold brew bottles."</p>
                  </div>
                </div>

                {/* 4. Chewy Cookies */}
                <div
                  onClick={() => {
                    setSelectedCategory('Cookies');
                    navigateTo('shop');
                  }}
                  className="group relative h-72 rounded-3xl overflow-hidden shadow-md cursor-pointer border border-[#DECDBA]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80"
                    alt="Chewy artisan cookies"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DE9344]">Warm from Oven</span>
                    <h3 className="font-display text-xl font-bold text-white">Chewy Cookies</h3>
                    <p className="text-xs text-gray-200">"Crispy edges, gooey centers, packed with chocolate."</p>
                  </div>
                </div>

                {/* 5. Flaky Pastries */}
                <div
                  onClick={() => {
                    setSelectedCategory('Bread & Pastries');
                    navigateTo('shop');
                  }}
                  className="group relative h-72 rounded-3xl overflow-hidden shadow-md cursor-pointer border border-[#DECDBA]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"
                    alt="Laminated croissants and pastries"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DE9344]">French Lamination</span>
                    <h3 className="font-display text-xl font-bold text-white">Flaky Pastries</h3>
                    <p className="text-xs text-gray-200">"Pure butter croissants, cinnamon rolls & ensaymada."</p>
                  </div>
                </div>

                {/* 6. Gourmet Cupcakes */}
                <div
                  onClick={() => {
                    setSelectedCategory('Cupcakes');
                    navigateTo('shop');
                  }}
                  className="group relative h-72 rounded-3xl overflow-hidden shadow-md cursor-pointer border border-[#DECDBA]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80"
                    alt="Gourmet buttercream cupcakes"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DE9344]">Swirled Buttercream</span>
                    <h3 className="font-display text-xl font-bold text-white">Gourmet Cupcakes</h3>
                    <p className="text-xs text-gray-200">"Handcrafted bite-sized confections for afternoon tea."</p>
                  </div>
                </div>

              </div>
            </section>

            {/* 6. IMMERSIVE FULL-WIDTH SENSORY BREAK (Requirement 11 & 19) */}
            <section className="relative overflow-hidden bg-[#1D100A] text-[#FAF6F0] py-20 sm:py-28 my-6">
              <div className="absolute inset-0 opacity-25">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80"
                  alt="Pastry kitchen sensory background"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#160B07]/95 via-[#1D100A]/85 to-[#160B07]/95" />

              <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6">
                <span className="text-xs uppercase tracking-widest font-bold text-[#DE9344] block">
                  THE SWEET CRUMBS PHILOSOPHY
                </span>

                <h2
                  style={{ color: '#FFFFFF' }}
                  className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold !text-white text-white leading-tight"
                >
                  "MADE FRESH.<br />
                  MADE SLOW.<br />
                  MADE WITH LOVE."
                </h2>

                <p className="text-sm sm:text-base text-[#D5C2AD] max-w-xl mx-auto leading-relaxed">
                  In an age of instant industrial baking, we take our time. Real dough requires patience, pure dairy butter, and the heat of wood and stone. Good things are worth savoring.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => navigateTo('shop')}
                    className="bg-[#DE9344] hover:bg-[#EEA858] text-[#20120D] font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg cursor-pointer"
                  >
                    Explore Our Full Menu →
                  </button>
                </div>
              </div>
            </section>

            {/* 7. EDITORIAL PROMOTION — BAKERY POSTER ADVERTISEMENT (Requirement 12) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-[#20120D] via-[#2D160E] to-[#20120D] text-white rounded-3xl p-8 sm:p-14 border border-[#4A2D1F] shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Poster Left */}
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE9344]/20 text-[#DE9344] text-[11px] font-bold uppercase tracking-wider border border-[#DE9344]/30">
                    <Sparkles size={12} />
                    <span>05 / THIS WEEK'S SWEET DEAL</span>
                  </div>

                  <h2
                    style={{ color: '#FFFFFF' }}
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold !text-white text-white leading-none tracking-tight"
                  >
                    10% OFF YOUR<br />
                    NEXT ORDER.
                  </h2>

                  <p className="text-xs sm:text-sm text-[#D5C2AD] leading-relaxed max-w-md">
                    Celebrating a birthday or treating your office in Davao? Apply promo voucher <strong className="text-white">SWEET10</strong> at checkout to save 10% on all artisan bakes.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <div className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-sm font-mono font-bold tracking-widest text-[#DE9344]">
                      SWEET10
                    </div>

                    <button
                      onClick={() => {
                        setAppliedDiscount(10);
                        showToast('Promo code SWEET10 applied — 10% off your entire bag!');
                        setIsCartOpen(true);
                      }}
                      className="bg-[#DE9344] hover:bg-[#EEA858] text-[#20120D] font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full transition-all duration-200 cursor-pointer shadow-md"
                    >
                      Apply 10% Voucher To Bag
                    </button>
                  </div>
                </div>

                {/* Poster Right Image with Gold Framing */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#DE9344]/40 bg-white group">
                    <img
                      src="https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=700&q=80"
                      alt="Artisan strawberry cake voucher showcase"
                      className="w-full h-72 sm:h-84 object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-[#20120D]/90 backdrop-blur-md text-[#DE9344] text-[10px] font-bold px-3 py-1 rounded-full border border-[#DE9344]/30">
                      ★ FRESH OVEN PROMOTION
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 8. CUSTOM CAKE EXPERIENCE ("YOU DREAM IT. WE BAKE IT.") (Requirement 13) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#EFE6D8] shadow-[0_8px_30px_rgba(32,18,13,0.05)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Visual Preview Left */}
                <div className="lg:col-span-6 relative">
                  <div className="relative rounded-3xl overflow-hidden bg-[#FAF6F0] p-6 border border-[#EFE6D8] shadow-inner text-center">
                    <img
                      src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
                      alt="Custom celebration cake builder preview"
                      className="w-full h-72 sm:h-80 object-cover rounded-2xl shadow-md mx-auto"
                    />

                    {/* Floating Customizer Chips */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white border border-[#EFE6D8] text-[11px] font-semibold text-[#20120D] shadow-2xs">
                        🎂 8" Round Tier
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white border border-[#EFE6D8] text-[11px] font-semibold text-[#B87326] shadow-2xs">
                        Vanilla & Strawberries
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white border border-[#EFE6D8] text-[11px] font-semibold text-[#A8181E] shadow-2xs">
                        Piped: "Happy Birthday!"
                      </span>
                    </div>
                  </div>
                </div>

                {/* Experience Copy Right */}
                <div className="lg:col-span-6 space-y-6 text-left">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#B87326]">
                    CELEBRATION DESIGN STUDIO
                  </span>

                  <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#20120D] leading-tight">
                    "YOU DREAM IT.<br />
                    WE BAKE IT."
                  </h2>

                  <p className="text-xs sm:text-sm text-[#6E574C] leading-relaxed">
                    Have an upcoming milestone, anniversary, or intimate dinner? Our master bakers customize diameter (6" to 12"), sponge flavors, buttercream variations, and personalized piped inscriptions.
                  </p>

                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-xs text-[#9B8477]">Custom orders start at</span>
                    <span className="font-display font-bold text-2xl text-[#20120D]">₱650</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigateTo('custom-cake')}
                      className="bg-[#20120D] hover:bg-[#A8181E] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2.5"
                    >
                      <Cake size={16} />
                      <span>Start Your Custom Cake →</span>
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* 9. CUSTOMER LOVE — HUMAN EDITORIAL TESTIMONIAL (Requirement 15) */}
            <section id="feedback-section" className="bg-[#FAF3EB] border-y border-[#DECDBA] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center max-w-xl mx-auto">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#B87326] block mb-1">
                    06 / PATRON VOICES
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#20120D]">
                    CUSTOMER LOVE.
                  </h2>
                </div>

                {/* Big Human Focal Quote */}
                <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-[#DECDBA] shadow-md text-center space-y-4">
                  <div className="text-lg text-[#DE9344] tracking-widest">★★★★★</div>
                  <blockquote className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-[#20120D] leading-snug">
                    "Honestly one of the best cakes we've ordered in Davao. The cake was breathtaking to look at, but it tasted even better. You can genuinely taste the real butter and slow craft."
                  </blockquote>
                  <div className="pt-2 text-xs font-semibold text-[#B87326] tracking-wider uppercase">
                    — Maria Santos, Davao City
                  </div>
                </div>

                {/* Live Reviews Feed & Submission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {reviews.slice(0, 2).map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-6 rounded-2xl border border-[#EFE6D8] shadow-2xs space-y-2 text-left"
                    >
                      <div className="flex text-[#DE9344] text-xs">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                      <p className="text-xs text-[#3E2115] italic">"{rev.text}"</p>
                      <span className="font-display font-bold text-xs text-[#20120D] block pt-2">
                        — {rev.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Review Submission Accordion / Form */}
                <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE6D8] shadow-sm text-left">
                  <h4 className="font-display text-lg font-bold text-[#20120D] mb-1">
                    Leave a Review
                  </h4>
                  <p className="text-xs text-[#6E574C] mb-4">
                    Share your experience with our cakes or coffee.
                  </p>

                  <form onSubmit={handleSubmitReview} className="space-y-3.5">
                    <div>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        required
                        placeholder="Your Name (e.g. Andrea)"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] bg-[#FAF6F0] focus:border-[#A8181E] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <select
                        value={reviewerRating}
                        onChange={(e) => setReviewerRating(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] bg-[#FAF6F0] focus:border-[#A8181E] focus:outline-hidden"
                      >
                        <option value="5">★★★★★ Exceptional (5/5)</option>
                        <option value="4">★★★★☆ Delicious (4/5)</option>
                        <option value="3">★★★☆☆ Good (3/5)</option>
                      </select>
                    </div>
                    <div>
                      <textarea
                        value={reviewerText}
                        onChange={(e) => setReviewerText(e.target.value)}
                        required
                        rows={2}
                        placeholder="What made your pastry or cake special?"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DECDBA] bg-[#FAF6F0] focus:border-[#A8181E] focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-[#20120D] hover:bg-[#A8181E] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-full transition-colors cursor-pointer shadow-xs"
                    >
                      {submittingReview ? 'Saving review...' : 'Post Review'}
                    </button>
                  </form>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ================= SHOP PAGE ================= */}
        {currentPage === 'shop' && (
          <div className="page-animate max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C0772C] block mb-1">
                Artisan Storefront
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#25140C]">
                Shop Fresh Bakes
              </h1>
              <p className="text-xs sm:text-sm text-[#745C51] mt-2">
                Browse our complete menu of freshly baked cakes, pastries, doughnuts, and barista drinks.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#F0E6D8] shadow-xs mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-3 text-[#9C8578]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cakes, ube, croissants, latte, matcha..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2D2BE] bg-[#FAF7F2] text-xs sm:text-sm focus:border-[#B81D24] focus:outline-hidden"
                  />
                </div>

                <div className="w-full sm:w-56">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-[#E2D2BE] bg-[#FAF7F2] text-xs sm:text-sm focus:border-[#B81D24] focus:outline-hidden"
                  >
                    <option value="default">Sort: Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categoryList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-[#25140C] text-white shadow-xs'
                        : 'bg-[#FAF7F2] border border-[#E2D2BE] text-[#4A2718] hover:border-[#25140C]'
                    }`}
                  >
                    {cat === 'all' ? 'All Treats' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-[#745C51] mb-6 px-1">
              <span>Showing {sortedProducts.length} of {products.length} products</span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-[#B81D24] font-semibold hover:underline cursor-pointer"
                >
                  Reset category filter
                </button>
              )}
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="text-center py-24 text-[#745C51] bg-white rounded-2xl border border-[#F0E6D8]">
                Loading products from Supabase...
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#F0E6D8] p-8">
                <p className="font-display text-xl font-bold text-[#25140C]">No products found matching your search.</p>
                <p className="text-xs text-[#745C51] mt-1">Try another keyword or reset the category filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 bg-[#25140C] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#B81D24] transition-colors cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isInWishlist={wishlistIds.includes(p.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    onSelectProduct={(product) => setSelectedProductModal(product)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= CATEGORIES PAGE ================= */}
        {currentPage === 'categories' && (
          <div className="page-animate max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C0772C] block mb-1">
                Artisan Collections
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#25140C]">
                Shop by Category
              </h1>
              <p className="text-xs sm:text-sm text-[#745C51] mt-2">
                Discover our specialty bakes, handcrafted sweets, and barista creations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Classic & Signature Cakes',
                  category: 'Classic Cakes',
                  desc: 'Layered chocolate indulgence, strawberry chiffon, heirloom ube halaya, and creamy cheesecake.',
                  img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80',
                },
                {
                  title: 'Fresh Coffee & Espresso',
                  category: 'Coffee',
                  desc: 'Espresso, Americano, Cappuccino, Café Latte, and Mocha pulled with premium beans.',
                  img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',
                },
                {
                  title: 'Iced Coffee & Refreshers',
                  category: 'Iced Coffee',
                  desc: 'Slow steeped cold brew, Iced Vanilla Latte, and Iced Mocha served chilled to perfection.',
                  img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80',
                },
                {
                  title: 'Artisan Doughnuts',
                  category: 'Classic Doughnuts',
                  desc: 'Brioche glazed, dark chocolate dip, strawberry sprinkle, cookies & cream, and matcha glaze.',
                  img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=700&q=80',
                },
                {
                  title: 'Gourmet Cupcakes',
                  category: 'Cupcakes',
                  desc: 'Hand-swirled buttercream cupcakes in chocolate, vanilla bean, strawberry, and ube velvet.',
                  img: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=700&q=80',
                },
                {
                  title: 'Chewy Artisan Cookies',
                  category: 'Cookies',
                  desc: 'Golden chocolate chip, triple chocolate fudge, and cinnamon toasted oatmeal bakes.',
                  img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=80',
                },
                {
                  title: 'Breads & Flaky Pastries',
                  category: 'Bread & Pastries',
                  desc: 'French butter croissants, cinnamon brioche rolls, and traditional Filipino butter ensaymada.',
                  img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80',
                },
                {
                  title: 'Rich Cocoa & Herbal Teas',
                  category: 'Hot Chocolate',
                  desc: 'Davao tablea hot chocolate, organic jasmine green tea, and aromatic Earl Grey infusions.',
                  img: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=700&q=80',
                },
              ].map((c, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedCategory(c.category);
                    navigateTo('shop');
                  }}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#F0E6D8] shadow-[0_4px_18px_rgba(45,26,18,0.05)] hover:shadow-[0_16px_36px_rgba(45,26,18,0.11)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="h-52 overflow-hidden bg-[#F7F2EA] relative">
                    <img
                      src={c.img}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#25140C] group-hover:text-[#B81D24] transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-xs text-[#745C51] mt-1.5 leading-relaxed line-clamp-2">
                        {c.desc}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-[#F5EDE3] flex items-center text-xs font-bold text-[#B81D24] group-hover:translate-x-1 transition-transform">
                      <span>Explore Collection</span>
                      <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= CUSTOM CAKE PAGE ================= */}
        {currentPage === 'custom-cake' && (
          <div className="page-animate max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C0772C] block mb-1">
                Artisan Studio
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#25140C]">
                Create Your Dream Cake
              </h1>
              <p className="text-xs sm:text-sm text-[#745C51] mt-2">
                Personalize size, flavor, frosting, celebration theme, and piped inscription with live estimation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sticky Preview Stage */}
              <div className="lg:col-span-5 sticky top-28">
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F0E6D8] shadow-md space-y-4">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#F7F2EA] border border-[#E2D2BE]">
                    <img
                      src={cakePhoto || FLAVOR_IMAGES[cakeFlavor] || FLAVOR_IMAGES['Chocolate']}
                      alt="Custom cake preview"
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    {cakePhoto && (
                      <span className="absolute top-3 left-3 bg-[#25140C] text-[#FAF7F2] text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                        Inspiration Photo Attached
                      </span>
                    )}
                  </div>

                  <div className="bg-[#FAF3EB] p-4 rounded-2xl border border-[#E8D9C5] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#745C51] font-medium block">Estimated Price</span>
                      <span className="font-display text-2xl sm:text-3xl font-bold text-[#25140C]">
                        ₱{customCakeTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right text-xs text-[#745C51]">
                      <span className="font-bold text-[#25140C] block">{cakeSize}" {cakeFlavor}</span>
                      <span>{cakeFrosting} frosting</span>
                    </div>
                  </div>

                  {cakeMessage.trim() && (
                    <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E2D2BE] text-xs">
                      <span className="font-bold text-[#25140C]">Piped Message: </span>
                      <span className="italic text-[#B81D24]">"{cakeMessage}"</span>
                    </div>
                  )}

                  <div className="text-[11px] text-[#9C8578] space-y-1">
                    <p>• Requires minimum 24–48 hours notice for handcrafted baking.</p>
                    <p>• Chilled doorstep delivery across Davao City.</p>
                  </div>
                </div>
              </div>

              {/* Form Customizer */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6D8] shadow-sm">
                <form onSubmit={handleAddCustomCakeToCart} className="space-y-6">
                  {/* Step 1: Flavor */}
                  <div>
                    <label className="block font-display text-base font-bold text-[#25140C] mb-2.5">
                      1. Select Sponge Flavor
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Chocolate', 'Vanilla', 'Red Velvet', 'Strawberry', 'Ube'].map((flv) => (
                        <button
                          type="button"
                          key={flv}
                          onClick={() => setCakeFlavor(flv)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            cakeFlavor === flv
                              ? 'bg-[#25140C] text-white shadow-xs'
                              : 'bg-[#FAF7F2] border border-[#E2D2BE] text-[#4A2718] hover:border-[#25140C]'
                          }`}
                        >
                          {flv}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Size */}
                  <div>
                    <label className="block font-display text-base font-bold text-[#25140C] mb-2.5">
                      2. Cake Diameter & Servings
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { size: '6', label: '6 inches', price: '₱650', serves: '4–6 guests' },
                        { size: '8', label: '8 inches', price: '₱850', serves: '8–12 guests' },
                        { size: '10', label: '10 inches', price: '₱1,100', serves: '14–18 guests' },
                        { size: '12', label: '12 inches', price: '₱1,400', serves: '20–25 guests' },
                      ].map((s) => (
                        <button
                          type="button"
                          key={s.size}
                          onClick={() => setCakeSize(s.size as any)}
                          className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                            cakeSize === s.size
                              ? 'border-[#25140C] bg-[#FAF3EB] text-[#25140C] shadow-2xs'
                              : 'border-[#E2D2BE] bg-[#FAF7F2] text-[#745C51] hover:border-[#25140C]'
                          }`}
                        >
                          <span className="block font-bold text-xs">{s.label}</span>
                          <span className="block text-xs font-bold text-[#25140C] mt-1">
                            {s.price}
                          </span>
                          <span className="block text-[10px] text-[#9C8578] mt-0.5">
                            {s.serves}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Frosting */}
                  <div>
                    <label className="block font-display text-base font-bold text-[#25140C] mb-2.5">
                      3. Choice of Frosting
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Vanilla', extra: 'Included' },
                        { name: 'Chocolate', extra: 'Included' },
                        { name: 'Strawberry', extra: '+₱50' },
                        { name: 'Cream Cheese', extra: '+₱80' },
                      ].map((fr) => (
                        <button
                          type="button"
                          key={fr.name}
                          onClick={() => setCakeFrosting(fr.name)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            cakeFrosting === fr.name
                              ? 'bg-[#25140C] text-white shadow-xs'
                              : 'bg-[#FAF7F2] border border-[#E2D2BE] text-[#4A2718] hover:border-[#25140C]'
                          }`}
                        >
                          {fr.name} <span className="opacity-75 font-normal">({fr.extra})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 4: Celebration Design Theme */}
                  <div>
                    <label className="block font-display text-base font-bold text-[#25140C] mb-2.5">
                      4. Celebration Design Theme
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { name: 'Simple', price: '+₱0' },
                        { name: 'Birthday', price: '+₱100' },
                        { name: 'Wedding', price: '+₱300' },
                        { name: 'Anniversary', price: '+₱200' },
                        { name: 'Graduation', price: '+₱150' },
                      ].map((ds) => (
                        <button
                          type="button"
                          key={ds.name}
                          onClick={() => setCakeDesign(ds.name)}
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            cakeDesign === ds.name
                              ? 'border-[#25140C] bg-[#FAF3EB] text-[#25140C]'
                              : 'border-[#E2D2BE] bg-[#FAF7F2] text-[#745C51] hover:border-[#25140C]'
                          }`}
                        >
                          {ds.name} <span className="opacity-75 font-normal">({ds.price})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 5: Piped Inscription */}
                  <div>
                    <label className="block font-display text-sm font-bold text-[#25140C] mb-1">
                      Cake Inscription (Piped with Fresh Icing)
                    </label>
                    <input
                      type="text"
                      maxLength={40}
                      value={cakeMessage}
                      onChange={(e) => setCakeMessage(e.target.value)}
                      placeholder="e.g. Happy 25th Birthday, Andrea!"
                      className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#E2D2BE] bg-[#FAF7F2] focus:border-[#B81D24] focus:outline-hidden"
                    />
                    <span className="text-[10px] text-[#9C8578] mt-1 block">Max 40 characters</span>
                  </div>

                  {/* Step 6: Inspiration Photo Upload */}
                  <div>
                    <label className="block font-display text-sm font-bold text-[#25140C] mb-1">
                      Inspiration Reference Photo (Optional)
                    </label>
                    <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed border-[#DE9344] bg-[#FAF3EB] cursor-pointer hover:bg-[#F5E8D8] transition-colors text-xs text-[#4A2718] font-semibold">
                      <Upload size={16} className="text-[#C0772C]" />
                      <span>{cakePhoto ? 'Change reference image' : 'Upload photo of desired design (up to 5 MB)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomCakePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Step 7: Quantity & Submit */}
                  <div className="flex items-center gap-4 pt-2">
                    <span className="font-display text-sm font-bold text-[#25140C]">Quantity:</span>
                    <div className="flex items-center border border-[#E2D2BE] rounded-full overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setCakeQty((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center font-bold text-[#25140C] hover:bg-[#FAF7F2] cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-[#25140C]">
                        {cakeQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCakeQty((q) => Math.min(20, q + 1))}
                        className="w-9 h-9 flex items-center justify-center font-bold text-[#25140C] hover:bg-[#FAF7F2] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#25140C] hover:bg-[#B81D24] text-white font-semibold py-4 rounded-full shadow-lg transition-transform hover:-translate-y-0.5 text-sm cursor-pointer"
                  >
                    Add Custom Cake to Cart — ₱{customCakeTotal.toLocaleString()}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= PROMOTIONS PAGE ================= */}
        {currentPage === 'promotions' && (
          <div className="page-animate max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C0772C] block mb-1">
                Sweet Savings
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#25140C]">
                Promotions & Bundles
              </h1>
              <p className="text-xs sm:text-sm text-[#745C51] mt-2">
                Special offers and coupon vouchers available for your orders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6D8] shadow-xs text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF3EB] text-[#B81D24] flex items-center justify-center mx-auto text-2xl">
                  <Gift size={26} />
                </div>
                <h3 className="font-display text-lg font-bold text-[#25140C]">Buy 2 Get 1 Free</h3>
                <p className="text-xs text-[#745C51] leading-relaxed">
                  On all gourmet cupcakes every weekday afternoon from 2:00 PM to 5:00 PM.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6D8] shadow-xs text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF3EB] text-[#DE9344] flex items-center justify-center mx-auto text-2xl">
                  <Cake size={26} />
                </div>
                <h3 className="font-display text-lg font-bold text-[#25140C]">10% Off Birthday Bakes</h3>
                <p className="text-xs text-[#745C51] leading-relaxed">
                  Celebrating a special milestone? Apply code <strong className="text-[#25140C]">SWEET10</strong> at checkout for 10% off.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6D8] shadow-xs text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF3EB] text-[#25140C] flex items-center justify-center mx-auto text-2xl">
                  <Truck size={26} />
                </div>
                <h3 className="font-display text-lg font-bold text-[#25140C]">Complimentary Delivery</h3>
                <p className="text-xs text-[#745C51] leading-relaxed">
                  Enjoy free doorstep delivery on all orders over ₱1,000 across Davao City.
                </p>
              </div>
            </div>

            {/* Voucher Application Box */}
            <div className="max-w-lg mx-auto bg-gradient-to-br from-[#25140C] to-[#3D2316] text-white p-8 sm:p-10 rounded-3xl shadow-xl text-center space-y-5 border border-[#4D2E21]">
              <h3 style={{ color: '#FFFFFF' }} className="font-display text-2xl sm:text-3xl font-bold !text-white text-white">Have a Promo Voucher?</h3>
              <p className="text-xs text-[#E4D5C8] leading-relaxed">
                Enter your code below to automatically apply the savings to your active shopping cart.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="e.g. SWEET10 or WELCOME15"
                  className="flex-1 bg-white/95 text-[#25140C] px-4 py-3 rounded-full text-xs font-semibold focus:outline-hidden"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-[#DE9344] hover:bg-[#EEA858] text-[#25140C] text-xs font-bold px-6 py-3 rounded-full transition-colors cursor-pointer"
                >
                  Apply Code
                </button>
              </div>

              {promoMessage && (
                <p
                  className={`text-xs font-bold ${
                    promoMessage.isError ? 'text-[#FF8A8A]' : 'text-[#DE9344]'
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= ABOUT PAGE ================= */}
        {currentPage === 'about' && (
          <div className="page-animate max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#F0E6D8] shadow-sm flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 w-full">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"
                  alt="Artisan baker kneading dough"
                  className="w-full h-80 sm:h-96 lg:h-[450px] object-cover rounded-2xl shadow-md border-4 border-[#FAF3EB]"
                />
              </div>

              <div className="flex-1 space-y-5">
                <span className="text-xs uppercase tracking-widest font-bold text-[#C0772C]">
                  Our Story & Heritage
                </span>
                <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#25140C] leading-tight">
                  Baked with passion since our first batch in Davao City
                </h1>
                <p className="text-xs sm:text-sm text-[#745C51] leading-relaxed">
                  Sweet Crumbs Bakery started as an intimate passion project in our home kitchen. Driven by a love for timeless pastry techniques, slow-fermented doughs, and real dairy butter, we set out to create a bakehouse where every dessert is crafted from scratch with unwavering care.
                </p>

                <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#25140C]">
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">🍰</span>
                    <div>
                      <strong className="block text-[#25140C]">Pure Quality Ingredients</strong>
                      <span className="text-xs text-[#745C51]">Imported creamery butter, unbleached flours, and ripe Mindanao fruits.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">🔥</span>
                    <div>
                      <strong className="block text-[#25140C]">Small Batch Excellence</strong>
                      <span className="text-xs text-[#745C51]">We fire our ovens at 5:00 AM every single morning to guarantee peak crumb texture and fragrance.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">❤️</span>
                    <div>
                      <strong className="block text-[#25140C]">Milestones Made Memorable</strong>
                      <span className="text-xs text-[#745C51]">From first birthdays to golden anniversaries, our custom cake team brings your vision to life.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= CONTACT PAGE ================= */}
        {currentPage === 'contact' && (
          <div className="page-animate max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C0772C] block mb-1">
                Reach Out
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#25140C]">
                Contact Sweet Crumbs
              </h1>
              <p className="text-xs sm:text-sm text-[#745C51] mt-2">
                Have inquiries regarding custom celebration cakes, corporate dessert catering, or store pickup?
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6D8] shadow-sm space-y-5">
                <h3 className="font-display text-xl font-bold text-[#25140C]">
                  Bakehouse Information
                </h3>
                <div className="space-y-3.5 text-xs text-[#745C51]">
                  <p>
                    <strong className="text-[#25140C] block mb-0.5">Store Location:</strong>
                    Davao City, Davao del Sur, Philippines
                  </p>
                  <p>
                    <strong className="text-[#25140C] block mb-0.5">Phone Inquiries:</strong>
                    +63 917 829 3388
                  </p>
                  <p>
                    <strong className="text-[#25140C] block mb-0.5">Email Support:</strong>
                    sweetcrumbsbakery@gmail.com
                  </p>
                  <p>
                    <strong className="text-[#25140C] block mb-0.5">Store Hours:</strong>
                    Monday – Saturday: 8:00 AM – 8:00 PM<br />
                    Sunday: 9:00 AM – 6:00 PM
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0E6D8]">
                  <p className="text-xs text-[#C0772C] font-semibold leading-relaxed">
                    Doorstep deliveries are scheduled throughout the day across Davao City. Advance reservations are recommended for celebration cakes.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6D8] shadow-sm">
                <h3 className="font-display text-xl font-bold text-[#25140C] mb-4">
                  Send Us a Message
                </h3>
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#25140C] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Juan dela Cruz"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2D2BE] focus:border-[#B81D24] focus:outline-hidden bg-[#FAF7F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#25140C] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="juan@example.com"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2D2BE] focus:border-[#B81D24] focus:outline-hidden bg-[#FAF7F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#25140C] mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us what kind of custom order or questions you have..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2D2BE] focus:border-[#B81D24] focus:outline-hidden bg-[#FAF7F2]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingContact}
                    className="w-full bg-[#25140C] hover:bg-[#B81D24] disabled:opacity-50 text-white font-semibold text-xs py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send size={14} />
                    <span>{submittingContact ? 'Sending message...' : 'Send Message'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Quick Bag Indicator (Requirement 21) */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="group flex items-center gap-3.5 bg-[#20120D] hover:bg-[#A8181E] text-white pl-4 pr-5 py-3 rounded-full shadow-[0_12px_36px_rgba(32,18,13,0.35)] border border-[#DE9344]/35 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag size={18} className="text-[#DE9344] group-hover:text-white transition-colors" />
              <span className="absolute -top-1.5 -right-2 bg-[#A8181E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            </div>
            <div className="text-left font-display">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#DECDBA] block -mb-0.5">
                BAG · {cart.reduce((s, i) => s + i.qty, 0)} {cart.reduce((s, i) => s + i.qty, 0) === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              <span className="text-sm font-bold text-white">
                ₱{(cart.reduce((s, i) => s + i.price * i.qty, 0) * (1 - appliedDiscount / 100)).toLocaleString()}
              </span>
            </div>
            <span className="text-[#DE9344] group-hover:translate-x-1 transition-transform text-sm font-bold">
              →
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onOpenCheckout={() => {
          if (!user && !profile) {
            setIsCartOpen(false);
            setAuthPromptMessage('Account Required: Please log in or register an account first before placing your order.');
            setIsAuthOpen(true);
            showToast('Please log in or create an account first before checking out.');
          } else {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }
        }}
        appliedDiscount={appliedDiscount}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={(product) => setSelectedProductModal(product)}
      />

      {/* Accessible Product Detail & Reviews Modal */}
      <ProductDetailModal
        product={selectedProductModal}
        isOpen={!!selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
        isInWishlist={selectedProductModal ? wishlistIds.includes(selectedProductModal.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onShowToast={showToast}
      />

      {/* Checkout Modal (Strictly for authenticated accounts) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        appliedDiscount={appliedDiscount}
        onOrderPlaced={(order) => {
          setConfirmedOrder(order);
          setCart([]);
          setIsTrackingOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* Tracking Modal */}
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={confirmedOrder}
      />

      {/* Auth / Account Modal (Persistent Accounts & Strictly Log In terminology) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthPromptMessage(undefined);
        }}
        onShowToast={showToast}
        promptMessage={authPromptMessage}
      />

      {/* Customer Footer with discreet 3-click secret administrator trigger */}
      <Footer
        onNavigate={navigateTo}
        onSecretPortalTrigger={() => {
          setIsAdminView(true);
          window.location.hash = '#admin';
        }}
      />
    </div>
  );
}
