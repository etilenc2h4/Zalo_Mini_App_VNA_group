import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FEATURE_PORTFOLIO } from '../data/mockData';
import { FeaturePortfolioItem } from '../types';

interface SpecialtyFeaturesProps {
  onSelectFeature: (item: FeaturePortfolioItem) => void;
  language?: 'vi' | 'en';
}

const FEATURE_TRANSLATIONS: Record<string, { subtitle: string; title: string }> = {
  'feat-1': { subtitle: 'ECHOES OF GONGS...', title: 'Festivals' },
  'feat-2': { subtitle: 'HIGHLAND FLAVORS...', title: 'Cuisine' },
  'feat-3': { subtitle: 'WIND TURBINES & PINES...', title: 'Landscapes' },
  'feat-4': { subtitle: 'PEPPER & FINE ROBUSTA...', title: 'Specialties' }
};

export const SpecialtyFeatures: React.FC<SpecialtyFeaturesProps> = ({ onSelectFeature, language = 'vi' }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-4.5 bg-[#ff9600] rounded-full inline-block" />
          <h3 className="font-extrabold text-[#ff9600] text-sm uppercase tracking-wider">
            {language === 'en' ? 'Local Highlights' : 'Đặc Trưng Địa Phương'}
          </h3>
        </div>
        <span className="text-[11px] text-stone-400">
          {language === 'en' ? 'Explore culture' : 'Khám phá văn hóa'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FEATURE_PORTFOLIO.map((item) => {
          const trans = FEATURE_TRANSLATIONS[item.id];
          const displaySubtitle = language === 'en' && trans ? trans.subtitle : item.subtitle;
          const displayTitle = language === 'en' && trans ? trans.title : item.title;

          return (
            <div
              key={item.id}
              onClick={() => onSelectFeature(item)}
              className="group relative h-44 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-stone-200/80 active:scale-[0.98] transition-all bg-stone-900"
            >
              <img
                src={item.image}
                alt={displayTitle}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              {/* Content on card */}
              <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold tracking-wider text-amber-300 uppercase line-clamp-1">
                  {displaySubtitle}
                </span>
                <h4 className="text-base font-black text-white leading-tight mt-0.5 group-hover:text-amber-300 transition-colors">
                  {displayTitle}
                </h4>

                <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-white/20">
                  <span className="text-[10px] text-white/80 font-medium">
                    {language === 'en' ? 'Explore now' : 'Khám phá ngay'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#ff9600] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

