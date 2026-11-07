import React, { useState } from 'react';
import { Shield, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onReturnToStore: () => void;
}

// Default passcode for bakery administrators
const ADMIN_PASSCODE = 'sweetcrumbs2026';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onReturnToStore }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (passcode.trim() === ADMIN_PASSCODE) {
        sessionStorage.setItem('sc_admin_authenticated', 'true');
        onSuccess();
      } else {
        setError('Invalid security passcode. Access denied.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#180b08] text-[#ffe9c7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#24120d] border border-[#422218] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onReturnToStore}
          className="inline-flex items-center gap-1.5 text-xs text-[#a88a6d] hover:text-[#ffe9c7] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to Customer Store</span>
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-[#3a1d14] border border-[#5a2e20] text-[#e5972a] flex items-center justify-center mx-auto shadow-inner">
            <Shield size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Bakery Admin Portal
          </h1>
          <p className="text-xs text-[#a88a6d]">
            Restricted area for Sweet Crumbs Bakery management and kitchen staff only.
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              Enter Admin Security Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a88a6d]">
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter admin passcode"
                className="w-full text-xs pl-9 pr-10 py-3 rounded-lg bg-[#140805] border border-[#4a261a] text-white placeholder-[#705642] focus:outline-hidden focus:border-[#d3213a]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a88a6d] hover:text-[#ffe9c7] cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-[#8a6e54] mt-1.5 flex justify-between">
              <span>Authorized personnel only</span>
              <span className="text-[#a88a6d]">Passcode: <code className="text-[#e5972a]">sweetcrumbs2026</code></span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d3213a] hover:bg-[#a8142b] disabled:opacity-50 text-white font-semibold text-xs py-3 rounded-full shadow-md transition-colors cursor-pointer"
          >
            {loading ? 'Verifying Credentials...' : 'Unlock Admin Dashboard'}
          </button>
        </form>

        <div className="pt-2 border-t border-[#381c13] text-center">
          <p className="text-[11px] text-[#705642]">
            Sweet Crumbs Bakery System • Protected by Supabase Database
          </p>
        </div>
      </div>
    </div>
  );
};
