import React from 'react';
import { Phone, Navigation, Heart } from 'lucide-react';
import { TravelLocation } from '../../types/travel';
import { getCategoryDisplayInfo } from '../../utils/categoryMeta';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { openExternalUrl, openGoogleMaps, makePhoneCall } from '../../services/zalo';
import { recordTravelLocationView } from '../../services/travel.service';
import { t } from '../../services/translate.service';

interface DiscoverLocationCardProps {
  loc: TravelLocation;
  userCoords: { latitude: number; longitude: number } | null;
  language?: 'vi' | 'en';
  onSelectLocation?: (loc: TravelLocation) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string, e?: React.MouseEvent) => void;
}

export const DiscoverLocationCard: React.FC<DiscoverLocationCardProps> = ({
  loc,
  userCoords,
  language = 'vi',
  onSelectLocation,
  isSaved = false,
  onToggleSave
}) => {
  const meta = getCategoryDisplayInfo(loc.travelCategoryIcon || '', loc.name + ' ' + (loc.content || ''));
  const CatIcon = meta.icon;

  let distText: string | null = null;
  if (userCoords && loc.lat && loc.lng) {
    const d = calculateDistanceKm(userCoords.latitude, userCoords.longitude, loc.lat, loc.lng);
    distText = formatDistance(d);
  }

  return (
    <div
      onClick={() => {
        recordTravelLocationView(loc);
        if (onSelectLocation) onSelectLocation(loc);
      }}
      className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-sm flex space-x-3 items-center group cursor-pointer hover:border-orange-300 transition-all active:scale-[0.99] relative"
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100">
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

        {/* Nút lưu yêu thích trên ảnh */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(loc.id, e);
            }}
            className={`absolute bottom-1 right-1 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isSaved
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
                : 'bg-black/50 text-white/80 hover:text-white'
            }`}
            title={isSaved ? (language === 'en' ? 'Unsave' : 'Bỏ lưu') : (language === 'en' ? 'Save' : 'Lưu')}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center ${meta.colorClass}`}>
            <CatIcon className="w-2.5 h-2.5 mr-1" />
            <span>{t(meta.label, language)}</span>
          </span>
          {distText && (
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              {language === 'en' ? `${distText} away` : `Cách bạn ${distText}`}
            </span>
          )}
        </div>

        <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#ff9600] transition-colors">
          {t(loc.name, language)}
        </h4>

        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
          {loc.address ? t(loc.address, language) : (language === 'en' ? 'Dak Song, Dak Nong' : 'Đắk Song, Đắk Nông')}
        </p>

        <div className="mt-2 flex items-center space-x-2">
          {loc.phone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                makePhoneCall(loc.phone!);
              }}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold flex items-center"
            >
              <Phone className="w-3 h-3 mr-1 text-[#ff9600]" />
              {loc.phone}
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
            className="px-2 py-1 bg-[#ff9600] text-white rounded-lg text-[10px] font-bold flex items-center shadow-sm active:scale-95 transition-all"
          >
            <Navigation className="w-3 h-3 mr-1 fill-current" />
            {language === 'en' ? 'Directions' : 'Chỉ đường'}
          </button>
        </div>
      </div>
    </div>
  );
};
