import { UserItinerary } from './supabase/types';

/**
 * Service quản lý thông báo nhắc nhở ngày đi du lịch
 */

/**
 * Yêu cầu cấp quyền nhận thông báo từ hệ thống
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Lỗi xin quyền notification:', e);
    return false;
  }
};

export interface UpcomingTripStatus {
  trip: UserItinerary;
  daysLeft: number;
  isToday: boolean;
  statusTextVi: string;
  statusTextEn: string;
}

/**
 * Tính toán số ngày còn lại đến ngày khởi hành (chuẩn ngày Việt Nam)
 */
export const calculateTripDaysLeft = (startDateStr?: string | null): number | null => {
  if (!startDateStr) return null;
  const parts = startDateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [year, month, day] = parts;
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = start.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Tìm chuyến đi sắp diễn ra gần nhất
 */
export const findUpcomingTrip = (itineraries: UserItinerary[]): UpcomingTripStatus | null => {
  if (!itineraries || itineraries.length === 0) return null;

  const tripsWithDates = itineraries
    .map((trip) => {
      const daysLeft = calculateTripDaysLeft(trip.start_date);
      return { trip, daysLeft };
    })
    .filter((item): item is { trip: UserItinerary; daysLeft: number } => 
      item.daysLeft !== null && item.daysLeft >= 0 && item.trip.reminder_enabled !== false
    )
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (tripsWithDates.length === 0) return null;

  const nearest = tripsWithDates[0];
  const isToday = nearest.daysLeft === 0;

  let statusTextVi = '';
  let statusTextEn = '';

  if (isToday) {
    statusTextVi = 'Khởi hành hôm nay!';
    statusTextEn = 'Departing today!';
  } else if (nearest.daysLeft === 1) {
    statusTextVi = 'Khởi hành vào ngày mai!';
    statusTextEn = 'Departing tomorrow!';
  } else {
    statusTextVi = `Còn ${nearest.daysLeft} ngày nữa`;
    statusTextEn = `${nearest.daysLeft} days to departure`;
  }

  return {
    trip: nearest.trip,
    daysLeft: nearest.daysLeft,
    isToday,
    statusTextVi,
    statusTextEn
  };
};

/**
 * Bắn thông báo nhắc nhở chuyến đi (nếu còn 1-3 ngày hoặc đúng ngày khởi hành)
 */
export const triggerTripNotification = (upcoming: UpcomingTripStatus): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  const tripId = upcoming.trip.id;
  const todayKey = new Date().toISOString().split('T')[0];
  const cacheKey = `trip_notified_${tripId}_${todayKey}`;

  // Không bắn lặp lại nhiều lần trong cùng 1 ngày
  if (localStorage.getItem(cacheKey)) return false;

  try {
    const title = upcoming.isToday 
      ? '🎉 Chuyến đi Đắk Song của bạn bắt đầu hôm nay!' 
      : `🔔 Nhắc nhở: Chuyến đi Đắk Song chỉ còn ${upcoming.daysLeft} ngày!`;

    const body = `Kế hoạch: "${upcoming.trip.title}". Đắk Song đang có khí hậu mát mẻ 24°C, hãy sẵn sàng đồ dùng cho hành trình nhé!`;

    new Notification(title, {
      body,
      icon: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80',
      badge: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80'
    });

    localStorage.setItem(cacheKey, 'true');
    return true;
  } catch (e) {
    console.warn('Lỗi gửi thông báo Web Notification:', e);
    return false;
  }
};

