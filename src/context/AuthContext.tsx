import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { UserProfile } from '../types.ts';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
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
  signInWithGoogle: async () => ({}),
  signOutUser: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  // Load profile from local storage or user metadata
  const loadProfile = (usr: User | null) => {
    if (!usr) {
      setProfile(null);
      return;
    }
    const meta = usr.user_metadata || {};
    const localSaved = localStorage.getItem(`sc_profile_${usr.id}`);
    const parsed = localSaved ? JSON.parse(localSaved) : {};

    setProfile({
      id: 1,
      uid: usr.id,
      email: usr.email || '',
      name: parsed.name || meta.full_name || meta.name || usr.email?.split('@')[0] || 'Customer',
      phone: parsed.phone || '',
      address: parsed.address || '',
    });
  };

  useEffect(() => {
    const supabase = getSupabase();

    // Check existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      loadProfile(currentSession?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      loadProfile(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      return { error: error.message };
    }
    setUser(data.user);
    setSession(data.session);
    loadProfile(data.user);
    return {};
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name || '',
        },
      },
    });
    if (error) {
      return { error: error.message };
    }
    setUser(data.user);
    setSession(data.session);
    loadProfile(data.user);
    return {};
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const signOutUser = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; address?: string }) => {
    if (!user) return;
    const updated = {
      ...(profile || { id: 1, uid: user.id, email: user.email || '' }),
      ...data,
    };
    setProfile(updated as UserProfile);
    localStorage.setItem(`sc_profile_${user.id}`, JSON.stringify(data));

    // Also update Supabase user metadata if available
    const supabase = getSupabase();
    if (data.name) {
      await supabase.auth.updateUser({
        data: { full_name: data.name },
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOutUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
