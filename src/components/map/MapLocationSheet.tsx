import React from 'react';
import { Info, Phone, Navigation, Heart } from 'lucide-react';
import { TravelLocation } from '../../types/travel';
import { getCategoryDisplayInfo } from '../../utils/categoryMeta';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { openExternalUrl, openGoogleMaps, makePhoneCall } from '../../services/zalo';
import { t } from '../../services/translate.service';

interface MapLocationSheetProps {
  selectedLocation: TravelLocation;
  userCoords: { latitude: number; longitude: number } | null;
  language: 'vi' | 'en';
  onOpenDetail: (loc: TravelLocation) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string, e?: React.MouseEvent) => void;
}

export const MapLocationSheet: React.FC<MapLocationSheetProps> = ({
  selectedLocation,
  userCoords,
  language,
  onOpenDetail,
  isSaved = false,
  onToggleSave
}) => {
  const meta = getCategoryDisplayInfo(selectedLocation.travelCategoryIcon || '', selectedLocation.name);
  const CatIcon = meta.icon;

  return (
    <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm space-y-3">
      <div 
        onClick={() => onOpenDetail(selectedLocation)}
        className="flex items-start space-x-3.5 cursor-pointer group/card"
        title={language === 'en' ? 'Tap to view full details' : 'Nhấn để xem chi tiết đầy đủ'}
      >
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-stone-100">
          <img
            src={selectedLocation.imageUrl}
            alt={selectedLocation.name}
            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center ${meta.colorClass}`}>
              <CatIcon className="w-2.5 h-2.5 mr-1" />
              <span>{t(meta.label, language)}</span>
            </span>
            {userCoords && selectedLocation.lat && selectedLocation.lng && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {language === 'en' 
                  ? `${formatDistance(calculateDistanceKm(userCoords.latitude, userCoords.longitude, selectedLocation.lat, selectedLocation.lng))} away` 
                  : `Cách bạn ${formatDistance(calculateDistanceKm(userCoords.latitude, userCoords.longitude, selectedLocation.lat, selectedLocation.lng))}`}
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-stone-900 text-sm line-clamp-1 group-hover/card:text-[#ff9600] transition-colors">
            {t(selectedLocation.name, language)}
          </h3>
          <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
            {selectedLocation.address ? t(selectedLocation.address, language) : (language === 'en' ? 'Dak Song, Dak Nong' : 'Đắk Song, Đắk Nông')}
          </p>
        </div>
      </div>

      {selectedLocation.content && (
        <p 
          onClick={() => onOpenDetail(selectedLocation)}
          className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl leading-relaxed cursor-pointer hover:bg-stone-100 transition-colors"
        >
          {t(selectedLocation.content, language)}
        </p>
      )}

      {/* Actions Bar: Chi tiết + Yêu thích + Gọi điện + Chỉ đường */}
      <div className="pt-2 border-t border-stone-100 flex items-center space-x-2">
        <button
          onClick={() => onOpenDetail(selectedLocation)}
          className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center justify-center active:scale-95 shadow-sm"
        >
          <Info className="w-4 h-4 mr-1 text-stone-600" />
          {language === 'en' ? 'Details' : 'Chi tiết'}
        </button>

        {onToggleSave && (
          <button
            onClick={(e) => onToggleSave(selectedLocation.id, e)}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-center active:scale-95 shadow-sm ${
              isSaved
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'
            }`}
            title={isSaved ? (language === 'en' ? 'Saved to Favorites' : 'Đã lưu yêu thích') : (language === 'en' ? 'Save to Favorites' : 'Lưu vào yêu thích')}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {selectedLocation.phone && (
          <button
            onClick={() => makePhoneCall(selectedLocation.phone!)}
            className="px-3 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#ff9600] border border-orange-200 text-xs font-bold transition-all flex items-center justify-center active:scale-95 shadow-sm"
            title={language === 'en' ? `Call: ${selectedLocation.phone}` : `Gọi: ${selectedLocation.phone}`}
          >
            <Phone className="w-4 h-4 mr-1 text-[#ff9600]" />
            {language === 'en' ? 'Call' : 'Gọi'}
          </button>
        )}

        <button
          onClick={() => {
            if (selectedLocation.link && selectedLocation.link.startsWith('http')) {
              openExternalUrl(selectedLocation.link);
            } else {
              openGoogleMaps(
                selectedLocation.name,
                selectedLocation.lat || undefined,
                selectedLocation.lng || undefined,
                selectedLocation.address || undefined
              );
            }
          }}
          className="flex-1 py-3 rounded-2xl bg-[#ff9600] hover:bg-[#e68400] text-white text-xs font-black flex items-center justify-center transition-all active:scale-95 shadow-md shadow-orange-500/20"
        >
          <Navigation className="w-4 h-4 mr-1.5 fill-current" />
          {language === 'en' ? 'Directions' : 'Chỉ đường'}
        </button>
      </div>
    </div>
  );
};
