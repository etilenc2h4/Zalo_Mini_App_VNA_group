/**
 * Zalo SDK Service wrapper
 * Hỗ trợ các tính năng native của Zalo Mini App:
 * - Chia sẻ app (openShareSheet)
 * - Mở bản đồ/chỉ đường (openMap/openWebview)
 * - Gọi hotline (openPhone)
 * - Lấy thông tin user / avatar nếu được cấp quyền
 */

import * as zmpSdk from 'zmp-sdk';

// Lấy Zalo Mini App SDK trực tiếp và tức thì
const zmp: any = (typeof window !== 'undefined' && (window as any).ZaloMiniAppSDK) 
  || (zmpSdk as any).default 
  || zmpSdk;

export const shareApp = async (title: string, desc: string, path: string = '/') => {
  try {
    if (zmp && zmp.openShareSheet) {
      await zmp.openShareSheet({
        type: 'zmp',
        data: {
          title: title || 'Khám Phá Du Lịch Đắk Song - Tây Nguyên Đại Ngàn',
          description: desc || 'Trải nghiệm cánh đồng điện gió, đồi thông săn mây và đặc sản hồ tiêu trứ danh Đắk Song!',
          thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          path,
        },
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title,
        text: desc,
        url: window.location.href,
      });
      return true;
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết vào bộ nhớ tạm để chia sẻ!');
      return true;
    }
  } catch (error) {
    console.warn('Share canceled or failed:', error);
    return false;
  }
};

export const makePhoneCall = (phoneNumber: string) => {
  try {
    if (zmp && zmp.openPhone) {
      zmp.openPhone({
        phoneNumber: phoneNumber.replace(/\s+/g, ''),
      });
    } else {
      window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    }
  } catch (e) {
    window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
  }
};

export const openExternalUrl = async (url: string) => {
  try {
    if (zmp && zmp.openOutApp) {
      await zmp.openOutApp({ url });
      return;
    }
  } catch (e) {
    console.warn('ZMP openOutApp error, falling back:', e);
  }

  try {
    if (zmp && zmp.openWebview) {
      await zmp.openWebview({ url });
      return;
    }
  } catch (e) {
    console.warn('ZMP openWebview error, falling back:', e);
  }

  // Fallback trình duyệt web
  const win = window.open(url, '_blank');
  if (!win) {
    window.location.href = url;
  }
};

export const openGoogleMaps = async (name: string, lat?: number, lng?: number, address?: string) => {
  // Định dạng Universal URL chuẩn của Google Maps: Tự động mở Google Maps App trên điện thoại và 100% không đòi API Key
  const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(`${name}, Đắk Song, Đắk Nông`);
  const url = `https://maps.google.com/?q=${query}`;
  await openExternalUrl(url);
};

/**
 * Lấy vị trí GPS hiện tại của người dùng (Chỉ gọi khi người dùng chủ động yêu cầu)
 */
export const getUserLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    if (zmp && zmp.getLocation) {
      const loc = await zmp.getLocation();
      if (loc && loc.latitude && loc.longitude) {
        return { latitude: Number(loc.latitude), longitude: Number(loc.longitude) };
      }
    }
  } catch (err) {
    console.warn('ZMP getLocation error, trying navigator.geolocation:', err);
  }

  // Web fallback qua browser geolocation
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('Geolocation error:', err);
        resolve(null);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
};

/**
 * Quét mã QR code thông qua ZMP SDK
 */
export const scanQRCode = async (): Promise<string | null> => {
  try {
    if (zmp && zmp.scanQRCode) {
      const data = await zmp.scanQRCode();
      return data?.content || data || null;
    }
  } catch (err) {
    console.warn('ZMP scanQRCode error:', err);
  }
  return null;
};

export interface ZaloUserData {
  id: string;
  name: string;
  avatar: string;
  isMock?: boolean;
}

const STORAGE_KEY_USER = 'daksong_zalo_user_profile';
const STORAGE_KEY_PERMANENT_ID = 'daksong_permanent_device_uid';

/**
 * Lấy ID định danh người dùng duy nhất và VĨNH VIỄN không đổi
 * Đảm bảo 1 tài khoản chỉ có ĐÚNG 1 ROW trong CSDL Supabase
 */
export const getPermanentUserId = async (): Promise<string> => {
  // 1. Thử lấy ID chính thức từ Zalo SDK (getUserID) - Không yêu cầu quyền cá nhân
  try {
    if (zmp && zmp.getUserID) {
      const uid = await zmp.getUserID();
      if (uid && typeof uid === 'string' && uid.trim() !== '') {
        return uid.trim();
      }
    }
  } catch (e) {
    console.warn('ZMP getUserID fallback:', e);
  }

  // 2. Định danh cố định trên thiết bị/trình duyệt này (Persistent UUID)
  let storedId = localStorage.getItem(STORAGE_KEY_PERMANENT_ID);
  if (!storedId) {
    storedId = 'zalo_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEY_PERMANENT_ID, storedId);
  }
  return storedId;
};

/**
 * Lấy thông tin user đã lưu trong máy
 */
export const getStoredZaloUser = (): ZaloUserData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading stored user:', e);
  }
  return null;
};

/**
 * Đăng nhập Zalo Mini App tức thì:
 * - 1-Click đăng nhập nhanh, KHÔNG đòi quyền camera/micro/vị trí phiền phức
 * - ID cố định -> Supabase chỉ có duy nhất 1 dòng, không bị nhân bản row khi đăng xuất/đăng nhập lại
 */
export const loginZaloUser = async (): Promise<ZaloUserData> => {
  const permanentId = await getPermanentUserId();

  // 1. Kiểm tra xem đã có hồ sơ lưu cục bộ chưa
  const existingLocal = getStoredZaloUser();
  if (existingLocal && existingLocal.id === permanentId) {
    return existingLocal;
  }

  // 2. Khởi tạo profile chuẩn cho người dùng này
  const shortCode = permanentId.length >= 4 ? permanentId.slice(-4).toUpperCase() : permanentId;
  const user: ZaloUserData = {
    id: permanentId,
    name: `Du Khách #${shortCode}`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isMock: false
  };

  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  return user;
};

/**
 * Cập nhật tên hoặc avatar của người dùng
 */
export const updateStoredUserProfile = (updated: Partial<ZaloUserData>): ZaloUserData | null => {
  const current = getStoredZaloUser();
  if (!current) return null;
  const newProfile = { ...current, ...updated };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newProfile));
  return newProfile;
};

/**
 * Đăng xuất khỏi Zalo Mini App trên thiết bị này
 */
export const logoutZaloUser = (): void => {
  localStorage.removeItem(STORAGE_KEY_USER);
};

