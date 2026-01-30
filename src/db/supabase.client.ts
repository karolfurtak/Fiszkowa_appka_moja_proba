import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types.ts';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && 'PUBLIC_SUPABASE_URL',
    !supabaseAnonKey && 'PUBLIC_SUPABASE_ANON_KEY',
  ].filter(Boolean) as string[];
  throw new Error(
    `Missing Supabase env: ${missing.join(', ')}. ` +
      'Lokalnie: uruchom "npx supabase start", potem "npx supabase status" i wklej "anon key" do .env jako PUBLIC_SUPABASE_ANON_KEY.'
  );
}

// Create browser client that syncs with SSR cookies
// This ensures session is shared between client and server
export const supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      // Get all cookies from document.cookie
      const cookies: { name: string; value: string }[] = [];
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach((cookie) => {
          const [name, ...valueParts] = cookie.trim().split('=');
          if (name && valueParts.length > 0) {
            cookies.push({
              name: name.trim(),
              value: decodeURIComponent(valueParts.join('=')),
            });
          }
        });
      }
      return cookies;
    },
    setAll(cookies) {
      // Set all cookies in document.cookie
      if (typeof document !== 'undefined') {
        cookies.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          if (options) {
            if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;
            if (options.path) cookieString += `; path=${options.path}`;
            if (options.domain) cookieString += `; domain=${options.domain}`;
            if (options.secure) cookieString += `; secure`;
            if (options.httpOnly) cookieString += `; httponly`;
            if (options.sameSite) {
              cookieString += `; samesite=${options.sameSite}`;
            }
          }
          document.cookie = cookieString;
        });
      }
    },
  },
});

// Default user ID for development/testing (before auth is implemented)
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Export SupabaseClient type for use in Edge Functions
export type { SupabaseClient };

