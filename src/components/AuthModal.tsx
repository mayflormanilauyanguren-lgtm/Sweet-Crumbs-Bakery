import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Order } from '../types.ts';
import { fetchUserOrders } from '../lib/dataService.ts';
import { X, LogOut, Package, User as UserIcon, Save, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  initialMode?: 'login' | 'register';
  promptMessage?: string;
  onOpenOrders?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  initialMode = 'login',
  promptMessage,
  onOpenOrders,
}) => {
  const {
    user,
    profile,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    updateProfile,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditPhone(profile.phone || '');
      setEditAddress(profile.address || '');
    }
  }, [profile, isOpen]);

  useEffect(() => {
    if (profile?.email && isOpen) {
      setLoadingOrders(true);
      fetchUserOrders(profile.email)
        .then((data) => setOrders(data))
        .catch((err) => console.error('Failed to load orders:', err))
        .finally(() => setLoadingOrders(false));
    }
  }, [profile, isOpen]);

  // Validation functions
  const validatePhone = (num: string): boolean => {
    const digits = num.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('09');
  };

  const validateGmail = (mail: string): boolean => {
    const clean = mail.trim().toLowerCase();
    return clean.endsWith('@gmail.com') && clean.length > 10;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = email.trim().toLowerCase();

    // Error handling checks
    if (!validateGmail(cleanEmail)) {
      setAuthError('Email must be a valid Gmail address ending with @gmail.com (e.g. yourname@gmail.com).');
      return;
    }

    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    if (authMode === 'register') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setAuthError('Please enter your full name (at least 2 characters).');
        return;
      }

      if (!validatePhone(phone)) {
        setAuthError('Phone number must be an 11-digit Philippine number starting with 09 (e.g. 09171234567).');
        return;
      }

      if (!address.trim() || address.trim().length < 8) {
        setAuthError('Please enter your complete delivery address (street, barangay/district, city).');
        return;
      }
    }

    setSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        const res = await signInWithEmail(cleanEmail, password);
        if (res.error) {
          setAuthError(res.error);
        } else {
          onShowToast('Logged in successfully! Welcome to Sweet Crumbs.');
          onClose();
        }
      } else {
        const res = await signUpWithEmail(
          cleanEmail,
          password,
          fullName.trim(),
          phone.trim(),
          address.trim()
        );
        if (res.error) {
          setAuthError(res.error);
        } else {
          onShowToast('Account registered and stored in database successfully! You are now logged in.');
          onClose();
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error. Please try again.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    onShowToast('You have been logged out.');
    onClose();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (editPhone.trim() && !validatePhone(editPhone)) {
      setAuthError('Phone number must be 11 digits starting with 09 (e.g. 09171234567).');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
      onShowToast('Profile updated permanently in database!');
    } catch {
      onShowToast('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#20120D]/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-[#fffaf0] rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-[#f0e3d0] max-h-[90vh] overflow-y-auto animate-modal-scale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7a5a4e] hover:text-[#34170e] hover:bg-[#fff2dc] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {!profile ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#fff2dc] flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                🍰
              </div>
              <h2 className="font-display text-2xl font-bold text-[#34170e]">
                {authMode === 'login' ? 'Log In to Sweet Crumbs' : 'Create Customer Account'}
              </h2>
              <p className="text-xs text-[#7a5a4e] mt-1">
                Connected with Supabase Database & Persistent Accounts
              </p>
              {promptMessage && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="text-amber-700 shrink-0" />
                  <span>{promptMessage}</span>
                </div>
              )}
            </div>

            {/* Auth Mode Tabs (Log In vs Register) */}
            <div className="flex border-b border-[#E2D2BE] mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                  authMode === 'login'
                    ? 'border-[#25140C] text-[#25140C]'
                    : 'border-transparent text-[#745C51] hover:text-[#25140C]'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                  authMode === 'register'
                    ? 'border-[#25140C] text-[#25140C]'
                    : 'border-transparent text-[#745C51] hover:text-[#25140C]'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs mb-4 border border-rose-200 flex items-start gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#34170e] mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon size={15} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maria Santos"
                        className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-[#eaddc8] bg-white focus:outline-hidden focus:border-[#d3213a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#34170e] mb-1">
                      Phone Number (11 Digits) *
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        placeholder="09171234567"
                        className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-[#eaddc8] bg-white focus:outline-hidden focus:border-[#d3213a]"
                      />
                    </div>
                    <span className="text-[10px] text-[#8a6e54] mt-0.5 block">
                      Must be 11 digits starting with 09 (e.g. 09171234567)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#34170e] mb-1">
                      Complete Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, Barangay, Davao City"
                        className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-[#eaddc8] bg-white focus:outline-hidden focus:border-[#d3213a]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#34170e] mb-1">
                  Gmail Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-[#eaddc8] bg-white focus:outline-hidden focus:border-[#d3213a]"
                  />
                </div>
                <span className="text-[10px] text-[#8a6e54] mt-0.5 block">
                  Must end with @gmail.com
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#34170e] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-2.5 text-[#a88a6d]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-[#eaddc8] bg-white focus:outline-hidden focus:border-[#d3213a]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full bg-[#25140C] hover:bg-[#DE9344] hover:text-[#25140C] disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-full transition-all cursor-pointer shadow-md mt-3"
              >
                {submittingAuth
                  ? 'Saving to Database...'
                  : authMode === 'login'
                  ? 'Log In'
                  : 'Register & Store Account'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0e5d5]">
              <div className="w-12 h-12 rounded-full bg-[#6a3220] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {(profile.name || profile.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-[#34170e] truncate">
                  {profile.name || 'Valued Customer'}
                </h3>
                <p className="text-xs text-[#7a5a4e] truncate">{profile.email}</p>
                {profile.phone && (
                  <p className="text-[11px] text-[#DE9344] font-semibold">{profile.phone}</p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-[#c0392b] hover:text-[#961b12] flex items-center gap-1 font-semibold p-1 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-rose-200"
                title="Log out"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>

            {authError && (
              <div className="bg-rose-50 text-rose-800 p-2.5 rounded-lg text-xs border border-rose-200 flex items-center gap-2">
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Profile info & address */}
            <form onSubmit={handleSaveProfile} className="bg-white/80 p-4 rounded-xl border border-[#f0e5d5] space-y-3">
              <h4 className="font-display text-sm font-bold text-[#34170e] flex items-center gap-1.5">
                <UserIcon size={14} className="text-[#DE9344]" />
                <span>Saved Delivery Profile</span>
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-[#34170e] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#eaddc8] focus:border-[#d3213a] bg-white"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#34170e] mb-1">
                  Phone Number (11 Digits)
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#eaddc8] focus:border-[#d3213a] bg-white"
                  placeholder="09171234567"
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
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#eaddc8] focus:border-[#d3213a] bg-white"
                  placeholder="Street, Barangay, Davao City"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-[#25140C] hover:bg-[#DE9344] hover:text-[#25140C] text-white text-xs font-bold py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save size={13} />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>

            {/* Order History */}
            <div className="bg-white/80 p-4 rounded-xl border border-[#f0e5d5]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display text-sm font-bold text-[#34170e] flex items-center gap-1.5">
                  <Package size={14} className="text-[#DE9344]" />
                  <span>Order History ({orders.length})</span>
                </h4>
                {onOpenOrders && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOrders();
                    }}
                    className="text-[11px] font-bold text-[#6a3220] hover:text-[#DE9344] underline cursor-pointer"
                  >
                    View All Details →
                  </button>
                )}
              </div>

              {loadingOrders ? (
                <p className="text-xs text-[#7a5a4e] text-center py-4">Loading your orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-xs text-[#7a5a4e] text-center py-4">
                  No orders placed yet. Your past bakery orders will appear here.
                </p>
              ) : (
                <>
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
                  {onOpenOrders && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOrders();
                      }}
                      className="w-full mt-3 bg-[#FAF3EB] hover:bg-[#DE9344] hover:text-[#25140C] text-[#6a3220] font-bold text-xs py-2 rounded-lg border border-[#eaddc8] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Package size={13} />
                      <span>Open Detailed Order History & Tracking</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
