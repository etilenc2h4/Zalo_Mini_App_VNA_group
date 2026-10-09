import React from 'react';
import { Share2, Heart } from 'lucide-react';
import { shareApp } from '../services/zalo';
import { PortalConfiguration } from '../types';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  language: 'vi' | 'en';
  onToggleLanguage: () => void;
  onOpenSearch?: () => void;
  portalConfig?: PortalConfiguration | null;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  language,
  onToggleLanguage,
  portalConfig
}) => {
  const handleShare = () => {
    shareApp(
      portalConfig?.title || 'Cổng Văn Hóa Du Lịch - Đắk Song',
      'Khám phá cánh đồng điện gió, thác Lưu Ly, thiền viện Đạo Nguyên và không gian văn hóa cồng chiêng Đắk Song!'
    );
  };

  const logoUrl = portalConfig?.logoUrl || "https://static.dggv.edu.vn/360/1720520041256_1672315054577_group-5371.png";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto px-3.5 py-2">
        <div className="flex items-center justify-between">
          {/* Logo & Slim Brand Title */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-sm flex items-center justify-center shrink-0 border border-orange-300">
              <img
                src={logoUrl}
                alt="Logo Đắk Song"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-1 py-0.2 rounded">
                  {language === 'en' ? 'DISTRICT' : 'UBND Huyện'}
                </span>
                <span className="text-[10px] text-stone-500 font-semibold truncate">
                  {language === 'en' ? 'Dak Nong' : 'Đắk Nông'}
                </span>
              </div>
              <h1 className="text-xs font-black tracking-tight text-stone-900 leading-tight truncate">
                {language === 'en' ? 'Dak Song Tourism Portal' : 'Cổng Du Lịch Đắk Song'}
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1.5 shrink-0 ml-1">
            {/* Language button */}
            <button
              onClick={onToggleLanguage}
              className="px-2 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all text-[11px] font-bold text-stone-700 flex items-center space-x-1 border border-stone-200/60"
              title="Đổi ngôn ngữ"
            >
              <span>{language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
            </button>

            {/* Saved button */}
            <button
              onClick={onOpenSaved}
              className="relative p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all text-stone-700 border border-stone-200/60"
              title="Điểm đã lưu"
            >
              <Heart className="w-4 h-4 text-stone-600" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-95 transition-all text-[#ff9600] border border-orange-200"
              title="Chia sẻ Zalo"
            >
              <Share2 className="w-4 h-4 text-[#ff9600]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
