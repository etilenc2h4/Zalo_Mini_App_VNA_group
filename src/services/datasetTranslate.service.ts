/**
 * Dịch vụ dịch dữ liệu danh sách/bộ dữ liệu từ API sang Tiếng Anh
 */
import { LivePortalPost, TravelLocation, Destination, Specialty, Stay } from '../types';
import { translateWithGoogle } from './translate.service';

/**
 * Dịch toàn bộ mảng bài viết (Posts) từ API sang Tiếng Anh
 */
export const translateDatasetPosts = async (
  posts: LivePortalPost[],
  targetLang: 'en' | 'vi'
): Promise<LivePortalPost[]> => {
  if (targetLang === 'vi' || !posts || posts.length === 0) return posts;

  const cacheKey = `dataset_posts_${targetLang}_${posts.length}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  const translatedList = await Promise.all(
    posts.map(async (p) => {
      const [nameEn, quoteEn, catEn] = await Promise.all([
        translateWithGoogle(p.name, targetLang),
        p.quote ? translateWithGoogle(p.quote, targetLang) : Promise.resolve(''),
        p.categoryName ? translateWithGoogle(p.categoryName, targetLang) : Promise.resolve('')
      ]);
      return {
        ...p,
        name: nameEn || p.name,
        quote: quoteEn || p.quote,
        categoryName: catEn || p.categoryName
      };
    })
  );

  try {
    localStorage.setItem(cacheKey, JSON.stringify(translatedList));
  } catch (e) {}

  return translatedList;
};

/**
 * Dịch toàn bộ mảng địa điểm du lịch (Travel Locations) từ API sang Tiếng Anh
 */
export const translateDatasetTravelLocations = async (
  locs: TravelLocation[],
  targetLang: 'en' | 'vi'
): Promise<TravelLocation[]> => {
  if (targetLang === 'vi' || !locs || locs.length === 0) return locs;

  const cacheKey = `dataset_locs_${targetLang}_${locs.length}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  const translatedList = await Promise.all(
    locs.map(async (l) => {
      const [nameEn, contentEn, addressEn, catEn] = await Promise.all([
        translateWithGoogle(l.name, targetLang),
        l.content ? translateWithGoogle(l.content, targetLang) : Promise.resolve(''),
        l.address ? translateWithGoogle(l.address, targetLang) : Promise.resolve(''),
        l.travelCategoryIcon ? translateWithGoogle(l.travelCategoryIcon, targetLang) : Promise.resolve('')
      ]);
      return {
        ...l,
        name: nameEn || l.name,
        content: contentEn || l.content,
        address: addressEn || l.address,
        travelCategoryIcon: catEn || l.travelCategoryIcon
      };
    })
  );

  try {
    localStorage.setItem(cacheKey, JSON.stringify(translatedList));
  } catch (e) {}

  return translatedList;
};

/**
 * Dịch toàn bộ danh sách điểm đến tham quan (Destinations) sang Tiếng Anh
 */
export const translateDatasetDestinations = async (
  dests: Destination[],
  targetLang: 'en' | 'vi'
): Promise<Destination[]> => {
  if (targetLang === 'vi' || !dests || dests.length === 0) return dests;

  const cacheKey = `dataset_dests_${targetLang}_${dests.length}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  const translatedList = await Promise.all(
    dests.map(async (d) => {
      const [nameEn, descEn, catLabelEn, addressEn] = await Promise.all([
        translateWithGoogle(d.name, targetLang),
        translateWithGoogle(d.description, targetLang),
        translateWithGoogle(d.categoryLabel, targetLang),
        translateWithGoogle(d.address, targetLang)
      ]);
      return {
        ...d,
        name: nameEn || d.name,
        description: descEn || d.description,
        categoryLabel: catLabelEn || d.categoryLabel,
        address: addressEn || d.address
      };
    })
  );

  try {
    localStorage.setItem(cacheKey, JSON.stringify(translatedList));
  } catch (e) {}

  return translatedList;
};

/**
 * Dịch toàn bộ danh sách đặc sản (Specialties) sang Tiếng Anh
 */
export const translateDatasetSpecialties = async (
  specs: Specialty[],
  targetLang: 'en' | 'vi'
): Promise<Specialty[]> => {
  if (targetLang === 'vi' || !specs || specs.length === 0) return specs;

  const cacheKey = `dataset_specs_${targetLang}_${specs.length}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  const translatedList = await Promise.all(
    specs.map(async (s) => {
      const [nameEn, descEn, buyEn, catLabelEn] = await Promise.all([
        translateWithGoogle(s.name, targetLang),
        translateWithGoogle(s.description, targetLang),
        translateWithGoogle(s.whereToBuy, targetLang),
        translateWithGoogle(s.categoryLabel, targetLang)
      ]);
      return {
        ...s,
        name: nameEn || s.name,
        description: descEn || s.description,
        whereToBuy: buyEn || s.whereToBuy,
        categoryLabel: catLabelEn || s.categoryLabel
      };
    })
  );

  try {
    localStorage.setItem(cacheKey, JSON.stringify(translatedList));
  } catch (e) {}

  return translatedList;
};

/**
 * Dịch toàn bộ danh sách cơ sở lưu trú (Stays) sang Tiếng Anh
 */
export const translateDatasetStays = async (
  stays: Stay[],
  targetLang: 'en' | 'vi'
): Promise<Stay[]> => {
  if (targetLang === 'vi' || !stays || stays.length === 0) return stays;

  const cacheKey = `dataset_stays_${targetLang}_${stays.length}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  const translatedList = await Promise.all(
    stays.map(async (s) => {
      const [nameEn, typeLabelEn, addressEn, descEn] = await Promise.all([
        translateWithGoogle(s.name, targetLang),
        translateWithGoogle(s.typeLabel, targetLang),
        translateWithGoogle(s.address, targetLang),
        translateWithGoogle(s.description, targetLang)
      ]);
      return {
        ...s,
        name: nameEn || s.name,
        typeLabel: typeLabelEn || s.typeLabel,
        address: addressEn || s.address,
        description: descEn || s.description
      };
    })
  );

  try {
    localStorage.setItem(cacheKey, JSON.stringify(translatedList));
  } catch (e) {}

  return translatedList;
};

