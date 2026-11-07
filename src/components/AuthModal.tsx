import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Order } from '../types.ts';
import { fetchUserOrders } from '../lib/dataService.ts';
import { X, LogOut, Package, User as UserIcon, Save, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const {
    user,
    profile,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOutUser,
    updateProfile,
    isConfigured,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Profile edit
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (profile || user) {
      setEditName(profile?.name || '');
      setEditPhone(profile?.phone || '');
      setEditAddress(profile?.address || '');
    }
  }, [profile, user, isOpen]);

  useEffect(() => {
    if (user?.email && isOpen) {
      setLoadingOrders(true);
      fetchUserOrders(user.email)
        .then((data) => setOrders(data))
        .catch((err) => console.error('Failed to load orders:', err))
        .finally(() => setLoadingOrders(false));
    }
  }, [user, isOpen]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setAuthError(res.error);
        } else {
          onShowToast('Signed in successfully with Supabase!');
          onClose();
        }
      } else {
        const res = await signUpWithEmail(email, password, fullName);
        if (res.error) {
          setAuthError(res.error);
        } else {
          onShowToast('Account created with Supabase! Check your email to confirm or sign in.');
          setAuthMode('login');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res.error) {
      onShowToast(res.error);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    onShowToast('You have been logged out.');
    onClose();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
      onShowToast('Profile updated in Supabase database!');
    } catch {
      onShowToast('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#34170e]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#fffaf0] rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-[#f0e3d0] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7a5a4e] hover:text-[#34170e] hover:bg-[#fff2dc] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {!user ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#fff2dc] flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                🍰
              </div>
              <h2 className="font-display text-2xl font-bold text-[#34170e]">
                {authMode === 'login' ? 'Welcome Back!' : 'Create Customer Account'}
              </h2>
              <p className="text-xs text-[#7a5a4e] mt-1">
                Connected with Supabase Authentication & Database
              </p>
            </div>

            {/* Auth Mode Tabs */}
            <div className="flex border-b border-[#E2D2BE] mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                  authMode === 'login'
                    ? 'border-[#25140C] text-[#25140C]'
                    : 'border-transparent text-[#745C51] hover:text-[#25140C]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                  authMode === 'register'
                    ? 'border-[#25140C] text-[#25140C]'
                    : 'border-transparent text-[#745C51] hover:text-[#25140C]'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="bg-rose-50 text-rose-700 p-2.5 rounded-md text-xs mb-4 border border-rose-200">
                {authError}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#34170e] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#eaddc8] bg-white focus:border-[#d3213a]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#34170e] mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-[#eaddc8] bg-white focus:border-[#d3213a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#34170e] mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-[#eaddc8] bg-white focus:border-[#d3213a]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full bg-[#25140C] hover:bg-[#B81D24] disabled:opacity-50 text-white font-semibold text-xs py-3.5 rounded-full transition-colors cursor-pointer shadow-sm mt-2"
              >
                {submittingAuth
                  ? 'Connecting to Supabase...'
                  : authMode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#eaddc8]"></div>
              </div>
              <div className="relative flex justify-center text-[11px] text-[#7a5a4e]">
                <span className="bg-[#fffaf0] px-2">or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-[#34170e] font-semibold text-xs px-4 py-2.5 rounded-full border border-[#d6c4ac] shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0e5d5]">
              <div className="w-12 h-12 rounded-full bg-[#6a3220] text-white flex items-center justify-center font-bold text-lg">
                {(profile?.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-[#34170e] truncate">
                  {profile?.name || user.email?.split('@')[0] || 'Customer'}
                </h3>
                <p className="text-xs text-[#7a5a4e] truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-[#c0392b] hover:text-[#961b12] flex items-center gap-1 font-semibold p-1 cursor-pointer"
                title="Log out"
              >
                <LogOut size={14} />
                <span>Log out</span>
              </button>
            </div>

            {/* Profile info & address */}
            <form onSubmit={handleSaveProfile} className="bg-white/80 p-4 rounded-lg border border-[#f0e5d5] space-y-3">
              <h4 className="font-display text-sm font-bold text-[#34170e] flex items-center gap-1.5">
                <UserIcon size={14} /> Saved Delivery Profile
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-[#34170e] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-[#eaddc8] focus:border-[#d3213a] bg-white"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#34170e] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-[#eaddc8] focus:border-[#d3213a] bg-white"
                  placeholder="+63 900 000 0000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#34170e] mb-1">
                  Default Delivery Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-[#eaddc8] focus:border-[#d3213a] bg-white"
                  placeholder="Street, Barangay, Davao City"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-[#6a3220] hover:bg-[#34170e] text-white text-xs font-semibold py-2 rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </form>

            {/* Order History */}
            <div className="bg-white/80 p-4 rounded-lg border border-[#f0e5d5]">
              <h4 className="font-display text-sm font-bold text-[#34170e] flex items-center gap-1.5 mb-3">
                <Package size={14} /> Order History ({orders.length})
              </h4>

              {loadingOrders ? (
                <p className="text-xs text-[#7a5a4e] text-center py-4">Loading your orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-xs text-[#7a5a4e] text-center py-4">
                  No orders placed yet. Your past orders will appear here.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-[#f4ede1]">
                  {orders.map((ord) => (
                    <div key={ord.id} className="pt-2 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#34170e]">#{ord.id}</span>
                        <p className="text-[11px] text-[#7a5a4e]">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'} • {ord.deliveryMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#6a3220]">₱{ord.total.toLocaleString()}</span>
                        <span className="block text-[10px] text-emerald-700 font-semibold">
                          {ord.status || 'Confirmed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
