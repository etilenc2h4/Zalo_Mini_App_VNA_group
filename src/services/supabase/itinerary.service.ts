import { getSupabaseClient, isSupabaseConfigured } from './client';
import { UserItinerary } from './types';
import { getVietnamIsoString } from '../../utils/date';

const LOCAL_STORAGE_KEY = 'daksong_saved_itineraries';

/**
 * Lấy danh sách lịch trình từ LocalStorage
 */
export const getLocalItineraries = (): UserItinerary[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Lỗi đọc local itineraries:', e);
    return [];
  }
};

/**
 * Lưu danh sách lịch trình vào LocalStorage
 */
export const setLocalItineraries = (itineraries: UserItinerary[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(itineraries.slice(0, 20)));
  } catch (e) {
    console.warn('Lỗi ghi local itineraries:', e);
  }
};

/**
 * Lấy danh sách lịch trình cá nhân của người dùng từ Supabase và hợp nhất với LocalStorage
 */
export const fetchUserItineraries = async (userId?: string | null): Promise<UserItinerary[]> => {
  const localList = getLocalItineraries();

  if (!userId || !isSupabaseConfigured()) {
    return localList;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return localList;

  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Lỗi lấy itineraries:', error.message);
      return localList;
    }

    const remoteList: UserItinerary[] = data || [];

    // Hợp nhất dữ liệu: Remote ưu tiên hơn, kèm bổ sung từ Local nếu chưa có trên Remote
    const combinedMap = new Map<string, UserItinerary>();
    remoteList.forEach((item) => combinedMap.set(item.id, item));
    localList.forEach((item) => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });

    const result = Array.from(combinedMap.values()).sort((a, b) => {
      const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
      const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    // Cập nhật lại LocalStorage đồng bộ
    setLocalItineraries(result);
    return result;
  } catch (err) {
    console.warn('[Supabase] Lỗi kết nối itineraries:', err);
    return localList;
  }
};

/**
 * Lưu hoặc cập nhật một lịch trình lên LocalStorage và Supabase
 */
export const saveUserItinerary = async (userId: string | null | undefined, itinerary: any): Promise<void> => {
  const now = getVietnamIsoString();
  const standardizedItem: UserItinerary = {
    id: itinerary.id,
    user_id: userId || 'local_user',
    title: itinerary.title,
    start_date: itinerary.startDate || itinerary.start_date || null,
    days: itinerary.days || [],
    reminder_enabled: itinerary.reminder_enabled ?? true,
    created_at: itinerary.created_at || now,
    updated_at: now
  };

  // 1. Cập nhật LocalStorage tức thời
  const currentLocal = getLocalItineraries();
  const filtered = currentLocal.filter((item) => item.id !== standardizedItem.id);
  setLocalItineraries([standardizedItem, ...filtered]);

  // 2. Đồng bộ lên Cloud Supabase nếu có đăng nhập
  if (userId && isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: Record<string, any> = {
          id: standardizedItem.id,
          user_id: userId,
          title: standardizedItem.title,
          start_date: standardizedItem.start_date,
          days: standardizedItem.days,
          reminder_enabled: standardizedItem.reminder_enabled,
          updated_at: now
        };

        const { error } = await supabase
          .from('itineraries')
          .upsert(payload, { onConflict: 'id' });

        if (error) {
          console.warn('[Supabase] Lỗi lưu itinerary:', error.message);
        }
      } catch (err) {
        console.warn('[Supabase] Lỗi kết nối lưu itinerary:', err);
      }
    }
  }
};

/**
 * Xóa một lịch trình trên LocalStorage và Supabase
 */
export const deleteUserItinerary = async (userId: string | null | undefined, itineraryId: string): Promise<void> => {
  // 1. Xóa khỏi LocalStorage
  const currentLocal = getLocalItineraries();
  setLocalItineraries(currentLocal.filter((item) => item.id !== itineraryId));

  // 2. Xóa khỏi Supabase nếu có
  if (userId && isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('itineraries')
          .delete()
          .eq('user_id', userId)
          .eq('id', itineraryId);

        if (error) {
          console.warn('[Supabase] Lỗi xóa itinerary:', error.message);
        }
      } catch (err) {
        console.warn('[Supabase] Lỗi kết nối xóa itinerary:', err);
      }
    }
  }
};

/**
 * Đổi tên tiêu đề một lịch trình
 */
export const updateItineraryTitle = async (
  userId: string | null | undefined,
  itineraryId: string,
  newTitle: string
): Promise<void> => {
  const currentLocal = getLocalItineraries();
  const target = currentLocal.find((i) => i.id === itineraryId);
  if (!target) return;

  target.title = newTitle;
  target.updated_at = getVietnamIsoString();
  setLocalItineraries([...currentLocal]);

  if (userId && isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('itineraries')
          .update({ title: newTitle, updated_at: target.updated_at })
          .eq('user_id', userId)
          .eq('id', itineraryId);
      } catch (e) {
        console.warn('[Supabase] Lỗi update tiêu đề itinerary:', e);
      }
    }
  }
};

/**
 * Bật/tắt thông báo nhắc nhở trước ngày khởi hành
 */
export const toggleTripReminder = async (
  userId: string | null | undefined,
  itineraryId: string,
  enabled: boolean
): Promise<void> => {
  const currentLocal = getLocalItineraries();
  const target = currentLocal.find((i) => i.id === itineraryId);
  if (!target) return;

  target.reminder_enabled = enabled;
  target.updated_at = getVietnamIsoString();
  setLocalItineraries([...currentLocal]);

  if (userId && isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('itineraries')
          .update({ reminder_enabled: enabled, updated_at: target.updated_at })
          .eq('user_id', userId)
          .eq('id', itineraryId);
      } catch (e) {
        console.warn('[Supabase] Lỗi update reminder_enabled:', e);
      }
    }
  }
};

