import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'st_supabase_url';
const STORAGE_KEY_ANON = 'st_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : '';
  const localAnon = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : '';

  const url = localUrl || envUrl;
  const anonKey = localAnon || envAnon;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-id') &&
    !anonKey.includes('your-anon-publishable-key')
  );

  return { url, anonKey, isConfigured };
}

export function saveStoredSupabaseConfig(url, anonKey) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  }
}

export function clearStoredSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
}

let supabaseClient = null;

export function getSupabase() {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseClient;
}

export function isSupabaseConfigured() {
  return getStoredSupabaseConfig().isConfigured;
}
