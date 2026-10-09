import { BASE_CORE_URL, DEPARTMENT_CODE, TENANT_CODE, formatImageUrl } from './apiConfig';
import { PortalPostItem, PostFindParams, PostFindResponse } from '../types/post';
import { getCached, setCached } from './cache.service';

/**
 * Tìm kiếm, lọc theo category và phân trang bài viết
 * Endpoint: POST https://core-360.vnaapi.com/post-public/find
 */
export const findPosts = async (params: PostFindParams = {}): Promise<PostFindResponse> => {
  const { pageNumber = 0, pageSize = 10, categorySlugOrId } = params;

  const res = await fetch(`${BASE_CORE_URL}/post-public/find`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Department-Code': DEPARTMENT_CODE,
      'X-Tenant-Code': TENANT_CODE
    },
    body: JSON.stringify({
      pageNumber,
      pageSize,
      ...(categorySlugOrId ? { categorySlugOrId } : {})
    })
  });

  if (!res.ok) {
    throw new Error(`API Post Find Error: ${res.status}`);
  }

  const json = await res.json();
  const data = json?.data || {};
  const rawItems = data?.items || [];

  const items: PortalPostItem[] = rawItems.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    subCategoryIds: p.subCategoryIds,
    categoryName: (p.categoryName || 'Văn hóa - Du lịch').trim(),
    quote: p.quote || '',
    content: p.content || '',
    image: p.image,
    imageUrl: formatImageUrl(p.image),
    publishDate: p.publishDate || '',
    creator: p.creator || 'VHTT huyện Đắk Song',
    creatorAvatar: p.creatorAvatar,
    view: p.view || 0,
    rating: p.rating || 5,
    outstanding: !!p.outstanding
  }));

  return {
    items,
    total: data.total || items.length
  };
};

/**
 * Lấy tất cả 42 bài viết thật
 * Endpoint: GET https://core-360.vnaapi.com/post/all/DAKNONG-2-29
 */
export const getAllPosts = async (): Promise<PortalPostItem[]> => {
  const cacheKey = `posts_all_${DEPARTMENT_CODE}`;
  const cached = getCached<PortalPostItem[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${BASE_CORE_URL}/post/all/${DEPARTMENT_CODE}`, {
    headers: {
      'X-Department-Code': DEPARTMENT_CODE,
      'X-Tenant-Code': TENANT_CODE
    }
  });

  if (!res.ok) {
    throw new Error(`API Post All Error: ${res.status}`);
  }

  const json = await res.json();
  const list = json?.data || [];

  const posts: PortalPostItem[] = list.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    subCategoryIds: p.subCategoryIds,
    categoryName: (p.categoryName || 'Văn hóa - Du lịch').trim(),
    quote: p.quote || '',
    content: p.content || '',
    image: p.image,
    imageUrl: formatImageUrl(p.image),
    publishDate: p.publishDate || '',
    creator: p.creator || 'VHTT huyện Đắk Song',
    creatorAvatar: p.creatorAvatar,
    view: p.view || 0,
    rating: p.rating || 5,
    outstanding: !!p.outstanding
  }));

  setCached(cacheKey, posts, 5 * 60 * 1000); // Cache 5 phút
  return posts;
};

/**
 * Lấy nội dung chi tiết bài viết (bao gồm nội dung HTML)
 * Endpoint: GET https://core-360.vnaapi.com/post-public/{slug}
 */
export const getPostDetail = async (slug: string): Promise<PortalPostItem> => {
  const res = await fetch(`${BASE_CORE_URL}/post-public/${slug}`, {
    headers: {
      'X-Department-Code': DEPARTMENT_CODE,
      'X-Tenant-Code': TENANT_CODE
    }
  });

  if (!res.ok) {
    throw new Error(`API Post Detail Error: ${res.status}`);
  }

  const json = await res.json();
  const p = json?.data;
  if (!p) {
    throw new Error(`Không tìm thấy bài viết: ${slug}`);
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    subCategoryIds: p.subCategoryIds,
    categoryName: (p.categoryName || 'Văn hóa - Du lịch').trim(),
    quote: p.quote || '',
    content: p.content || '',
    image: p.image,
    imageUrl: formatImageUrl(p.image),
    publishDate: p.publishDate || '',
    creator: p.creator || 'VHTT huyện Đắk Song',
    creatorAvatar: p.creatorAvatar,
    view: p.view || 0,
    rating: p.rating || 5,
    outstanding: !!p.outstanding
  };
};

/**
 * Lấy danh sách bài viết được xem nhiều nhất
 * Endpoint: GET https://core-360.vnaapi.com/post-public/most-viewed
 */
export const getMostViewedPosts = async (): Promise<PortalPostItem[]> => {
  const cacheKey = `posts_most_viewed_${DEPARTMENT_CODE}`;
  const cached = getCached<PortalPostItem[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${BASE_CORE_URL}/post-public/most-viewed`, {
    headers: {
      'X-Department-Code': DEPARTMENT_CODE,
      'X-Tenant-Code': TENANT_CODE
    }
  });

  if (!res.ok) {
    throw new Error(`API Most Viewed Error: ${res.status}`);
  }

  const json = await res.json();
  const list = json?.data || [];

  const items: PortalPostItem[] = list.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    subCategoryIds: p.subCategoryIds,
    categoryName: (p.categoryName || 'Văn hóa - Du lịch').trim(),
    quote: p.quote || '',
    content: p.content || '',
    image: p.image,
    imageUrl: formatImageUrl(p.image),
    publishDate: p.publishDate || '',
    creator: p.creator || 'VHTT huyện Đắk Song',
    view: p.view || 0,
    rating: p.rating || 5,
    outstanding: !!p.outstanding
  }));

  setCached(cacheKey, items, 10 * 60 * 1000);
  return items;
};

/**
 * Ghi nhận lượt xem bài viết
 * Endpoint: POST https://core-360.vnaapi.com/post-public/view/{slug}
 */
export const increasePostView = async (slug: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_CORE_URL}/post-public/view/${slug}`, {
      method: 'POST',
      headers: {
        'X-Department-Code': DEPARTMENT_CODE,
        'X-Tenant-Code': TENANT_CODE
      }
    });
    return res.ok;
  } catch (err) {
    console.warn('Lỗi ghi nhận view bài viết:', err);
    return false;
  }
};

