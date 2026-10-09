export interface PortalCategoryChild {
  id: string;
  parentId: string | null;
  parentName?: string | null;
  name: string;
  level: number;
  slug: string;
  type?: string;
  publicRss?: boolean;
  rss?: string | null;
  rssInfo?: any;
  rssDelayMinute?: number | null;
  synchronized?: boolean;
  children?: PortalCategoryChild[];
  createdDate?: string;
}

export interface PortalCategory {
  id: string;
  tenantCode?: string;
  departmentCode?: string;
  parentId: string | null;
  name: string;
  level: number;
  slug: string;
  type?: string;
  publicRss?: boolean;
  rss?: string | null;
  rssInfo?: any;
  rssDelayMinute?: number | null;
  synchronized?: boolean;
  children: PortalCategoryChild[];
  createdDate?: string;
}

