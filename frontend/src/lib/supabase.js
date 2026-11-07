import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ouohlfvomoktszrhfrdk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZshDmZ6fubt0aqzj9bI7ew_RLwvpqGM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

