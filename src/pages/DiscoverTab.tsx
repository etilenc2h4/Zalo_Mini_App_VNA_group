import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  MapPin,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { PortalCategory } from '../../src/types/category';
import { TravelCategory, TravelLocation } from '../types/travel';
import { PortalPostItem } from '../types/post';
import { getAllCategories } from '../services/category.service';
import { getAllTravelCategoriesAndLocations } from '../services/travel.service';
import { getAllPosts } from '../services/post.service';
import { getUserLocation } from '../services/zalo';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { t, translateDatasetPosts, translateDatasetTravelLocations } from '../services/translate.service';
import { normalizeCategoryKey, isMatchCategory } from '../utils/categoryMatcher';
import { DiscoverPostCard } from '../components/discover/DiscoverPostCard';
import { DiscoverLocationCard } from '../components/discover/DiscoverLocationCard';

interface DiscoverTabProps {
  initialCategory?: string;
  onOpenBlog: (post: PortalPostItem) => void;
  onOpenVRNode: (nodeId: string) => void;
  onSelectLocation?: (loc: TravelLocation) => void;
  onChangeTab?: (tab: string) => void;
  language?: 'vi' | 'en';
  posts?: PortalPostItem[];
  travelLocations?: TravelLocation[];
  savedIds?: string[];
  onToggleSave?: (id: string, e?: React.MouseEvent) => void;
}

