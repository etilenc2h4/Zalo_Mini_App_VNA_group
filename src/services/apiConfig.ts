const getEnv = (key: string, defaultValue: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  return defaultValue;
};

export const BASE_CORE_URL = getEnv('VITE_API_BASE_URL', 'https://core-360.vnaapi.com');
export const BASE_TENANT_URL = getEnv('VITE_TENANT_API_BASE_URL', 'https://core-tenant.vnaapi.com');
export const DEPARTMENT_CODE = getEnv('VITE_DEPARTMENT_CODE', 'DAKNONG-2-29');
export const TENANT_CODE = getEnv('VITE_TENANT_CODE', 'DAKNONG');
export const STATIC_IMAGE_PREFIX = getEnv('VITE_MEDIA_CDN_URL', 'https://static.dggv.edu.vn');
export const BACKEND_API_URL = getEnv('VITE_BACKEND_API_URL', 'http://localhost:4000/api');

/**
 * Ghép đường dẫn hình ảnh với CDN static của hệ thống Đắk Song
 */
export const formatImageUrl = (imgPath?: string | null): string => {
  if (!imgPath) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
  const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
  return `${STATIC_IMAGE_PREFIX}/${cleanPath}`;
};

/**
 * Headers tiêu chuẩn khi gửi request đến core-360 API
 */
export const getDefaultHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'X-Department-Code': DEPARTMENT_CODE,
  'X-Tenant-Code': TENANT_CODE
});

