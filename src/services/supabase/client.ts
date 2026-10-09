import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('[Supabase] Khởi tạo thất bại, chuyển sang chế độ Local Storage:', err);
    supabaseInstance = null;
  }
}

/**
 * Lấy instance Supabase client hiện tại
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  return supabaseInstance;
};

/**
 * Kiểm tra xem Supabase đã được kết nối và cấu hình thành công hay chưa
 */
export const isSupabaseConfigured = (): boolean => {
  return supabaseInstance !== null;
};

export { supabaseInstance as supabase };

