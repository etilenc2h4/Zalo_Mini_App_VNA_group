import { BASE_CORE_URL, DEPARTMENT_CODE, formatImageUrl } from './apiConfig';
import { PortalBanner } from '../types/banner';
import { getCached, setCached } from './cache.service';

const CACHE_KEY = `banners_${DEPARTMENT_CODE}`;
const CACHE_TTL = 30 * 60 * 1000;

export const getAllBanners = async (): Promise<PortalBanner[]> => {
  const cached = getCached<PortalBanner[]>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(`${BASE_CORE_URL}/banner/all/${DEPARTMENT_CODE}`);
  if (!res.ok) {
    throw new Error(`API Banner Error: ${res.status}`);
  }

  const json = await res.json();
  const list = json?.data || [];

  const banners: PortalBanner[] = list.map((b: any) => {
    const fullImg = formatImageUrl(b.url);
    const pannellumUrl = `https://cdn.pannellum.org/2.5/pannellum.htm?panorama=${encodeURIComponent(fullImg)}&autoLoad=true&autoRotate=-2`;
    return {
      id: b.id,
      type: b.type,
      name: b.name || 'Cổng Văn Hóa Du Lịch - Đắk Song',
      title: b.title,
      subTitle: b.subTitle,
      url: b.url,
      fullImageUrl: fullImg,
      pannellumUrl,
      link: b.link,
      showButton: b.showButton,
      isActivated: b.isActivated,
      createdDate: b.createdDate
    };
  });

  setCached(CACHE_KEY, banners, CACHE_TTL);
  return banners;
};

