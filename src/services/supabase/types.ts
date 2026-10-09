/**
 * Định nghĩa Type/Interface cho cơ sở dữ liệu Supabase
 */

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  last_login_at?: string;
  created_at?: string;
}

export interface UserFavorite {
  id?: number;
  user_id: string;
  destination_id: string;
  title?: string;
  image?: string | null;
  address?: string;
  category_label?: string;
  target_type?: 'destination' | 'travel_location' | 'post' | 'stay' | 'specialty' | string;
  extra_data?: Record<string, any>;
  created_at?: string;
}

export interface ItineraryStop {
  time: string;
  title: string;
  location: string;
  destId?: string;
  vrNodeId?: string;
  desc: string;
  tip?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export interface UserItinerary {
  id: string;
  user_id: string;
  title: string;
  start_date?: string | null;
  days: any[];
  reminder_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}
