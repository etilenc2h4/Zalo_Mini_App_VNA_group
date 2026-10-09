import React, { useState } from 'react';
import { Phone, MapPin, Award, ShoppingBag, CheckCircle } from 'lucide-react';
import { Specialty } from '../types';
import { makePhoneCall } from '../services/zalo';

interface SpecialtiesTabProps {
  specialties: Specialty[];
}

export const SpecialtiesTab: React.FC<SpecialtiesTabProps> = ({ specialties }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ocop' | 'mon-an' | 'qua-tang'>('all');

  const filtered = specialties.filter((s) =>
    activeFilter === 'all' ? true : s.category === activeFilter
  );

  return (
    <div className="space-y-4 pb-24 px-4 pt-3">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Đặc Sản & Ẩm Thực Đắk Song
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Khám phá thủ phủ hồ tiêu OCOP trứ danh và phong vị ẩm thực Tây Nguyên
        </p>
      </div>

      {/* Intro Highlight Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
          <Award className="w-7 h-7 text-amber-200" />
        </div>
        <div className="text-xs">
          <h4 className="font-bold text-sm text-white">Thủ Phủ Hồ Tiêu Việt Nam</h4>
          <p className="text-white/90 mt-0.5 leading-snug">
            Đắk Song sở hữu diện tích hồ tiêu hữu cơ lớn hàng đầu cả nước với chất lượng xuất khẩu châu Âu và Mỹ.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'all', label: 'Tất cả đặc sản' },
          { key: 'ocop', label: 'Sản phẩm OCOP' },
          { key: 'mon-an', label: 'Món ngon bản địa' },
          { key: 'qua-tang', label: 'Trái cây & Quà biếu' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === f.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Specialties Grid / List */}
      <div className="space-y-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3.5"
          >
            <div className="relative h-44 sm:h-36 sm:w-36 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.badge && (
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                  {item.badge}
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {item.categoryLabel}
                  </span>
                  <span className="text-xs font-extrabold text-amber-600">
                    {item.priceRange}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1.5">
                  {item.name}
                </h3>

                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {item.description}
                </p>

                <p className="flex items-center text-slate-500 text-xs mt-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                  <span className="font-medium text-slate-700">Điểm mua: </span>
                  <span className="ml-1 truncate">{item.whereToBuy}</span>
                </p>
              </div>

              {item.hotline && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Tư vấn / Đặt hàng quà biếu:</span>
                  <button
                    onClick={() => makePhoneCall(item.hotline!)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center transition-all shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    {item.hotline}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

