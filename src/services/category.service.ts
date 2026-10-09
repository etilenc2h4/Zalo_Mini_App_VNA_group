import { BASE_CORE_URL, DEPARTMENT_CODE } from './apiConfig';
import { PortalCategory, PortalCategoryChild } from '../types/category';
import { getCached, setCached } from './cache.service';

const CACHE_KEY_ALL = `categories_${DEPARTMENT_CODE}`;
const CACHE_TTL = 30 * 60 * 1000; // 30 phút

export const getAllCategories = async (): Promise<PortalCategory[]> => {
  const cached = getCached<PortalCategory[]>(CACHE_KEY_ALL);
  if (cached) return cached;

  const res = await fetch(`${BASE_CORE_URL}/category/all/${DEPARTMENT_CODE}`);
  if (!res.ok) {
    throw new Error(`API Category Error: ${res.status}`);
  }

  const json = await res.json();
  const list = json?.data || [];

  const categories: PortalCategory[] = list.map((c: any) => ({
    id: c.id,
    tenantCode: c.tenantCode,
    departmentCode: c.departmentCode,
    name: c.name?.trim() || '',
    slug: c.slug || '',
    level: c.level,
    parentId: c.parentId,
    type: c.type,
    publicRss: c.publicRss,
    rss: c.rss,
    children: (c.children || []).map((child: any) => ({
      id: child.id,
      name: child.name?.trim() || '',
      slug: child.slug || '',
      level: child.level,
      parentId: child.parentId,
      parentName: child.parentName,
      type: child.type,
      children: []
    }))
  }));

  setCached(CACHE_KEY_ALL, categories, CACHE_TTL);
  return categories;
};

export const getCategoryDetail = async (categoryId: string): Promise<PortalCategoryChild> => {
  const cacheKey = `cat_detail_${categoryId}`;
  const cached = getCached<PortalCategoryChild>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${BASE_CORE_URL}/category-public/${categoryId}`);
  if (!res.ok) {
    throw new Error(`API Category Detail Error: ${res.status}`);
  }

  const json = await res.json();
  const d = json?.data;
  const detail: PortalCategoryChild = {
    id: d?.id,
    name: d?.name?.trim() || '',
    slug: d?.slug || '',
    level: d?.level || 0,
    parentId: d?.parentId,
    parentName: d?.parentName,
    type: d?.type,
    children: d?.children || []
  };

  setCached(cacheKey, detail, CACHE_TTL);
  return detail;
};

