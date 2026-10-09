import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  Globe2,
  Calendar,
  Phone
} from 'lucide-react';
import {
  Destination,
  Specialty,
  Stay,
  LocalShortcutItem,
  FeaturePortfolioItem,
  LivePortalPost,
  PortalBanner,
  PortalConfiguration,
  TravelLocation
} from '../types';
import { LocalShortcuts } from '../components/LocalShortcuts';
import { SpecialtyFeatures } from '../components/SpecialtyFeatures';
import { TabKey } from '../components/BottomNavigation';
import { makePhoneCall, getUserLocation } from '../services/zalo';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { HomeHeroBanner } from '../components/home/HomeHeroBanner';
import { WeatherWidget } from '../components/home/WeatherWidget';
import { NearbyRadarSection } from '../components/home/NearbyRadarSection';
import { FeaturedPostsSection } from '../components/home/FeaturedPostsSection';
import { t } from '../services/translate.service';

interface HomeTabProps {
  destinations: Destination[];
  specialties: Specialty[];
  stays: Stay[];
  savedIds: string[];
  posts: LivePortalPost[];
  banners?: PortalBanner[];
  portalConfig?: PortalConfiguration | null;
  travelLocations?: TravelLocation[];
  isLoadingPosts: boolean;
  postError: string | null;
  onRetryPosts?: () => void;
  onToggleSave: (id: string, e?: React.MouseEvent) => void;
  onSelectDestination: (item: Destination) => void;
  onChangeTab: (tab: TabKey) => void;
  onSelectCategoryFilter: (category: string) => void;
  onOpenVRNode: (nodeId: string) => void;
  onOpenBlog: (post: LivePortalPost) => void;
  onOpenGallery: () => void;
  language?: 'vi' | 'en';
}

