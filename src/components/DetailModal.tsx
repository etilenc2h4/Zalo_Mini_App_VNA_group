import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Ticket, Star, Navigation, Share2, Heart, CheckCircle2, AlertCircle, Info, Phone, Languages } from 'lucide-react';
import { Destination } from '../types';
import { openGoogleMaps, shareApp, makePhoneCall } from '../services/zalo';
import { translateWithGoogle } from '../services/translate.service';

interface DetailModalProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenVRNode?: (nodeId: string) => void;
  language?: 'vi' | 'en';
}

export const DetailModal: React.FC<DetailModalProps> = ({
  destination,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  language = 'vi'
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [translatedName, setTranslatedName] = useState<string | null>(null);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [showEnglish, setShowEnglish] = useState<boolean>(language === 'en');

  useEffect(() => {
    setShowEnglish(language === 'en');
  }, [language]);

  useEffect(() => {
    if (!destination || !isOpen) {
      setTranslatedName(null);
      setTranslatedDesc(null);
      setIsTranslating(false);
      return;
    }

    if (showEnglish) {
      setIsTranslating(true);
      Promise.all([
        translateWithGoogle(destination.name, 'en'),
        translateWithGoogle(destination.description, 'en')
      ])
        .then(([nameEn, descEn]) => {
          setTranslatedName(nameEn);
          setTranslatedDesc(descEn);
        })
        .finally(() => setIsTranslating(false));
    }
  }, [destination, isOpen, showEnglish]);

  if (!isOpen || !destination) return null;

  const handleShare = () => {
    shareApp(
      `Khám phá ${destination.name} - Đắk Song`,
      `${destination.description.slice(0, 120)}...`
    );
  };

  const handleOpenMap = () => {
    openGoogleMaps(destination.name, destination.lat, destination.lng, destination.address);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-0 sm:p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0">
          <img
            src={destination.gallery[activeImageIndex] || destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

          {/* Top buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleSave(destination.id)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Title info in banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="inline-block bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5">
              {destination.categoryLabel}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug">
              {showEnglish && translatedName ? translatedName : destination.name}
            </h2>
            <div className="flex items-center space-x-3 mt-1.5 text-xs text-white/90">
              <span className="flex items-center text-amber-300 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                {destination.rating} ({destination.reviewsCount} {showEnglish ? 'reviews' : 'đánh giá'})
              </span>
              <span>•</span>
              <span className="text-emerald-300 font-medium">{destination.distance}</span>
            </div>
          </div>
        </div>

        {/* Gallery thumbnails */}
        {destination.gallery && destination.gallery.length > 1 && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-100 overflow-x-auto no-scrollbar">
            {destination.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-slate-700">
          {/* Quick specs */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">{showEnglish ? 'Opening Hours' : 'Giờ mở cửa'}</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{destination.openHours}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start space-x-2.5">
              <Ticket className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium">{showEnglish ? 'Ticket Price' : 'Vé tham quan'}</p>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">{destination.ticketPrice}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/80 flex items-start space-x-2.5 text-xs">
            <MapPin className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-emerald-900">{showEnglish ? 'Address: ' : 'Địa chỉ: '}</span>
              <span className="text-emerald-800">{destination.address}</span>
            </div>
          </div>

          {/* Hotline / Phone nếu có */}
          {destination.phone && (
            <div className="bg-orange-50/80 p-3 rounded-2xl border border-orange-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5 min-w-0 mr-2">
                <div className="p-2 bg-orange-100 rounded-xl text-[#ff9600] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-stone-500 font-medium">{showEnglish ? 'Hotline / Booking' : 'Hotline / Liên hệ đặt chỗ'}</p>
                  <a
                    href={`tel:${destination.phone}`}
                    className="text-[#ff9600] font-black text-sm hover:underline block truncate"
                  >
                    {destination.phone}
                  </a>
                </div>
              </div>
              <button
                onClick={() => makePhoneCall(destination.phone!)}
                className="px-3.5 py-2 rounded-xl bg-[#ff9600] hover:bg-[#e68400] text-white text-xs font-black shadow-sm shadow-orange-500/20 active:scale-95 transition-all shrink-0 flex items-center"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                {showEnglish ? 'Call Now' : 'Gọi ngay'}
              </button>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <Info className="w-4 h-4 text-emerald-600 mr-1.5" />
                {showEnglish ? 'About Destination' : 'Giới thiệu điểm đến'}
              </h3>

              <button
                onClick={() => setShowEnglish(!showEnglish)}
                disabled={isTranslating}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex items-center space-x-1 active:scale-95 transition-all"
              >
                <Languages className="w-3 h-3" />
                <span>{isTranslating ? 'Đang dịch...' : showEnglish ? '🇻🇳 Xem Tiếng Việt' : '🌐 Google Dịch'}</span>
              </button>
            </div>

            {showEnglish && (
              <div className="mb-2 text-[10px] text-emerald-700 font-medium flex items-center space-x-1 bg-emerald-50/60 px-2 py-0.5 rounded-lg border border-emerald-100">
                <span>🌐 Dịch tự động bởi Google Translate</span>
              </div>
            )}

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {showEnglish && translatedDesc ? translatedDesc : destination.description}
            </p>
          </div>

          {/* Highlights */}
          {destination.highlights && destination.highlights.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                Trải nghiệm không nên bỏ lỡ
              </h3>
              <div className="space-y-1.5">
                {destination.highlights.map((h, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {destination.tips && destination.tips.length > 0 && (
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60">
              <h3 className="font-bold text-amber-900 text-xs sm:text-sm mb-1.5 flex items-center">
                <AlertCircle className="w-4 h-4 text-amber-600 mr-1.5" />
                Mẹo du lịch hữu ích
              </h3>
              <div className="space-y-1 text-xs text-amber-800">
                {destination.tips.map((tip, i) => (
                  <p key={i}>• {tip}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer sticky buttons */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center space-x-2 shrink-0">
          <button
            onClick={handleShare}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center transition-all active:scale-95"
            title="Chia sẻ"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {destination.phone && (
            <button
              onClick={() => makePhoneCall(destination.phone!)}
              className="py-3 px-4 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#ff9600] border border-orange-200 font-bold text-xs flex items-center justify-center transition-all active:scale-95 shadow-sm"
              title={`Gọi: ${destination.phone}`}
            >
              <Phone className="w-4 h-4 mr-1.5 text-[#ff9600]" />
              Gọi điện
            </button>
          )}

          <button
            onClick={handleOpenMap}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/25 flex items-center justify-center transition-all active:scale-98"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Chỉ đường tới đây
          </button>
        </div>
      </div>
    </div>
  );
};

