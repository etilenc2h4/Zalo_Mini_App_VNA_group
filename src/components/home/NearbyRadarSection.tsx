import React from 'react';
import { Crosshair, EyeOff, Navigation, Sparkles, Phone } from 'lucide-react';
import { TravelLocation } from '../../types/travel';
import { Destination } from '../../types';
import { getCategoryDisplayInfo } from '../../utils/categoryMeta';
import { makePhoneCall, openGoogleMaps } from '../../services/zalo';

interface NearbyRadarSectionProps {
  isLocationActive: boolean;
  wasEverEnabled: boolean;
  isLocating: boolean;
  userCoords: { latitude: number; longitude: number } | null;
  showNearbyList: boolean;
  nearbyLocations: (TravelLocation & { distanceKm?: number; formattedDistance?: string })[];
  language?: 'vi' | 'en';
  onToggleLocation: () => void;
  onToggleShowList: () => void;
  onSelectDestination?: (item: Destination) => void;
}

export const NearbyRadarSection: React.FC<NearbyRadarSectionProps> = ({
  isLocationActive,
  wasEverEnabled,
  isLocating,
  userCoords,
  showNearbyList,
  nearbyLocations,
  language = 'vi',
  onToggleLocation,
  onToggleShowList,
  onSelectDestination
}) => {
  return (
    <div className="px-3.5 space-y-2.5">
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
        <div className="space-y-0.5 max-w-[55%]">
          <div className="flex items-center space-x-1.5 text-[#ff9600] text-xs font-black">
            <Crosshair className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Nearby GPS Explorer' : 'Tiện ích GPS Gần Tôi'}</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-tight">
            {isLocationActive && userCoords
              ? (language === 'en' 
                  ? `Located: ${userCoords.latitude.toFixed(3)}, ${userCoords.longitude.toFixed(3)}`
                  : `Đã định vị: ${userCoords.latitude.toFixed(3)}, ${userCoords.longitude.toFixed(3)}`)
              : wasEverEnabled
              ? (language === 'en' ? 'GPS disabled' : 'Đã tắt định vị GPS')
              : (language === 'en' 
                  ? 'Find spots, waterfalls & wind farms nearest to you' 
                  : 'Tìm danh lam, thác nước & đồi gió cách bạn gần nhất')}
          </p>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Nút Bật / Đã bật / Đã tắt vị trí */}
          <button
            onClick={onToggleLocation}
            disabled={isLocating}
            className={`px-3 py-2 rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all flex items-center ${
              isLocationActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : wasEverEnabled
                ? 'bg-stone-500 hover:bg-stone-600 text-white shadow-stone-500/20'
                : 'bg-[#ff9600] hover:bg-[#e68400] text-white shadow-orange-500/20'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 mr-1 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating
              ? (language === 'en' ? 'Locating...' : 'Đang dò...')
              : isLocationActive
              ? (language === 'en' ? 'Enabled' : 'Đã bật')
              : wasEverEnabled
              ? (language === 'en' ? 'Disabled' : 'Đã tắt')
              : (language === 'en' ? 'Enable' : 'Bật vị trí')}
          </button>

          {/* Nút Gần tôi / Ẩn khi vị trí đang được bật */}
          {isLocationActive && (
            <button
              onClick={onToggleShowList}
              className="px-2.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#ff9600] text-xs font-black border border-orange-200 active:scale-95 transition-all flex items-center shadow-sm"
              title={showNearbyList ? (language === 'en' ? 'Hide nearby' : 'Ẩn danh sách gần tôi') : (language === 'en' ? 'Show nearby' : 'Xem danh sách gần tôi')}
            >
              {showNearbyList ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1" />
                  <span>{language === 'en' ? 'Hide' : 'Ẩn'}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 mr-1 fill-current" />
                  <span>{language === 'en' ? 'Nearby' : 'Gần tôi'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Danh sách địa điểm gần tôi khi có GPS và showNearbyList = true */}
      {isLocationActive && showNearbyList && nearbyLocations.length > 0 && (
        <div className="bg-white rounded-2xl p-3 border border-orange-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-800 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-[#ff9600] mr-1" />
              {language === 'en' ? 'Nearest destinations to you:' : 'Địa điểm gần bạn nhất:'}
            </span>
            <button
              onClick={onToggleShowList}
              className="text-[11px] font-bold text-stone-400 hover:text-stone-600 flex items-center py-0.5 px-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              title={language === 'en' ? 'Hide' : 'Đóng danh sách gần tôi'}
            >
              <EyeOff className="w-3.5 h-3.5 mr-1" />
              <span>{language === 'en' ? 'Hide' : 'Ẩn'}</span>
            </button>
          </div>

          <div className="space-y-2 divide-y divide-stone-100">
            {nearbyLocations.map((loc) => {
              const meta = getCategoryDisplayInfo(loc.travelCategoryIcon || '', loc.name);
              const CatIcon = meta.icon;

              return (
                <div key={loc.id} className="pt-2 first:pt-0 flex items-center justify-between">
                  <div 
                    onClick={() => {
                      if (onSelectDestination) {
                        onSelectDestination({
                          id: loc.id,
                          name: loc.name,
                          category: 'nature',
                          categoryLabel: meta.label,
                          rating: 5,
                          reviewsCount: 15,
                          address: loc.address || 'Đắk Song, Đắk Nông',
                          distance: loc.formattedDistance || 'Gần bạn',
                          ticketPrice: 'Miễn phí',
                          openHours: 'Cả ngày',
                          image: loc.imageUrl,
                          gallery: [loc.imageUrl],
                          description: loc.content || loc.name,
                          phone: loc.phone || undefined,
                          lat: loc.lat || undefined,
                          lng: loc.lng || undefined,
                          googleMapsUrl: loc.link || undefined,
                          highlights: ['Điểm đến nổi bật trên Cổng Du Lịch Đắk Song'],
                          tips: ['Nên liên hệ trước khi đến để được phục vụ tốt nhất']
                        });
                      }
                    }}
                    className="min-w-0 flex-1 pr-2 cursor-pointer group/item"
                  >
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border flex items-center shrink-0 ${meta.colorClass}`}>
                        <CatIcon className="w-2.5 h-2.5 mr-0.5" />
                        <span>{meta.label}</span>
                      </span>
                      <span className="font-bold text-stone-900 text-xs truncate group-hover/item:text-[#ff9600] transition-colors">{loc.name}</span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full shrink-0">
                        {loc.formattedDistance}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">{loc.address || 'Đắk Song'}</p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {loc.phone && (
                      <button
                        onClick={() => makePhoneCall(loc.phone!)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] active:scale-95"
                        title={language === 'en' ? 'Call' : 'Gọi điện'}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#ff9600]" />
                      </button>
                    )}
                    <button
                      onClick={() => openGoogleMaps(loc.name, loc.lat || undefined, loc.lng || undefined, loc.address || undefined)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#ff9600] text-white text-[11px] font-bold flex items-center shadow-sm active:scale-95"
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1 fill-current" />
                      {language === 'en' ? 'Directions' : 'Chỉ đường'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

