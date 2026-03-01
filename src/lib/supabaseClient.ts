import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/db';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseEnv) {
  const message = 'Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
  if (import.meta.env.PROD) {
    throw new Error(message);
  }
  console.warn(`${message} Using placeholders in development.`);
}

export const supabase = createClient<Database>(
  hasSupabaseEnv ? supabaseUrl : 'https://placeholder.supabase.co',
  hasSupabaseEnv ? supabaseAnonKey : 'placeholder'
);
