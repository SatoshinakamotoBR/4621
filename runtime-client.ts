// Runtime-safe Supabase client that falls back to publishable defaults if env vars are missing
// Do NOT store any secret keys here. The anon key is public and safe for frontend usage.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Fallbacks (publishable)
const FALLBACK_URL = 'https://gtkavkscbxyfjgovwoxn.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0a2F2a3NjYnh5Zmpnb3Z3b3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzAyMDQsImV4cCI6MjA3NTY0NjIwNH0.W14rIpbAsnFv5TBAruCM48k-YZr8m-yUQTlBWaZ8yiM';

const SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
