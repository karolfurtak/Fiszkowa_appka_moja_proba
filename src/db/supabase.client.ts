import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types.ts';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Default user ID for development/testing (before auth is implemented)
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Export SupabaseClient type for use in Edge Functions
export type { SupabaseClient };