export const HomeTab: React.FC<HomeTabProps> = ({
  destinations,
  specialties,
  stays,
  savedIds,
  posts,
  banners,
  portalConfig,
  travelLocations = [],
  isLoadingPosts,
  postError,
  onRetryPosts,
  onToggleSave,
  onSelectDestination,
  onChangeTab,
  onSelectCategoryFilter,
  onOpenVRNode,
  onOpenBlog,
  onOpenGallery,
  language = 'vi'
}) => {
  const [selectedPostCategory, setSelectedPostCategory] = useState<string>('all');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [cachedCoords, setCachedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocationActive, setIsLocationActive] = useState<boolean>(false);
  const [wasEverEnabled, setWasEverEnabled] = useState<boolean>(false);
  const [showNearbyList, setShowNearbyList] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Tự động kiểm tra quyền vị trí từ trình duyệt / thiết bị khi load trang
  useEffect(() => {
    let isMounted = true;
    const userDisabled = localStorage.getItem('daksong_location_disabled') === 'true';

    if (userDisabled) {
      setWasEverEnabled(true);
      setIsLocationActive(false);
      return;
    }

    getUserLocation().then((loc) => {
      if (!isMounted) return;
      if (loc) {
        setUserCoords(loc);
        setCachedCoords(loc);
        setIsLocationActive(true);
        setWasEverEnabled(true);
        setShowNearbyList(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleLocation = async () => {
    if (isLocationActive) {
      setIsLocationActive(false);
      setShowNearbyList(false);
      localStorage.setItem('daksong_location_disabled', 'true');
      return;
    }

    localStorage.removeItem('daksong_location_disabled');

    if (cachedCoords) {
      setUserCoords(cachedCoords);
      setIsLocationActive(true);
      setShowNearbyList(true);
      return;
    }

    setIsLocating(true);
    const loc = await getUserLocation();
    if (loc) {
      setUserCoords(loc);
      setCachedCoords(loc);
      setIsLocationActive(true);
      setWasEverEnabled(true);
      setShowNearbyList(true);
    }
    setIsLocating(false);
  };

  const nearbyLocations = React.useMemo(() => {
    if (!isLocationActive || !userCoords || !travelLocations || travelLocations.length === 0) return [];
    return travelLocations
      .filter((loc) => loc.lat && loc.lng)
      .map((loc) => {
        const dist = calculateDistanceKm(userCoords.latitude, userCoords.longitude, loc.lat!, loc.lng!);
        return { ...loc, distanceKm: dist, formattedDistance: formatDistance(dist) };
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
      .slice(0, 5);
  }, [isLocationActive, userCoords, travelLocations]);

  const handleShortcutClick = (sc: LocalShortcutItem) => {
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter(sc.categoryKey);
    }
    onChangeTab('explore');
  };

  const handleFeatureClick = (feat: FeaturePortfolioItem) => {
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter(feat.linkCategory);
    }
    onChangeTab('explore');
  };

  const availableCategories = React.useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => {
      if (p.categoryName) cats.add(p.categoryName.trim());
    });
    return ['all', ...Array.from(cats)];
  }, [posts]);

  return (
    <div className="space-y-5 pb-24">
      {/* 1. Official 360 Panorama Live Banner */}
      <HomeHeroBanner
        banners={banners}
        language={language}
        onOpenVR360={() => onChangeTab('vr360')}
      />

      {/* 2. Thời Tiết & Khí Hậu Địa Phương Đắk Song (Dữ liệu thời gian thực từ trạm khí tượng WMO) */}
      <WeatherWidget language={language} userCoords={userCoords} />

      {/* 3. Tiện ích GPS Khám Phá Gần Tôi */}
      <NearbyRadarSection
        isLocationActive={isLocationActive}
        wasEverEnabled={wasEverEnabled}
        isLocating={isLocating}
        userCoords={userCoords}
        showNearbyList={showNearbyList}
        nearbyLocations={nearbyLocations}
        language={language}
        onToggleLocation={handleToggleLocation}
        onToggleShowList={() => setShowNearbyList((prev) => !prev)}
        onSelectDestination={onSelectDestination}
      />

      {/* 3. Lưới 9 Phím Tắt "Thông Tin Địa Phương" */}
      <div className="px-3.5">
        <LocalShortcuts onSelectShortcut={handleShortcutClick} language={language} />
      </div>

      {/* 4. Khối 4 Card Lớn "Đặc Trưng Địa Phương" */}
      <div className="px-3.5">
        <SpecialtyFeatures onSelectFeature={handleFeatureClick} language={language} />
      </div>

      {/* 5. Banner VIP Số Hóa Du Lịch VR 360° */}
      <div className="px-3.5">
        <div
          onClick={() => onChangeTab('vr360')}
          className="relative rounded-3xl overflow-hidden shadow-md cursor-pointer border border-amber-300/40 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-4 group active:scale-[0.98] transition-all"
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1 max-w-[70%]">
              <span className="inline-flex items-center space-x-1 bg-[#ff9600]/30 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                <Globe2 className="w-3 h-3 text-[#ff9600]" />
                <span>{language === 'en' ? 'Digitized 65+ 3D Landscapes' : 'Số Hóa 65+ Cảnh Quan 3D'}</span>
              </span>
              <h3 className="font-extrabold text-white text-base leading-snug">
                {language === 'en' ? (
                  <>Virtual Reality System <span className="text-[#ff9600]">VR 360°</span></>
                ) : (
                  <>Hệ Thống Thực Tế Ảo <span className="text-[#ff9600]">VR 360°</span></>
                )}
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                {language === 'en'
                  ? 'Panoramic view of wind farms, Luu Ly waterfall, and zen monasteries from above.'
                  : 'Ngắm toàn cảnh cánh đồng điện gió, thác Lưu Ly và thiền viện từ trên cao.'}
              </p>
            </div>
            <button className="px-3.5 py-2 rounded-2xl bg-[#ff9600] hover:bg-[#e68400] text-white font-black text-xs shadow-md shadow-orange-500/30 flex items-center shrink-0 group-hover:scale-105 transition-all">
              <span>{language === 'en' ? 'Open VR' : 'Mở VR'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Danh Mục Bài Viết & Tin Tức Trực Tuyến Live API */}
      <FeaturedPostsSection
        posts={posts}
        isLoadingPosts={isLoadingPosts}
        postError={postError}
        selectedPostCategory={selectedPostCategory}
        availableCategories={availableCategories}
        language={language}
        onSelectCategory={setSelectedPostCategory}
        onRetryPosts={onRetryPosts}
        onOpenBlog={onOpenBlog}
        onExploreMore={() => onChangeTab('explore')}
        savedIds={savedIds}
        onToggleSave={onToggleSave}
      />

      {/* 7. Footer Cổng Thông Tin Chính Thức */}
      <div className="px-3.5 pt-4">
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-center space-y-2">
          <p className="text-xs font-bold text-stone-700">
            {language === 'en' ? 'Dak Song District People’s Committee' : 'Ủy Ban Nhân Dân Huyện Đắk Song'}
          </p>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            {language === 'en' 
              ? 'Official Tourism & Culture Portal - Digitized with 3D VR Panorama'
              : 'Cổng Thông Tin Du Lịch & Văn Hóa Chính Thức - Số Hóa VR 360° Toàn Cảnh'}
          </p>
          <div className="flex items-center justify-center space-x-3 pt-1 text-[11px] text-stone-600 font-medium">
            <button 
              onClick={() => makePhoneCall('02613781122')}
              className="flex items-center hover:text-[#ff9600]"
            >
              <Phone className="w-3 h-3 mr-1 text-[#ff9600]" />
              0261 378 1122
            </button>
            <span>•</span>
            <span className="text-stone-400">dulichdaksong.vnasw.vn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
