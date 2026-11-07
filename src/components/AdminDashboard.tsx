import React, { useState, useEffect } from 'react';
import {
  Product,
  Order,
  Review,
  ContactMessage,
} from '../types.ts';
import {
  fetchProducts,
  saveProduct,
  deleteProduct,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  fetchReviews,
  deleteReview,
  fetchContactMessages,
  updateMessageStatus,
} from '../lib/dataService.ts';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  SUPABASE_SCHEMA_SQL,
} from '../lib/supabase.ts';
import {
  Package,
  ShoppingBag,
  Star,
  Mail,
  Database,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  RefreshCw,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  onSignOut: () => void;
  onShowToast: (msg: string) => void;
  onProductsUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onSignOut,
  onShowToast,
  onProductsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'reviews' | 'inquiries' | 'database'>('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Supabase Config states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const isConnected = isSupabaseConfigured();

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Classic Cakes');
  const [newProdPrice, setNewProdPrice] = useState('850');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');

  // Load all admin data
  const loadData = async () => {
    setLoading(true);
    try {
      const [ordList, prodList, revList, msgList] = await Promise.all([
        fetchAllOrders(),
        fetchProducts(),
        fetchReviews(),
        fetchContactMessages(),
      ]);
      setOrders(ordList);
      setProducts(prodList);
      setReviews(revList);
      setMessages(msgList);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const cfg = getStoredSupabaseConfig();
    setSupabaseUrl(cfg.url);
    setSupabaseKey(cfg.anonKey);
  }, []);

  // Order status actions
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    onShowToast(`Order #${orderId} marked as "${newStatus}"`);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Delete order #${orderId}?`)) return;
    await deleteOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    onShowToast(`Order #${orderId} deleted.`);
  };

  // Product actions
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: newProdName.trim(),
      category: newProdCategory,
      price: Number(newProdPrice),
      description: newProdDesc.trim() || 'Delicious freshly baked treat made at Sweet Crumbs.',
      image: newProdImg.trim() || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
      badge: newProdBadge ? newProdBadge : null,
      rating: 5,
      reviewsCount: 1,
    };

    await saveProduct(newProd);
    setProducts((prev) => [newProd, ...prev]);
    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdImg('');
    setNewProdBadge('');
    onShowToast(`Product "${newProd.name}" added to database!`);
    if (onProductsUpdated) onProductsUpdated();
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    await deleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    onShowToast(`Product "${name}" deleted from database.`);
    if (onProductsUpdated) onProductsUpdated();
  };

  // Review moderation
  const handleDeleteReview = async (id: number) => {
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    onShowToast('Review removed.');
  };

  // Inquiries
  const handleMessageStatus = async (id: number, status: string) => {
    await updateMessageStatus(id, status);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    onShowToast(`Message marked as ${status}`);
  };

  // Save Supabase Config
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    onShowToast('Supabase settings updated! Reloading data...');
    loadData();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    onShowToast('Supabase SQL Schema script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Order Confirmed' || o.status === 'Being Prepared').length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      orderFilter === 'all' ||
      (orderFilter === 'confirmed' && o.status === 'Order Confirmed') ||
      (orderFilter === 'preparing' && o.status === 'Being Prepared') ||
      (orderFilter === 'delivery' && (o.status === 'Out for Delivery' || o.status === 'Ready for Pickup')) ||
      (orderFilter === 'completed' && o.status === 'Completed') ||
      (orderFilter === 'cancelled' && o.status === 'Cancelled');

    const q = orderSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      (o.paymentReference && o.paymentReference.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      productCategoryFilter === 'all' ||
      p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    const q = productSearch.trim().toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2b1610] text-[#ffe9c7] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#1e0e0a] border-b border-[#422218] px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#3a1d14] hover:bg-[#4d281c] text-[#ffe9c7] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Customer Store</span>
          </button>
          <div className="h-6 w-px bg-[#422218] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight leading-none">
                Sweet Crumbs Bakery — Admin Dashboard
              </h1>
              <p className="text-[11px] text-[#c4ac8f]">
                Order fulfillment, menu catalog, customer inquiries & Supabase database
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              isConnected
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
            }`}
          >
            <Database size={13} />
            <span>{isConnected ? 'Supabase Active' : 'Supabase (Local / Sandbox)'}</span>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-[#3a1d14] hover:bg-[#4d281c] text-[#ffe9c7] transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={onSignOut}
            className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Lock Dashboard & Log Out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Lock & Sign Out</span>
          </button>
        </div>
      </header>

      {/* Analytics KPI Ribbon */}
      <section className="bg-[#24120d] border-b border-[#3d1e15] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#331a12] p-3.5 rounded-xl border border-[#4a261a]">
            <span className="text-[11px] text-[#c4ac8f] uppercase tracking-wider block font-medium">
              Total Revenue
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-[#e5972a]">
              ₱{totalRevenue.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#331a12] p-3.5 rounded-xl border border-[#4a261a]">
            <span className="text-[11px] text-[#c4ac8f] uppercase tracking-wider block font-medium">
              Total Orders
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-white">
              {totalOrdersCount}
            </span>
          </div>

          <div className="bg-[#331a12] p-3.5 rounded-xl border border-[#4a261a]">
            <span className="text-[11px] text-[#c4ac8f] uppercase tracking-wider block font-medium">
              Orders to Prepare
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-[#d3213a]">
              {pendingOrders}
            </span>
          </div>

          <div className="bg-[#331a12] p-3.5 rounded-xl border border-[#4a261a]">
            <span className="text-[11px] text-[#c4ac8f] uppercase tracking-wider block font-medium">
              Avg Order Value
            </span>
            <span className="font-display text-xl sm:text-2xl font-bold text-[#ffe9c7]">
              ₱{avgOrderValue.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* Tabs navigation */}
      <div className="bg-[#1e0e0a] border-b border-[#422218] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
            { id: 'products', label: 'Products', icon: Package, count: products.length },
            { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
            { id: 'inquiries', label: 'Inquiries', icon: Mail, count: messages.length },
            { id: 'database', label: 'Supabase Config & SQL', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#d3213a] text-white shadow-sm'
                    : 'text-[#c4ac8f] hover:text-white hover:bg-[#2e1710]'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#3a1d14] text-[#c4ac8f]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* ================= TAB: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'preparing', label: 'Preparing' },
                  { id: 'delivery', label: 'Out for Delivery / Pickup' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'cancelled', label: 'Cancelled' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      orderFilter === f.id
                        ? 'bg-[#e5972a] text-[#34170e]'
                        : 'bg-[#331a12] text-[#c4ac8f] hover:bg-[#452319]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order #, customer, GCash ref..."
                  className="w-full text-xs bg-[#1e0e0a] border border-[#4a261a] rounded-lg pl-9 pr-3 py-2 text-white placeholder-[#8a6e54] focus:outline-hidden focus:border-[#d3213a]"
                />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-[#24120d] rounded-2xl border border-[#3d1e15]">
                <ShoppingBag size={40} className="mx-auto text-[#6b3b2b] mb-3" />
                <h3 className="font-display text-lg font-bold text-white">No orders found</h3>
                <p className="text-xs text-[#a88a6d] mt-1">
                  Orders placed by customers will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#24120d] rounded-xl p-5 border border-[#3d1e15] shadow-sm space-y-4 hover:border-[#572b1e] transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#381c13]">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-lg text-white">
                          #{order.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            order.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : order.status === 'Being Prepared'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : order.status === 'Cancelled'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-[#a88a6d]">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-[#e5972a]">
                          ₱{order.total.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#c4ac8f]">
                      <div className="space-y-1">
                        <p className="font-bold text-white uppercase text-[10px] tracking-wider text-[#a88a6d]">
                          Customer
                        </p>
                        <p className="font-semibold text-white">{order.customerName}</p>
                        <p>{order.customerPhone}</p>
                        <p className="text-[11px] text-[#a88a6d]">{order.customerEmail}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-white uppercase text-[10px] tracking-wider text-[#a88a6d]">
                          Fulfillment ({order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Store Pickup'})
                        </p>
                        <p className="text-white">{order.address}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-white uppercase text-[10px] tracking-wider text-[#a88a6d]">
                          Payment ({order.paymentMethod.toUpperCase()})
                        </p>
                        {order.paymentReference ? (
                          <div className="bg-[#1e0e0a] p-2 rounded border border-[#3d1e15] font-mono text-[11px] text-[#e5972a]">
                            Ref: <strong>{order.paymentReference}</strong>
                          </div>
                        ) : (
                          <p className="text-[#a88a6d]">No reference required (COD)</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#1e0e0a] p-3 rounded-lg border border-[#331a12]">
                      <p className="font-bold text-[11px] text-[#a88a6d] uppercase tracking-wider mb-2">
                        Ordered Items ({order.items?.length || 0})
                      </p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-white">
                              {item.name} × {item.qty} {item.meta ? `(${item.meta})` : ''}
                            </span>
                            <span className="text-[#e5972a] font-medium">
                              ₱{(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-xs text-[#a88a6d]">Update Kitchen/Delivery Status:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStatusChange(order.id, 'Being Prepared')}
                          className="px-3 py-1 rounded bg-[#3a1d14] hover:bg-[#4d281c] text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
                        >
                          Being Prepared
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              order.id,
                              order.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup'
                            )
                          }
                          className="px-3 py-1 rounded bg-[#3a1d14] hover:bg-[#4d281c] text-xs font-semibold text-blue-300 transition-colors cursor-pointer"
                        >
                          {order.deliveryMethod === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'Completed')}
                          className="px-3 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'Cancelled')}
                          className="px-3 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-[#d3213a] hover:bg-[#a8142b] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add New Product</span>
                </button>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-[#1e0e0a] border border-[#4a261a] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'all' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full text-xs bg-[#1e0e0a] border border-[#4a261a] rounded-lg pl-9 pr-3 py-2 text-white placeholder-[#8a6e54] focus:outline-hidden focus:border-[#d3213a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#24120d] rounded-xl p-4 border border-[#3d1e15] flex gap-3.5 items-start justify-between"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-20 h-20 rounded-lg object-cover border border-[#4a261a] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#e5972a] uppercase font-bold tracking-wider">
                      {p.category}
                    </span>
                    <h4 className="font-display font-bold text-sm text-white truncate">
                      {p.name}
                    </h4>
                    <p className="text-xs text-[#a88a6d] line-clamp-1 mt-0.5">{p.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm text-[#e5972a]">
                        ₱{p.price.toLocaleString()}
                      </span>
                      {p.badge && (
                        <span className="text-[10px] bg-[#d3213a]/30 text-rose-300 border border-[#d3213a]/50 px-2 py-0.2 rounded-full uppercase font-bold">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="text-rose-400 hover:text-rose-200 p-1.5 rounded hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: REVIEWS ================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Customer Feedback & Reviews ({reviews.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#24120d] p-4 rounded-xl border border-[#3d1e15] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[#e5972a] text-sm">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </span>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-rose-400 hover:text-rose-200 p-1 cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-white italic">"{rev.text}"</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#381c13] flex justify-between text-[11px] text-[#a88a6d]">
                    <span className="font-bold text-[#ffe9c7]">— {rev.name}</span>
                    {rev.createdAt && <span>{new Date(rev.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: INQUIRIES ================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-white mb-2">
              Customer Contact Inquiries ({messages.length})
            </h3>
            {messages.length === 0 ? (
              <p className="text-xs text-[#a88a6d] py-12 text-center bg-[#24120d] rounded-xl border border-[#3d1e15]">
                No customer inquiries received yet.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-[#24120d] p-4 rounded-xl border border-[#3d1e15] space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm text-white">{msg.name}</span>
                        <span className="text-xs text-[#a88a6d] ml-2">({msg.email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            msg.status === 'Replied'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {msg.status || 'Unread'}
                        </span>
                        <button
                          onClick={() =>
                            handleMessageStatus(
                              msg.id,
                              msg.status === 'Replied' ? 'Unread' : 'Replied'
                            )
                          }
                          className="text-xs underline text-[#e5972a] hover:text-[#f3b054] cursor-pointer"
                        >
                          {msg.status === 'Replied' ? 'Mark Unread' : 'Mark Replied'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#ffe9c7] bg-[#1e0e0a] p-3 rounded border border-[#331a12]">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: SUPABASE CONFIG & SQL ================= */}
        {activeTab === 'database' && (
          <div className="space-y-8">
            <div className="bg-[#24120d] p-6 rounded-2xl border border-[#3d1e15] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <Database size={20} className="text-[#e5972a]" />
                    Supabase Project Settings
                  </h3>
                  <p className="text-xs text-[#a88a6d] mt-1">
                    Connect your own Supabase project URL and anon public key for live cloud storage.
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isConnected
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {isConnected ? 'Active & Connected' : 'Waiting for Configuration'}
                </div>
              </div>

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-[#1e0e0a] border border-[#4a261a] text-white focus:outline-hidden focus:border-[#d3213a]"
                  />
                  <span className="text-[11px] text-[#8a6e54] mt-1 block">
                    Find this under Supabase Project Settings → API → Project URL
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-[#1e0e0a] border border-[#4a261a] text-white focus:outline-hidden focus:border-[#d3213a]"
                  />
                  <span className="text-[11px] text-[#8a6e54] mt-1 block">
                    Find this under Supabase Project Settings → API → Project API Keys (anon public)
                  </span>
                </div>

                <button
                  type="submit"
                  className="bg-[#d3213a] hover:bg-[#a8142b] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  Save Supabase Credentials
                </button>
              </form>
            </div>

            {/* SQL Schema Copy Block */}
            <div className="bg-[#24120d] p-6 rounded-2xl border border-[#3d1e15] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-bold text-white">
                    Supabase SQL Schema Script
                  </h4>
                  <p className="text-xs text-[#a88a6d]">
                    Copy and run this in your Supabase SQL Editor to initialize all 4 tables (<code className="text-[#e5972a]">products</code>, <code className="text-[#e5972a]">orders</code>, <code className="text-[#e5972a]">reviews</code>, <code className="text-[#e5972a]">contact_messages</code>).
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="bg-[#3a1d14] hover:bg-[#4d281c] text-[#ffe9c7] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-[#522b1e] cursor-pointer"
                >
                  {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <pre className="bg-[#120704] p-4 rounded-xl text-[11px] font-mono text-[#d6c4ac] overflow-x-auto max-h-72 border border-[#2e1710]">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#24120d] border border-[#4a261a] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-display text-xl font-bold text-white">Add New Bakery Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Ube Basque Cheesecake"
                  className="w-full text-xs px-3 py-2 rounded bg-[#1e0e0a] border border-[#4a261a] text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded bg-[#1e0e0a] border border-[#4a261a] text-white focus:outline-hidden"
                  >
                    <option value="Classic Cakes">Classic Cakes</option>
                    <option value="Specialty Cakes">Specialty Cakes</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Iced Coffee">Iced Coffee</option>
                    <option value="Classic Doughnuts">Classic Doughnuts</option>
                    <option value="Specialty Doughnuts">Specialty Doughnuts</option>
                    <option value="Cupcakes">Cupcakes</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Bread & Pastries">Bread & Pastries</option>
                    <option value="Hot Chocolate">Hot Chocolate</option>
                    <option value="Tea">Tea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded bg-[#1e0e0a] border border-[#4a261a] text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Freshly prepared with..."
                  className="w-full text-xs px-3 py-2 rounded bg-[#1e0e0a] border border-[#4a261a] text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3 py-2 rounded bg-[#1e0e0a] border border-[#4a261a] text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Badge (Optional)</label>
                <select
                  value={newProdBadge}
                  onChange={(e) => setNewProdBadge(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded bg-[#1e0e0a] border border-[#4a261a] text-white focus:outline-hidden"
                >
                  <option value="">None</option>
                  <option value="bestseller">Bestseller</option>
                  <option value="featured">Featured</option>
                  <option value="today's special">Today's Special</option>
                  <option value="new">New</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded text-xs text-[#a88a6d] hover:bg-[#331a12] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-bold bg-[#d3213a] hover:bg-[#a8142b] text-white cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
