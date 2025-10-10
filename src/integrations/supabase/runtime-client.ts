// Runtime-safe Supabase client that falls back to publishable defaults if env vars are missing
// Do NOT store any secret keys here. The anon key is public and safe for frontend usage.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Fallbacks (publishable)
const FALLBACK_URL = 'https://ffhkukygnqejsivebimc.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaGt1a3lnbnFlanNpdmViaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzk0NjAsImV4cCI6MjA3NDgxNTQ2MH0.6R32towAmVIEA5le4onYucbwD6ox4YRkrRIp9p2wJM8';

const SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
