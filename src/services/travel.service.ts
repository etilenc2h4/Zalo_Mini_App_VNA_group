import { BASE_CORE_URL, DEPARTMENT_CODE, TENANT_CODE, formatImageUrl } from './apiConfig';
import { TravelCategory, TravelLocation } from '../types/travel';
import { getCached, setCached } from './cache.service';

const CACHE_KEY = `travel_categories_${DEPARTMENT_CODE}`;
const CACHE_TTL = 15 * 60 * 1000; // 15 phút

/**
 * Lấy toàn bộ 14 Danh mục du lịch và 15 Địa điểm du lịch thực tế (kèm tọa độ GPS)
 * Endpoint: GET https://core-360.vnaapi.com/travel-category/all/DAKNONG-2-29
 */
export const getAllTravelCategoriesAndLocations = async (): Promise<TravelCategory[]> => {
  const cached = getCached<TravelCategory[]>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(`${BASE_CORE_URL}/travel-category/all/${DEPARTMENT_CODE}`, {
    headers: {
      'X-Department-Code': DEPARTMENT_CODE,
      'X-Tenant-Code': TENANT_CODE
    }
  });

  if (!res.ok) {
    throw new Error(`API Travel Category Error: ${res.status}`);
  }

  const json = await res.json();
  const rawList = json?.data || [];

  const categories: TravelCategory[] = rawList.map((c: any) => ({
    id: c.id,
    name: c.name?.trim() || '',
    icon: c.icon || 'DIADIEMDULICH',
    isActivated: !!c.isActivated,
    travelLocations: (c.travelLocations || []).map((loc: any) => ({
      id: loc.id,
      travelCategoryId: loc.travelCategoryId || c.id,
      travelCategoryIcon: loc.travelCategoryIcon || c.icon,
      name: loc.name?.trim() || '',
      address: loc.address || null,
      phone: loc.phone || null,
      image: loc.image || null,
      imageUrl: formatImageUrl(loc.image),
      content: loc.content || null,
      lat: typeof loc.lat === 'number' ? loc.lat : null,
      lng: typeof loc.lng === 'number' ? loc.lng : null,
      link: loc.link || null,
      pageId: loc.pageId || null,
      isActivated: loc.isActivated !== false
    }))
  }));

  setCached(CACHE_KEY, categories, CACHE_TTL);
  return categories;
};

/**
 * Lấy danh sách phẳng tất cả các địa điểm du lịch có trong hệ thống
 */
export const getAllTravelLocations = async (): Promise<TravelLocation[]> => {
  const categories = await getAllTravelCategoriesAndLocations();
  const locationMap = new Map<string, TravelLocation>();

  categories.forEach((cat) => {
    cat.travelLocations.forEach((loc) => {
      if (!locationMap.has(loc.id)) {
        locationMap.set(loc.id, loc);
      }
    });
  });

  return Array.from(locationMap.values());
};

/**
 * Ghi nhận lượt xem địa điểm du lịch
 * Endpoint: PUT https://core-360.vnaapi.com/travel-location/{id}/view
 */
export const recordTravelLocationView = async (location: TravelLocation): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_CORE_URL}/travel-location/${location.id}/view`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Department-Code': DEPARTMENT_CODE,
        'X-Tenant-Code': TENANT_CODE
      },
      body: JSON.stringify({
        travelCategoryId: location.travelCategoryId,
        name: location.name,
        address: location.address,
        phone: location.phone,
        image: location.image,
        content: location.content,
        lat: location.lat,
        lng: location.lng,
        link: location.link,
        pageId: location.pageId,
        isActivated: location.isActivated,
        travelCategoryIcon: location.travelCategoryIcon
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Lỗi ghi nhận view địa điểm du lịch:', err);
    return false;
  }
};