export const DiscoverTab: React.FC<DiscoverTabProps> = ({
  initialCategory = 'all',
  onOpenBlog,
  onOpenVRNode,
  onSelectLocation,
  onChangeTab,
  language = 'vi',
  posts,
  travelLocations,
  savedIds = [],
  onToggleSave
}) => {
  const [categories, setCategories] = useState<PortalCategory[]>([]);
  const [travelCategories, setTravelCategories] = useState<TravelCategory[]>([]);
  const [allPosts, setAllPosts] = useState<PortalPostItem[]>(posts || []);
  const [allLocations, setAllLocations] = useState<TravelLocation[]>(travelLocations || []);

  // Đồng bộ bài viết và địa điểm khi prop từ App.tsx thay đổi
  useEffect(() => {
    if (posts && posts.length > 0) {
      setAllPosts(posts);
    }
  }, [posts]);

  useEffect(() => {
    if (travelLocations && travelLocations.length > 0) {
      setAllLocations(travelLocations);
    }
  }, [travelLocations]);

  // Filter & Search states
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>(normalizeCategoryKey(initialCategory || 'all'));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!posts || posts.length === 0);
  const { ref: scrollRef, events: scrollEvents, isDragging, hasMoved } = useDraggableScroll();

  useEffect(() => {
    if (initialCategory) {
      setSelectedMainCategory(normalizeCategoryKey(initialCategory));
    }
  }, [initialCategory]);

  // Tự động cuộn thanh danh mục đến nút đang được chọn để người dùng thấy ngay
  useEffect(() => {
    if (selectedMainCategory) {
      const activeEl = document.getElementById(`cat-pill-${selectedMainCategory}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedMainCategory]);

  useEffect(() => {
    let isMounted = true;

    // Chỉ fetch lại bài viết và địa điểm nếu component chưa nhận được từ props cha
    const shouldFetchPosts = !posts || posts.length === 0;
    const shouldFetchLocs = !travelLocations || travelLocations.length === 0;

    const promises: Promise<any>[] = [getAllCategories()];
    if (shouldFetchLocs) promises.push(getAllTravelCategoriesAndLocations());
    if (shouldFetchPosts) promises.push(getAllPosts());

    Promise.allSettled(promises).then(([catRes, locsOrPostRes, postRes]) => {
      if (!isMounted) return;

      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value);
      }

      if (shouldFetchLocs && locsOrPostRes && locsOrPostRes.status === 'fulfilled') {
        const val = locsOrPostRes.value as TravelCategory[];
        setTravelCategories(val);
        const locs: TravelLocation[] = [];
        val.forEach((c) => {
          c.travelLocations?.forEach((loc) => {
            if (!locs.some((existing) => existing.id === loc.id)) {
              locs.push(loc);
            }
          });
        });
        if (language === 'en') {
          translateDatasetTravelLocations(locs, 'en').then((res) => {
            if (isMounted) setAllLocations(res);
          });
        } else {
          setAllLocations(locs);
        }
      }

      const postResult = shouldFetchLocs ? postRes : locsOrPostRes;
      if (shouldFetchPosts && postResult && postResult.status === 'fulfilled') {
        const pVal = postResult.value as PortalPostItem[];
        if (language === 'en') {
          translateDatasetPosts(pVal, 'en').then((res) => {
            if (isMounted) setAllPosts(res);
          });
        } else {
          setAllPosts(pVal);
        }
      }

      setIsLoading(false);
    });

    getUserLocation().then((loc) => {
      if (isMounted && loc) setUserCoords(loc);
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  // Danh sách các danh mục hiển thị trên thanh lọc duy nhất
  const categoryFilters = React.useMemo(() => {
    return [
      { key: 'all', label: language === 'en' ? 'All' : 'Tất cả' },
      { key: 'culture', label: language === 'en' ? 'Festivals & Events' : 'Sự kiện - Lễ hội' },
      { key: 'nature', label: language === 'en' ? 'Attractions' : 'Thắng cảnh' },
      { key: 'history', label: language === 'en' ? 'Historical Relics' : 'Di tích lịch sử' },
      { key: 'food', label: language === 'en' ? 'Food & Dining' : 'Ẩm thực - Quán ăn' },
      { key: 'specialties', label: language === 'en' ? 'Specialties' : 'Đặc sản địa phương' },
      { key: 'stays', label: language === 'en' ? 'Accommodations' : 'Cơ sở lưu trú' },
      { key: 'checkin', label: language === 'en' ? 'Entertainment' : 'Địa điểm giải trí' },
      { key: 'admin', label: language === 'en' ? 'Administration' : 'Hành chính' },
      { key: 'services', label: language === 'en' ? 'Services' : 'Dịch vụ & Tiện ích' }
    ];
  }, [language]);

  // Nguồn dữ liệu ưu tiên: lấy từ prop nếu có, nếu không thì lấy từ state nội bộ
  const sourcePosts = React.useMemo(() => {
    return (posts && posts.length > 0) ? posts : allPosts;
  }, [posts, allPosts]);

  const sourceLocations = React.useMemo(() => {
    return (travelLocations && travelLocations.length > 0) ? travelLocations : allLocations;
  }, [travelLocations, allLocations]);

  // Lọc bài viết
  const filteredPosts = React.useMemo(() => {
    return sourcePosts.filter((p) => {
      const matchCat = isMatchCategory(p.categoryName, p.quote + ' ' + p.name, selectedMainCategory);
      const matchSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.quote.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [sourcePosts, selectedMainCategory, searchQuery]);

  // Lọc địa điểm du lịch
  const filteredLocations = React.useMemo(() => {
    return sourceLocations.filter((loc) => {
      const catObj = travelCategories.find((c) => c.id === loc.travelCategoryId);
      const catName = catObj ? catObj.name : '';
      const matchCat = isMatchCategory(
        (loc.travelCategoryIcon || '') + ' ' + catName,
        loc.name + ' ' + (loc.address || '') + ' ' + (loc.content || ''),
        selectedMainCategory
      );
      const matchSearch =
        searchQuery.trim() === '' ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [sourceLocations, travelCategories, selectedMainCategory, searchQuery]);

  return (
    <div className="space-y-4 pb-24 px-3.5 pt-3">
      {/* Tiêu đề Khám Phá */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center">
            <span className="w-2 h-5 bg-[#ff9600] rounded-full inline-block mr-2" />
            {language === 'en' ? 'Explore Dak Song' : 'Khám Phá Đắk Song'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {language === 'en' ? 'Relics, nature, culinary & local culture' : 'Di tích, thắng cảnh, ẩm thực & văn hóa địa phương'}
          </p>
        </div>

        <button
          onClick={() => onChangeTab && onChangeTab('vr360')}
          className="px-3 py-1.5 rounded-xl bg-stone-900 text-[#ff9600] border border-orange-500/30 text-xs font-bold flex items-center shadow-sm active:scale-95 transition-all"
        >
          <Compass className="w-3.5 h-3.5 mr-1" />
          3D VR
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'en' ? 'Search festivals, attractions, food, locations...' : 'Tìm kiếm lễ hội, thắng cảnh, món ngon, địa điểm...'}
          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#ff9600] shadow-sm"
        />
      </div>

      {/* Thanh danh mục cuộn ngang DUY NHẤT */}
      <div 
        ref={scrollRef}
        {...scrollEvents}
        className={`flex space-x-1.5 overflow-x-auto no-scrollbar py-1 select-none cursor-grab active:cursor-grabbing ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}
      >
        {categoryFilters.map((cat) => {
          const isSelected = selectedMainCategory === cat.key;
          return (
            <button
              key={cat.key}
              id={`cat-pill-${cat.key}`}
              onClick={() => {
                if (!hasMoved) {
                  setSelectedMainCategory(cat.key);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center shrink-0 ${
                isSelected
                  ? 'bg-[#ff9600] text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-stone-600 border border-stone-200/90 hover:bg-stone-50'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Trạng thái Loading */}
      {isLoading && (
        <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-6 text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#ff9600] border-t-transparent" />
          <p className="text-xs font-semibold text-stone-700">
            {t('Đang tải danh mục khám phá từ máy chủ Đắk Song...', language)}
          </p>
        </div>
      )}

      {/* PHẦN 1: BÀI VIẾT & CẨM NANG VĂN HÓA */}
      {!isLoading && filteredPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center">
              <BookOpen className="w-3.5 h-3.5 text-[#ff9600] mr-1" />
              {language === 'en' ? 'Articles & Travel Guides' : 'Bài viết & Cẩm nang'} ({filteredPosts.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredPosts.map((post) => (
              <DiscoverPostCard
                key={post.id}
                post={post}
                language={language}
                onOpenBlog={onOpenBlog}
                isSaved={savedIds.includes(post.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </div>
      )}

      {/* PHẦN 2: ĐIỂM DU LỊCH & DỊCH VỤ */}
      {!isLoading && filteredLocations.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center">
              <MapPin className="w-3.5 h-3.5 text-[#ff9600] mr-1" />
              {language === 'en' ? 'Destinations & Services' : 'Điểm du lịch & dịch vụ'} ({filteredLocations.length})
            </span>
            <button
              onClick={() => onChangeTab && onChangeTab('map')}
              className="text-[11px] font-bold text-[#ff9600] flex items-center hover:underline"
            >
              {language === 'en' ? 'View on map' : 'Xem trên bản đồ'} <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredLocations.map((loc) => (
              <DiscoverLocationCard
                key={loc.id}
                loc={loc}
                userCoords={userCoords}
                language={language}
                onSelectLocation={onSelectLocation}
                isSaved={savedIds.includes(loc.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trạng thái trống */}
      {!isLoading && filteredLocations.length === 0 && filteredPosts.length === 0 && (
        <div className="bg-stone-50 rounded-2xl p-8 text-center space-y-2">
          <p className="text-xs font-bold text-stone-700">
            {t('Không tìm thấy nội dung phù hợp', language)}
          </p>
          <p className="text-[11px] text-stone-500">
            {t('Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác', language)}
          </p>
        </div>
      )}
    </div>
  );
};
