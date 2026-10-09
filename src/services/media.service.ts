import { BASE_CORE_URL, DEPARTMENT_CODE, formatImageUrl } from './apiConfig';
import { MediaItem } from '../types/media';
import { getCached, setCached } from './cache.service';

const CACHE_KEY = `media_images_${DEPARTMENT_CODE}`;
const CACHE_TTL = 30 * 60 * 1000;

export const getMediaImages = async (): Promise<MediaItem[]> => {
  const cached = getCached<MediaItem[]>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(`${BASE_CORE_URL}/media/all/IMAGE/${DEPARTMENT_CODE}`);
  if (!res.ok) {
    throw new Error(`API Media Image Error: ${res.status}`);
  }

  const json = await res.json();
  const list = json?.data || [];

  const items: MediaItem[] = list.map((m: any) => ({
    id: m.id,
    type: m.type,
    videoCategory: m.videoCategory,
    name: m.name,
    url: m.url,
    fullUrl: formatImageUrl(m.url),
    isPublished: !!m.isPublished,
    createdDate: m.createdDate
  }));

  setCached(CACHE_KEY, items, CACHE_TTL);
  return items;
};

