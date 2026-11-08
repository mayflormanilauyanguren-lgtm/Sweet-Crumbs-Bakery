import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Server,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  testSupabaseConnection,
  seedDefaultProductsToSupabase,
  resetSupabaseConfig,
  SUPABASE_SCHEMA_SQL,
  SupabaseTestResult,
} from '../lib/supabase.ts';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onConnected?: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onConnected,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'sql'>('connect');

  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setUrl(cfg.url || '');
      setAnonKey(cfg.anonKey || '');
      setTestResult(null);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, anonKey);
      setTestResult(res);
      if (res.success) {
        onShowToast(res.message);
      } else {
        onShowToast(res.message);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error executing test query.',
        tables: { products: false, orders: false, reviews: false, contact_messages: false },
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      onShowToast('Please provide both Supabase Project URL and Anon Key.');
      return;
    }

    saveSupabaseConfig(url, anonKey);
    onShowToast('Supabase credentials successfully saved and activated!');
    if (onConnected) onConnected();
  };

  const handleSeedProducts = async () => {
    setSeeding(true);
    try {
      const res = await seedDefaultProductsToSupabase();
      if (res.success) {
        onShowToast(res.message);
        if (onConnected) onConnected();
      } else {
        onShowToast(res.message);
      }
    } catch (err: any) {
      onShowToast(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      onShowToast('SQL Schema copied to clipboard!');
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect from this Supabase database? Local storage cache will be used.')) {
      resetSupabaseConfig();
      setUrl('');
      setAnonKey('');
      setTestResult(null);
      onShowToast('Disconnected from Supabase.');
      if (onConnected) onConnected();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="supabase-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A0E08]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-[#20120D] text-[#FAF6F0] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.5)] border border-[#4A261A] overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#180C07] px-6 py-4.5 border-b border-[#341F16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database size={18} />
            </div>
            <div>
              <h2 id="supabase-modal-title" className="font-display font-bold text-lg text-white">
                Connect Supabase Database
              </h2>
              <span className="text-[11px] text-[#A88A6D]">
                Sweet Crumbs Bakery Cloud Persistence & Admin Sync
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Pill */}
            <div className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border ${
              isConfigured
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <span>{isConfigured ? 'Connected' : 'Offline Cache'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#A88A6D] hover:text-white hover:bg-[#341F16] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#341F16] bg-[#1E0E0A]">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-[#A88A6D] hover:text-white'
            }`}
          >
            <Zap size={13} />
            <span>Connection & Credentials</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-[#A88A6D] hover:text-white'
            }`}
          >
            <Server size={13} />
            <span>SQL Schema Migration (Run First)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 bg-[#20120D]">
          
          {/* TAB 1: CONNECT & TEST */}
          {activeTab === 'connect' && (
            <div className="space-y-6">
              
              {/* Quick instructions strip */}
              <div className="bg-[#180C07] p-4 rounded-2xl border border-[#3A1F17] flex items-start gap-3">
                <ShieldCheck size={20} className="text-[#DE9344] shrink-0 mt-0.5" />
                <div className="text-xs text-[#D6C4AC] space-y-1">
                  <p>
                    Connecting your Supabase project enables real-time persistent data storage for all <strong>products</strong>, customer <strong>orders</strong>, verified <strong>reviews</strong>, and <strong>inquiries</strong>.
                  </p>
                  <p className="text-[#A88A6D] text-[11px]">
                    No database yet? Get one in 2 minutes at{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 font-semibold"
                    >
                      <span>supabase.com/dashboard</span>
                      <ExternalLink size={10} />
                    </a>
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#FAF6F0] mb-1.5 flex items-center justify-between">
                    <span>1. Supabase Project URL *</span>
                    <span className="text-[10px] text-[#A88A6D] font-normal">
                      Settings → API → Project URL
                    </span>
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-[#180C07] border border-[#3A1F17] text-white focus:outline-hidden focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#FAF6F0] mb-1.5 flex items-center justify-between">
                    <span>2. Supabase Anon Public API Key *</span>
                    <span className="text-[10px] text-[#A88A6D] font-normal">
                      Settings → API → Project API Keys (anon public)
                    </span>
                  </label>
                  <input
                    type="password"
                    required
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-[#180C07] border border-[#3A1F17] text-white focus:outline-hidden focus:border-emerald-400"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing || !url.trim() || !anonKey.trim()}
                    className="bg-[#2D160E] hover:bg-[#3D1E14] disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-full border border-[#522B1E] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
                    <span>{testing ? 'Testing Live Ping...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Save & Connect</span>
                  </button>

                  {isConfigured && (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="text-xs text-red-400 hover:text-red-300 px-3 py-2 transition-colors cursor-pointer ml-auto"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </form>

              {/* Test Results Display */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/30 border-red-500/40 text-red-200'
                }`}>
                  <div className="flex items-center gap-2 font-semibold">
                    {testResult.success ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>

                  {/* Table Checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={testResult.tables.products ? 'text-emerald-400' : 'text-red-400'}>
                        {testResult.tables.products ? '✓' : '✗'}
                      </span>
                      <span>products table</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={testResult.tables.orders ? 'text-emerald-400' : 'text-red-400'}>
                        {testResult.tables.orders ? '✓' : '✗'}
                      </span>
                      <span>orders table</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={testResult.tables.reviews ? 'text-emerald-400' : 'text-red-400'}>
                        {testResult.tables.reviews ? '✓' : '✗'}
                      </span>
                      <span>reviews table</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={testResult.tables.contact_messages ? 'text-emerald-400' : 'text-red-400'}>
                        {testResult.tables.contact_messages ? '✓' : '✗'}
                      </span>
                      <span>contact table</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instant 1-Click Database Seeder */}
              <div className="bg-[#180C07] p-5 rounded-2xl border border-[#3A1F17] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">
                      Seed Supabase With Bakery Products
                    </h4>
                    <p className="text-xs text-[#A88A6D]">
                      Upload all 35 artisan cakes, pastries, doughnuts, and coffee items to your Supabase table in 1 click.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSeedProducts}
                  disabled={seeding || !isConfigured}
                  className="bg-[#DE9344] hover:bg-[#EEA858] disabled:opacity-40 text-[#20120D] text-xs font-bold px-5 py-2.5 rounded-full transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw size={13} className={seeding ? 'animate-spin' : ''} />
                  <span>{seeding ? 'Seeding 35 Products to Supabase...' : 'Seed 35 Products to Supabase'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: SQL SCHEMA MIGRATION */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display font-bold text-base text-white">
                    Database Tables & Row-Level Security Script
                  </h4>
                  <p className="text-xs text-[#A88A6D]">
                    Copy and run this in your{' '}
                    <a
                      href="https://supabase.com/dashboard/project/_/sql"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      Supabase SQL Editor
                      <ExternalLink size={11} />
                    </a>
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <pre className="bg-[#120704] p-4 rounded-2xl text-[11px] font-mono text-[#D6C4AC] overflow-x-auto max-h-80 border border-[#2E1710]">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
