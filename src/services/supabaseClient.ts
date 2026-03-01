// Re-export the single Supabase client from the shared lib to avoid creating
// multiple instances (which spawns multiple GoTrue auth clients).
export { supabase } from '../lib/supabaseClient';
