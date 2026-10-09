import React from 'react';
import { Search, Crosshair } from 'lucide-react';
import { TravelCategory } from '../../types/travel';
import { useDraggableScroll } from '../../hooks/useDraggableScroll';

interface MapFilterHeaderProps {
  language: 'vi' | 'en';
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userCoords: { latitude: number; longitude: number } | null;
  isLocating: boolean;
  onGetLocation: () => void;
  categories: TravelCategory[];
  allLocationsCount: number;
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
}

const MAP_CAT_TRANSLATIONS: Record<string, string> = {
  'Ăn Uống': 'Dining',
  'Ăn uống': 'Dining',
  'Cây giống': 'Seedlings',
  'Địa điểm du lịch': 'Attractions',
  'Lưu trú': 'Stays',
  'Đặc sản': 'Specialties',
  'Danh lam thắng cảnh': 'Scenic Spots',
  'Di tích': 'Historical Relics',
  'Vui chơi': 'Entertainment',
  'Hành chính': 'Administration'
};

export const MapFilterHeader: React.FC<MapFilterHeaderProps> = ({
  language,
  searchQuery,
  onSearchChange,
  userCoords,
  isLocating,
  onGetLocation,
  categories,
  allLocationsCount,
  selectedCategoryId,
  onSelectCategory
}) => {
  const {
    ref: mapCatScrollRef,
    events: mapCatScrollEvents,
    isDragging: isMapDragging,
    hasMoved: hasMapMoved
  } = useDraggableScroll();

  return (
    <div className="space-y-3">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center">
            <span className="w-2 h-5 bg-[#ff9600] rounded-full inline-block mr-2" />
            {language === 'en' ? 'Dak Song Digital Map' : 'Bản Đồ Số Du Lịch Đắk Song'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {language === 'en' ? 'Live GPS data from Official Tourism Portal' : 'Dữ liệu GPS thật từ hệ thống Cổng Du Lịch Huyện'}
          </p>
        </div>

        <button
          onClick={onGetLocation}
          disabled={isLocating}
          className="p-2.5 rounded-2xl bg-orange-50 text-[#ff9600] border border-orange-200 active:scale-95 transition-all shadow-sm flex items-center text-xs font-bold"
          title={language === 'en' ? 'Locate my position' : 'Định vị vị trí của tôi'}
        >
          <Crosshair className={`w-4 h-4 mr-1 ${isLocating ? 'animate-spin' : ''}`} />
          {userCoords 
            ? (language === 'en' ? 'Located' : 'Đã định vị') 
            : (language === 'en' ? 'Near me' : 'Gần tôi')}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={language === 'en' ? 'Search destinations, restaurants, hotels...' : 'Tìm kiếm điểm du lịch, quán ăn, nhà nghỉ...'}
          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#ff9600] shadow-sm"
        />
      </div>

      {/* Category Pills (Từ Travel Category thật của hệ thống) */}
      <div
        ref={mapCatScrollRef}
        {...mapCatScrollEvents}
        style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}
        className={`flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5 select-none ${
          isMapDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <button
          onClick={() => {
            if (!hasMapMoved) onSelectCategory('all');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategoryId === 'all'
              ? 'bg-[#ff9600] text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {language === 'en' ? 'All' : 'Tất cả'} ({allLocationsCount})
        </button>

        {categories
          .filter((c) => c.travelLocations && c.travelLocations.length > 0)
          .map((cat) => {
            const displayCatName = language === 'en' ? (MAP_CAT_TRANSLATIONS[cat.name] || cat.name) : cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (!hasMapMoved) onSelectCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1 ${
                  selectedCategoryId === cat.id
                    ? 'bg-[#ff9600] text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{displayCatName}</span>
                <span className={`text-[10px] px-1 rounded-full ${selectedCategoryId === cat.id ? 'bg-amber-700/40 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  {cat.travelLocations.length}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};

