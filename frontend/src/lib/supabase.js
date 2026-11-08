import { createClient } from '@supabase/supabase-js';

// Safe fallbacks to prevent startup crashes when env vars are missing or undefined
const DEFAULT_SUPABASE_URL = 'https://ouohlfvomoktszrhfrdk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_ZshDmZ6fubt0aqzj9bI7ew_RLwvpqGM';

function sanitize(val) {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null') {
      return trimmed;
    }
  }
  return null;
}

const envUrl = typeof import.meta !== 'undefined' ? sanitize(import.meta.env?.VITE_SUPABASE_URL) : null;
const envKey = typeof import.meta !== 'undefined' ? sanitize(import.meta.env?.VITE_SUPABASE_ANON_KEY) : null;

export const supabaseUrl = envUrl || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = envKey || DEFAULT_SUPABASE_ANON_KEY;

/**
 * Create a dummy fallback client if initialization fails,
 * preventing unhandled module-level crashes on render.
 */
function createSafeClient() {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (primaryErr) {
    console.warn('[Supabase] Failed to init with provided credentials, falling back to default:', primaryErr);
    try {
      return createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
    } catch (fallbackErr) {
      console.error('[Supabase] Critical: Failed to create client:', fallbackErr);
      // Return a safe mock object to avoid crashing any caller
      return {
        from: () => ({
          select: () => Promise.resolve({ data: [], error: new Error('Supabase client failed to initialize.') }),
          insert: () => Promise.resolve({ data: null, error: new Error('Supabase client failed to initialize.') }),
          update: () => Promise.resolve({ data: null, error: new Error('Supabase client failed to initialize.') }),
          delete: () => Promise.resolve({ data: null, error: new Error('Supabase client failed to initialize.') }),
        }),
        channel: () => ({
          on: function () { return this; },
          subscribe: () => ({ unsubscribe: () => { } }),
        }),
        removeChannel: () => { },
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        },
      };
    }
  }
}

export const supabase = createSafeClient();
