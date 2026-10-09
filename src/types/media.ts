export interface MediaItem {
  id: string;
  type: string;
  videoCategory?: string | null;
  name: string;
  url: string;
  fullUrl: string;
  isPublished: boolean;
  createdDate: string;
}

