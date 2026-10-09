/**
 * Tiện ích xử lý ngày tháng theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7)
 * Đảm bảo đồng bộ tuyệt đối giữa Client, LocalStorage và Database Supabase
 */

const VIETNAM_OFFSET_HOURS = 7;

/**
 * Lấy chuỗi ISO timestamp theo múi giờ Việt Nam (+07:00)
 * Ví dụ: 2026-10-08T15:45:00+07:00
 */
export const getVietnamIsoString = (date = new Date()): string => {
  // Tính toán thời gian tương ứng tại GMT+7
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const vnTime = new Date(utcTime + VIETNAM_OFFSET_HOURS * 3600000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const year = vnTime.getFullYear();
  const month = pad(vnTime.getMonth() + 1);
  const day = pad(vnTime.getDate());
  const hours = pad(vnTime.getHours());
  const minutes = pad(vnTime.getMinutes());
  const seconds = pad(vnTime.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
};

/**
 * Lấy chuỗi ngày YYYY-MM-DD chuẩn theo giờ Việt Nam
 * Ví dụ: 2026-10-08
 */
export const getVietnamDateString = (date = new Date()): string => {
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const vnTime = new Date(utcTime + VIETNAM_OFFSET_HOURS * 3600000);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${vnTime.getFullYear()}-${pad(vnTime.getMonth() + 1)}-${pad(vnTime.getDate())}`;
};

/**
 * Định dạng ngày thân thiện cho du khách Việt Nam
 * Ví dụ: 08/10/2026
 */
export const formatVietnamDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

