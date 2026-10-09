export interface TravelLocation {
  id: string;
  travelCategoryId: string;
  travelCategoryIcon?: string | null;
  name: string;
  address?: string | null;
  phone?: string | null;
  image?: string | null;
  imageUrl: string;
  content?: string | null;
  lat: number | null;
  lng: number | null;
  link?: string | null;
  pageId?: string | null;
  isActivated?: boolean;
  distanceKm?: number;
  formattedDistance?: string;
}

export interface TravelCategory {
  id: string;
  name: string;
  icon: string;
  isActivated: boolean;
  travelLocations: TravelLocation[];
}

