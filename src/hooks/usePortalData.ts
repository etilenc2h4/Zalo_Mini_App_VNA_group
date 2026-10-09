import { useState, useEffect } from 'react';
import { DESTINATIONS, SPECIALTIES, STAYS } from '../data/mockData';
import { Destination, LivePortalPost, PortalBanner, PortalConfiguration, PortalCategory, TravelLocation, Specialty, Stay } from '../types';
import { getAllPortalPosts, getPortalConfiguration, getPortalBanners, getPortalCategories } from '../services/portalApi';
import { getAllTravelLocations } from '../services/travel.service';
import { 
  translateDatasetPosts,
  translateDatasetTravelLocations,
  translateDatasetDestinations,
  translateDatasetSpecialties,
  translateDatasetStays
} from '../services/translate.service';

export const usePortalData = (language: 'vi' | 'en') => {
  // Dữ liệu thời gian thực từ hệ thống máy chủ core-360.vnaapi.com (100% Real API)
  const [posts, setPosts] = useState<LivePortalPost[]>([]);
  const [banners, setBanners] = useState<PortalBanner[]>([]);
  const [portalConfig, setPortalConfig] = useState<PortalConfiguration | null>(null);
  const [categories, setCategories] = useState<PortalCategory[]>([]);
  const [travelLocations, setTravelLocations] = useState<TravelLocation[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [postError, setPostError] = useState<string | null>(null);

  // Dữ liệu hiển thị (Tự động dịch sang Tiếng Anh khi language === 'en' và gắn ngược lại toàn app)
  const [displayPosts, setDisplayPosts] = useState<LivePortalPost[]>([]);
  const [displayTravelLocations, setDisplayTravelLocations] = useState<TravelLocation[]>([]);
  const [displayDestinations, setDisplayDestinations] = useState<Destination[]>(DESTINATIONS);
  const [displaySpecialties, setDisplaySpecialties] = useState<Specialty[]>(SPECIALTIES);
  const [displayStays, setDisplayStays] = useState<Stay[]>(STAYS);

  // Gọi đồng thời tất cả các endpoint live từ hệ thống backend Cổng Du Lịch Đắk Song
  const fetchPortalData = async () => {
    setIsLoadingPosts(true);
    setPostError(null);

    // Chạy song song cả 5 endpoints
    const [postsRes, configRes, bannersRes, catRes, locsRes] = await Promise.allSettled([
      getAllPortalPosts(),
      getPortalConfiguration(),
      getPortalBanners(),
      getPortalCategories(),
      getAllTravelLocations()
    ]);

    if (postsRes.status === 'fulfilled') {
      setPosts(postsRes.value);
    } else {
      console.error('Lỗi API bài viết:', postsRes.reason);
      setPostError(postsRes.reason?.message || 'Không thể kết nối đến máy chủ.');
    }

    if (configRes.status === 'fulfilled') {
      setPortalConfig(configRes.value);
    } else {
      console.warn('Lỗi API config:', configRes.reason);
    }

    if (bannersRes.status === 'fulfilled') {
      setBanners(bannersRes.value);
    } else {
      console.warn('Lỗi API banners:', bannersRes.reason);
    }

    if (catRes.status === 'fulfilled') {
      setCategories(catRes.value);
    } else {
      console.warn('Lỗi API categories:', catRes.reason);
    }

    if (locsRes.status === 'fulfilled') {
      setTravelLocations(locsRes.value);
    } else {
      console.warn('Lỗi API travel locations:', locsRes.reason);
    }

    setIsLoadingPosts(false);
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  // Tự động dịch dữ liệu từ API và MockData sang Tiếng Anh khi language === 'en' và gắn ngược lại toàn app
  useEffect(() => {
    let isCancelled = false;

    if (language === 'vi') {
      setDisplayPosts(posts);
      setDisplayTravelLocations(travelLocations);
      setDisplayDestinations(DESTINATIONS);
      setDisplaySpecialties(SPECIALTIES);
      setDisplayStays(STAYS);
    } else {
      // 1. Dịch danh sách bài viết từ API
      if (posts.length > 0) {
        translateDatasetPosts(posts, 'en').then((res) => {
          if (!isCancelled) setDisplayPosts(res);
        });
      } else {
        setDisplayPosts([]);
      }

      // 2. Dịch danh sách địa điểm du lịch từ API
      if (travelLocations.length > 0) {
        translateDatasetTravelLocations(travelLocations, 'en').then((res) => {
          if (!isCancelled) setDisplayTravelLocations(res);
        });
      } else {
        setDisplayTravelLocations([]);
      }

      // 3. Dịch các danh mục Điểm đến, Đặc sản, Lưu trú
      translateDatasetDestinations(DESTINATIONS, 'en').then((res) => {
        if (!isCancelled) setDisplayDestinations(res);
      });

      translateDatasetSpecialties(SPECIALTIES, 'en').then((res) => {
        if (!isCancelled) setDisplaySpecialties(res);
      });

      translateDatasetStays(STAYS, 'en').then((res) => {
        if (!isCancelled) setDisplayStays(res);
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [language, posts, travelLocations]);

  return {
    posts,
    banners,
    portalConfig,
    categories,
    travelLocations,
    isLoadingPosts,
    postError,
    fetchPortalData,
    displayPosts,
    displayTravelLocations,
    displayDestinations,
    displaySpecialties,
    displayStays
  };
};

