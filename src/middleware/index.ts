import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../db/database.types.ts';

export const onRequest = defineMiddleware((context, next) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Create Supabase client for SSR using @supabase/ssr
  // This properly handles cookies in Astro SSR environment
  context.locals.supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Get all cookies from Astro context
        const allCookies: { name: string; value: string }[] = [];
        // Astro cookies doesn't have getAll(), so we need to get from headers
        const cookieHeader = context.request.headers.get('cookie') || '';
        if (cookieHeader) {
          cookieHeader.split(';').forEach((cookie) => {
            const [name, ...valueParts] = cookie.trim().split('=');
            if (name && valueParts.length > 0) {
              allCookies.push({
                name: name.trim(),
                value: decodeURIComponent(valueParts.join('=')),
              });
            }
          });
        }
        return allCookies;
      },
      setAll(cookies) {
        // Set all cookies in Astro context
        cookies.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, {
            httpOnly: options?.httpOnly ?? true,
            secure: options?.secure ?? false,
            sameSite: options?.sameSite ?? 'lax',
            maxAge: options?.maxAge,
            path: options?.path ?? '/',
          });
        });
      },
    },
  });

  return next();
});

