// Re-export tất cả API services phục vụ tương thích
export * from './apiConfig';
export * from './configuration.service';
export * from './category.service';
export * from './banner.service';
export * from './post.service';
export * from './travel.service';
export * from './media.service';
export * from './tenant.service';

import { getAllPosts, getPostDetail } from './post.service';
import { getConfiguration } from './configuration.service';
import { getAllBanners } from './banner.service';
import { getAllCategories } from './category.service';

export const getAllPortalPosts = getAllPosts;
export const getLivePosts = getAllPosts;
export const getLivePostDetail = getPostDetail;
export const getPortalConfiguration = getConfiguration;
export const getPortalBanners = getAllBanners;
export const getPortalCategories = getAllCategories;
