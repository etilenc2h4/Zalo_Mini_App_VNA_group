import { getSupabaseClient } from './client';
import { UserFavorite } from './types';

/**
 * Lấy danh sách ID các mục đã lưu của người dùng từ Supabase
 */
export const fetchUserFavorites = async (userId: string): Promise<string[]> => {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('destination_id')
      .eq('user_id', userId);

    if (error) {
      console.warn('[Supabase] Lỗi lấy danh sách favorites:', error.message);
      return [];
    }
    return data ? data.map((item: { destination_id: string }) => item.destination_id) : [];
  } catch (err) {
    console.warn('[Supabase] Lỗi kết nối favorites:', err);
    return [];
  }
};

/**
 * Lấy toàn bộ danh sách chi tiết các mục đã lưu trực tiếp từ CSDL Supabase
 * Tự chủ 100%, không phụ thuộc vào hệ thống API bên thứ ba
 */
export const fetchUserFavoriteDetails = async (userId: string): Promise<UserFavorite[]> => {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Lỗi lấy chi tiết favorites:', error.message);
      return [];
    }
    return (data as UserFavorite[]) || [];
  } catch (err) {
    console.warn('[Supabase] Lỗi kết nối lấy chi tiết favorites:', err);
    return [];
  }
};

/**
 * Lưu mục yêu thích kèm thông tin đầy đủ vào CSDL Supabase
 */
export const syncSaveFavorite = async (
  userId: string,
  item: {
    destination_id: string;
    title?: string;
    image?: string | null;
    address?: string;
    category_label?: string;
    target_type?: string;
    extra_data?: Record<string, any>;
  }
): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;
  try {
    const { error } = await supabase
      .from('favorites')
      .upsert(
        {
          user_id: userId,
          destination_id: item.destination_id,
          title: item.title || null,
          image: item.image || null,
          address: item.address || null,
          category_label: item.category_label || null,
          target_type: item.target_type || 'destination',
          extra_data: item.extra_data || {},
          created_at: new Date().toISOString()
        },
        { onConflict: 'user_id, destination_id' }
      );

    if (error) {
      console.warn('[Supabase] Thêm favorite lỗi, tự động lưu fallback cơ bản:', error.message);
      // Fallback: Lưu cơ bản nếu Supabase chưa chạy migration 002
      const { error: fallbackError } = await supabase
        .from('favorites')
        .upsert(
          {
            user_id: userId,
            destination_id: item.destination_id,
            created_at: new Date().toISOString()
          },
          { onConflict: 'user_id, destination_id' }
        );
      if (fallbackError) {
        console.warn('[Supabase] Fallback favorite cũng lỗi:', fallbackError.message);
      }
    }
  } catch (err) {
    console.warn('[Supabase] Lỗi kết nối khi lưu favorite:', err);
  }
};

/**
 * Xóa một mục khỏi danh sách yêu thích trong CSDL Supabase
 */
export const syncRemoveFavorite = async (userId: string, destinationId: string): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('destination_id', destinationId);

    if (error) {
      console.warn('[Supabase] Xóa favorite lỗi:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase] Lỗi kết nối khi xóa favorite:', err);
  }
};

/**
 * Đồng bộ thêm hoặc xóa một mục yêu thích trên Supabase
 * Hỗ trợ truyền kèm metadata nếu có
 */
export const syncToggleFavorite = async (
  userId: string,
  destinationId: string,
  isFavorite: boolean,
  itemMetadata?: {
    title?: string;
    image?: string | null;
    address?: string;
    category_label?: string;
    target_type?: string;
    extra_data?: Record<string, any>;
  }
): Promise<void> => {
  if (isFavorite) {
    await syncSaveFavorite(userId, {
      destination_id: destinationId,
      ...itemMetadata
    });
  } else {
    await syncRemoveFavorite(userId, destinationId);
  }
};
