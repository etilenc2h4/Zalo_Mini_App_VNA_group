import React from 'react';
import { MapPin, Info, Phone, Navigation } from 'lucide-react';
import { TravelLocation } from '../../types/travel';
import { getCategoryDisplayInfo } from '../../utils/categoryMeta';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { openExternalUrl, openGoogleMaps, makePhoneCall } from '../../services/zalo';
import { t } from '../../services/translate.service';

interface MapLocationsListProps {
  sortedLocations: TravelLocation[];
  selectedLocationId?: string;
  userCoords: { latitude: number; longitude: number } | null;
  language: 'vi' | 'en';
  onOpenDetail: (loc: TravelLocation) => void;
}

export const MapLocationsList: React.FC<MapLocationsListProps> = ({
  sortedLocations,
  selectedLocationId,
  userCoords,
  language,
  onOpenDetail
}) => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center">
          <MapPin className="w-3.5 h-3.5 text-[#ff9600] mr-1" />
          {userCoords 
            ? (language === 'en' ? 'Destinations sorted by distance' : 'Địa điểm xếp theo khoảng cách gần bạn') 
            : (language === 'en' ? 'All destinations' : 'Danh sách tất cả địa điểm')} ({sortedLocations.length})
        </span>

        {userCoords && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {language === 'en' ? 'GPS Active' : 'GPS Đang Bật'}
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {sortedLocations.map((loc) => {
          const isCurrent = selectedLocationId === loc.id;
          const meta = getCategoryDisplayInfo(loc.travelCategoryIcon || '', loc.name + ' ' + (loc.content || ''));
          const CatIcon = meta.icon;

          let distText: string | null = null;
          if (userCoords && loc.lat && loc.lng) {
            const d = calculateDistanceKm(userCoords.latitude, userCoords.longitude, loc.lat, loc.lng);
            distText = formatDistance(d);
          }

          return (
            <div
              key={loc.id}
              onClick={() => onOpenDetail(loc)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex space-x-3 items-center group active:scale-[0.99] ${
                isCurrent
                  ? 'bg-orange-50/70 border-[#ff9600] ring-2 ring-orange-400/20 shadow-md'
                  : 'bg-white border-stone-200/80 hover:border-orange-300 shadow-sm'
              }`}
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                <img
                  src={loc.imageUrl}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                {/* Icon loại hình trên ảnh */}
                <div className="absolute top-1 left-1 p-1 rounded-lg bg-black/60 backdrop-blur-sm text-white">
                  <CatIcon className="w-3 h-3 text-[#ff9600]" />
                </div>

                {isCurrent && (
                  <div className="absolute inset-0 bg-[#ff9600]/20 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-[#ff9600] rounded-full ring-2 ring-white" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center ${meta.colorClass}`}>
                    <CatIcon className="w-2.5 h-2.5 mr-1" />
                    <span>{t(meta.label, language)}</span>
                  </span>
                  {distText && (
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      {language === 'en' ? `${distText} away` : `Cách bạn ${distText}`}
                    </span>
                  )}
                </div>

                <h4 className={`font-bold text-xs truncate transition-colors ${
                  isCurrent ? 'text-[#ff9600] font-black' : 'text-stone-900 group-hover:text-[#ff9600]'
                }`}>
                  {t(loc.name, language)}
                </h4>

                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {loc.address ? t(loc.address, language) : (language === 'en' ? 'Dak Song, Dak Nong' : 'Đắk Song, Đắk Nông')}
                </p>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail(loc);
                  }}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95"
                  title={language === 'en' ? 'View full details' : 'Xem chi tiết đầy đủ'}
                >
                  <Info className="w-3.5 h-3.5 text-stone-600" />
                </button>

                {loc.phone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      makePhoneCall(loc.phone!);
                    }}
                    className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ff9600] active:scale-95"
                    title={language === 'en' ? `Call: ${loc.phone}` : `Gọi: ${loc.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#ff9600]" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (loc.link && loc.link.startsWith('http')) {
                      openExternalUrl(loc.link);
                    } else {
                      openGoogleMaps(loc.name, loc.lat || undefined, loc.lng || undefined, loc.address || undefined);
                    }
                  }}
                  className="p-2 rounded-xl bg-[#ff9600] hover:bg-[#e68400] text-white active:scale-95 shadow-sm"
                  title={language === 'en' ? 'Google Maps Directions' : 'Chỉ đường Google Maps'}
                >
                  <Navigation className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

