export interface PortalPostItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subCategoryIds?: string[] | null;
  categoryName: string;
  quote: string;
  content?: string;
  image?: string | null;
  imageUrl: string;
  files?: any;
  isPublished?: boolean;
  publishedBy?: string | null;
  publishDate: string;
  outstanding?: boolean;
  synchronized?: boolean;
  view: number;
  rateScore?: number;
  rateTotal?: number;
  rating?: number;
  creator: string;
  creatorAvatar?: string | null;
}

export interface PostFindParams {
  pageNumber?: number;
  pageSize?: number;
  categorySlugOrId?: string;
  search?: string;
}

export interface PostFindResponse {
  items: PortalPostItem[];
  total: number;
}

