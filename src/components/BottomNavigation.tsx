import React from 'react';
import { Home, Compass, Map, User, Sparkles } from 'lucide-react';

export type TabKey = 'home' | 'explore' | 'ai' | 'map' | 'planner' | 'saved' | 'vr360';

interface BottomNavProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  savedCount?: number;
  language?: 'vi' | 'en';
}

export const BottomNavigation: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onChangeTab, 
  savedCount = 0,
  language = 'vi'
}) => {
  const isEn = language === 'en';
  const tabs = [
    { key: 'home' as TabKey, label: isEn ? 'Home' : 'Trang chủ', icon: Home },
    { key: 'explore' as TabKey, label: isEn ? 'Explore' : 'Khám phá', icon: Compass },
    { key: 'ai' as TabKey, label: isEn ? 'AI Assistant' : 'Trợ lý AI', icon: Sparkles, isHighlight: true },
    { key: 'map' as TabKey, label: isEn ? 'Map' : 'Bản đồ', icon: Map },
    { key: 'saved' as TabKey, label: isEn ? 'Account' : 'Cá nhân', icon: User, badge: savedCount > 0 ? savedCount : undefined },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 pt-1 pb-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isHighlight = tab.isHighlight;

          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#ff9600] font-black'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              <div className={`relative p-1 rounded-full transition-all flex items-center justify-center ${
                isHighlight
                  ? (isActive 
                      ? 'bg-gradient-to-tr from-amber-500 to-[#ff9600] text-white shadow-md shadow-orange-500/30' 
                      : 'bg-orange-50 text-[#ff9600] hover:bg-orange-100')
                  : (isActive ? 'bg-orange-50 text-[#ff9600]' : '')
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />

                {tab.badge !== undefined && !isActive && (
                  <span className="absolute -top-1 -right-1 bg-[#ff9600] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full ${
                isActive ? 'text-[#ff9600] font-black' : ''
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
