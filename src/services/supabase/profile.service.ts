import { getSupabaseClient } from './client';
import { UserProfile } from './types';

/**
 * Lấy hồ sơ người dùng đã lưu từ Supabase (nếu có)
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Lỗi tìm profile:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] Lỗi kết nối khi tải profile:', err);
    return null;
  }
};

/**
 * Đồng bộ hoặc lưu hồ sơ người dùng Zalo lên Supabase
 */
export const syncUserProfile = async (profile: { id: string; name: string; avatar: string }): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('[Supabase] Không thể đồng bộ profile:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Lỗi kết nối khi đồng bộ profile:', err);
  }
};

