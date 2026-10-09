import React from 'react';
import { LOCAL_SHORTCUTS } from '../data/mockData';
import { LocalShortcutItem } from '../types';

interface LocalShortcutsProps {
  onSelectShortcut: (item: LocalShortcutItem) => void;
  language?: 'vi' | 'en';
}

const SHORTCUT_TRANSLATIONS: Record<string, { title: string; badge?: string }> = {
  'Sự kiện': { title: 'Events', badge: 'New' },
  'Thắng cảnh': { title: 'Landscapes' },
  'Di tích lịch sử': { title: 'Historical Sites' },
  'Cơ quan hành chính': { title: 'Gov & Admin' },
  'Địa điểm giải trí': { title: 'Entertainment' },
  'Nhà hàng quán ăn': { title: 'Restaurants' },
  'Cơ sở lưu trú': { title: 'Accommodations' },
  'Đặc sản địa phương': { title: 'Specialties' },
  'Dịch vụ & Tiện ích': { title: 'Services' },
};

export const LocalShortcuts: React.FC<LocalShortcutsProps> = ({ onSelectShortcut, language = 'vi' }) => {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-4.5 bg-[#ff9600] rounded-full inline-block" />
          <h3 className="font-extrabold text-[#ff9600] text-sm uppercase tracking-wider">
            {language === 'en' ? 'Local Information' : 'Thông Tin Địa Phương'}
          </h3>
        </div>
        <span className="text-[11px] text-stone-400 font-medium">
          {language === 'en' ? '9 quick utilities' : '9 tiện ích tra cứu'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {LOCAL_SHORTCUTS.map((item) => {
          const trans = SHORTCUT_TRANSLATIONS[item.title];
          const displayTitle = language === 'en' && trans ? trans.title : item.title;
          const displayBadge = language === 'en' && trans?.badge ? trans.badge : item.badge;

          return (
            <button
              key={item.id}
              onClick={() => onSelectShortcut(item)}
              className="flex flex-col items-center p-2 rounded-2xl hover:bg-orange-50/50 active:scale-95 transition-all group"
            >
              <div className="relative w-15 h-15 rounded-full p-2 bg-white shadow-md shadow-orange-500/10 border border-stone-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src={item.icon}
                  alt={displayTitle}
                  className="w-10 h-10 object-contain"
                />
                {displayBadge && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                    {displayBadge}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-bold text-[#3b3b3b] group-hover:text-[#ff9600] transition-colors text-center mt-2 leading-tight line-clamp-2">
                {displayTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

