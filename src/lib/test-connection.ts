import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase connection successful!');
    return { success: true, data };
  } catch (err) {
    console.error('Connection test error:', err);
    return { success: false, error: err };
  }
}

