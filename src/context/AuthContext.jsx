import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '../services/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if demo session was active in localStorage
    const savedDemo = localStorage.getItem('st_demo_session');
    if (savedDemo === 'true') {
      setIsDemo(true);
      setUser({
        id: 'demo-user-123',
        email: 'student@example.com',
      });
      setProfile({
        id: 'demo-user-123',
        full_name: 'Rahul Sharma',
        currency: 'INR',
        email: 'student@example.com',
      });
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(currentUser) {
    const supabase = getSupabase();
    if (!supabase || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!error && data) {
        setProfile({
          ...data,
          email: currentUser.email,
        });
      } else {
        setProfile({
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || 'Account Holder',
          currency: currentUser.user_metadata?.currency || 'INR',
        });
      }
    } catch (e) {
      console.warn('Failed to fetch profile:', e);
      setProfile({
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.user_metadata?.full_name || 'Account Holder',
        currency: 'INR',
      });
    }
  }

  // Sign up with Supabase
  async function signUp({ email, password, fullName, currency = 'INR' }) {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials or use the Demo mode.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          currency,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  // Sign in with Supabase
  async function signIn({ email, password }) {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials or use the Demo mode.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    setIsDemo(false);
    localStorage.removeItem('st_demo_session');
    return data;
  }

  // Start Demo Session
  function startDemoSession() {
    setIsDemo(true);
    localStorage.setItem('st_demo_session', 'true');
    const demoUser = {
      id: 'demo-user-123',
      email: 'student@example.com',
    };
    setUser(demoUser);
    setProfile({
      id: 'demo-user-123',
      full_name: 'Rahul Sharma',
      currency: 'INR',
      email: 'student@example.com',
    });
  }

  // Reset Password
  async function resetPassword(email) {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) throw error;
    return data;
  }

  // Sign Out
  async function signOut() {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsDemo(false);
    localStorage.removeItem('st_demo_session');
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  // Local profile updater
  function updateProfileLocal(updated) {
    setProfile((prev) => ({ ...prev, ...updated }));
  }

  const token = isDemo ? 'demo-user-123' : session?.access_token || '';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        token,
        loading,
        isDemo,
        isConfigured: isSupabaseConfigured(),
        signIn,
        signUp,
        signOut,
        resetPassword,
        startDemoSession,
        updateProfileLocal,
        refreshProfile: () => user && fetchProfile(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
