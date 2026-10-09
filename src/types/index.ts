export * from './configuration';
export * from './category';
export * from './banner';
export * from './post';
export * from './travel';
export * from './media';
export * from './tenant';

import { PortalPostItem } from './post';

export type LivePortalPost = PortalPostItem;

export type CategoryType = 'all' | 'nature' | 'windpower' | 'culture' | 'checkin' | 'farmstay' | 'history' | 'admin' | 'services';

export interface VRSceneItem {
  id: string;
  nodeId: string;
  title: string;
  category: string;
  badge?: string;
  thumbnail: string;
  description: string;
}

export interface LocalShortcutItem {
  id: string;
  title: string;
  icon: string;
  categoryKey: string;
  color: string;
  badge?: string;
}

export interface FeaturePortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  linkCategory: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  excerpt: string;
  content: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  location: string;
}

export interface Destination {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  rating: number;
  reviewsCount: number;
  address: string;
  distance: string;
  ticketPrice: string;
  openHours: string;
  image: string;
  gallery: string[];
  description: string;
  highlights: string[];
  tips: string[];
  lat?: number;
  lng?: number;
  featured?: boolean;
  vrNodeId?: string;
  phone?: string;
  googleMapsUrl?: string;
  extra_data?: Record<string, any>;
}

export interface Specialty {
  id: string;
  name: string;
  category: 'ocop' | 'mon-an' | 'qua-tang';
  categoryLabel: string;
  priceRange: string;
  image: string;
  description: string;
  whereToBuy: string;
  hotline?: string;
  badge?: string;
}

export interface Stay {
  id: string;
  name: string;
  type: 'homestay' | 'glamping' | 'hotel' | 'farmstay';
  typeLabel: string;
  pricePerNight: string;
  rating: number;
  address: string;
  phone: string;
  image: string;
  amenities: string[];
  description: string;
}

export interface Tour {
  id: string;
  title: string;
  duration: string;
  suitableFor: string;
  highlights: string[];
  itinerary: {
    time: string;
    activity: string;
    location: string;
  }[];
  priceEstimate: string;
  advice: string;
  image: string;
}

export interface EmergencyContact {
  title: string;
  phone: string;
  desc: string;
  iconName: string;
}
