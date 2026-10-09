import React, { useState } from 'react';
import { Star, MapPin, Phone, Check, Tent, Home, Building2 } from 'lucide-react';
import { Stay } from '../types';
import { makePhoneCall } from '../services/zalo';

interface StaysTabProps {
  stays: Stay[];
}

export const StaysTab: React.FC<StaysTabProps> = ({ stays }) => {
  const [activeType, setActiveType] = useState<string>('all');

  const filteredStays = stays.filter((s) =>
    activeType === 'all' ? true : s.type === activeType
  );

  return (
    <div className="space-y-4 pb-24 px-4 pt-3">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Lưu Trú & Homestay Đắk Song
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Trải nghiệm glamping ngắm điện gió, homestay rừng thông thơ mộng
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'all', label: 'Tất cả nơi nghỉ' },
          { key: 'glamping', label: 'Glamping & Cắm trại' },
          { key: 'homestay', label: 'Homestay Rừng thông' },
          { key: 'hotel', label: 'Khách sạn Trung tâm' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveType(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeType === f.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List Stays */}
      <div className="space-y-4">
        {filteredStays.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
          >
            <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {item.typeLabel}
              </span>

              <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/50 backdrop-blur-md text-amber-300 text-xs px-2 py-0.5 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold text-white">{item.rating}</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <p className="text-[11px] text-white/80">Giá tham khảo</p>
                  <p className="text-sm font-black text-emerald-300">{item.pricePerNight} <span className="text-[10px] font-normal text-white">/ đêm</span></p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                <p className="flex items-center text-slate-500 text-xs mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                  <span>{item.address}</span>
                </p>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                {item.description}
              </p>

              {/* Amenities */}
              <div>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tiện ích nổi bật:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.amenities.map((am, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-[11px] bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-md"
                    >
                      <Check className="w-3 h-3 text-emerald-600 mr-1" />
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Hotline đặt phòng:</span>
                  <p className="text-xs font-bold text-slate-800">{item.phone}</p>
                </div>

                <button
                  onClick={() => makePhoneCall(item.phone)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs flex items-center shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Liên hệ đặt phòng
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

