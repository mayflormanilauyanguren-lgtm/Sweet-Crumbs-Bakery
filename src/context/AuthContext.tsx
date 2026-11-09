import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { UserProfile } from '../types.ts';
import {
  registerCustomerAccount,
  loginCustomerAccount,
  getCurrentStoredUser,
  setCurrentStoredUser,
  updateCustomerProfile,
} from '../lib/dataService.ts';

interface AuthContextType {
  user: User | UserProfile | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name?: string,
    phone?: string,
    address?: string
  ) => Promise<{ error?: string }>;
  signOutUser: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; address?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isConfigured: false,
  signInWithEmail: async () => ({}),
  signUpWithEmail: async () => ({}),
  signOutUser: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  // Load existing user from persistent database storage or Supabase Auth
  useEffect(() => {
    const storedUser = getCurrentStoredUser();
    if (storedUser) {
      setProfile(storedUser);
    }

    const supabase = getSupabase();
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        setSession(currentSession);
        if (currentSession?.user && !storedUser) {
          const meta = currentSession.user.user_metadata || {};
          const loaded: UserProfile = {
            id: currentSession.user.id,
            uid: currentSession.user.id,
            email: currentSession.user.email || '',
            name: meta.full_name || meta.name || 'Customer',
            phone: meta.phone || '',
            address: meta.address || '',
          };
          setProfile(loaded);
          setCurrentStoredUser(loaded);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const stored = getCurrentStoredUser();
        if (stored) {
          setProfile(stored);
        } else {
          const meta = newSession.user.user_metadata || {};
          const loaded: UserProfile = {
            id: newSession.user.id,
            uid: newSession.user.id,
            email: newSession.user.email || '',
            name: meta.full_name || meta.name || 'Customer',
            phone: meta.phone || '',
            address: meta.address || '',
          };
          setProfile(loaded);
          setCurrentStoredUser(loaded);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<{ error?: string }> => {
    const res = await loginCustomerAccount(email, pass);
    if (res.error) {
      return { error: res.error };
    }
    if (res.user) {
      setProfile(res.user);
      setCurrentStoredUser(res.user);
    }
    return {};
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    phone?: string,
    address?: string
  ): Promise<{ error?: string }> => {
    const res = await registerCustomerAccount({
      fullName: name || '',
      email,
      password: pass,
      phone: phone || '',
      address: address || '',
    });

    if (res.error) {
      return { error: res.error };
    }

    if (res.user) {
      setProfile(res.user);
      setCurrentStoredUser(res.user);
    }
    return {};
  };

  const signOutUser = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch {}
    setProfile(null);
    setSession(null);
    setCurrentStoredUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; address?: string }) => {
    if (!profile?.email) return;
    const updated = await updateCustomerProfile(profile.email, data);
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user: profile as any,
        session,
        profile,
        loading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
