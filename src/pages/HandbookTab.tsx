import React, { useState } from 'react';
import { Calendar, Compass, ShieldAlert, Cross, Wrench, PhoneCall, Info, Clock, CheckCircle2, ChevronDown, ChevronUp, BedDouble, Star, MapPin, Check } from 'lucide-react';
import { TOURS, EMERGENCY_CONTACTS, TRAVEL_TIPS, STAYS } from '../data/mockData';
import { makePhoneCall } from '../services/zalo';

export const HandbookTab: React.FC = () => {
  const [expandedTourId, setExpandedTourId] = useState<string | null>(TOURS[0]?.id || null);

  const getEmergencyIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'Cross':
        return <Cross className="w-5 h-5 text-blue-500" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-amber-500" />;
      default:
        return <PhoneCall className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-3">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Cẩm Nang, Lịch Trình & Lưu Trú
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kinh nghiệm du lịch, gợi ý lịch trình, homestay và danh bạ cứu hộ
        </p>
      </div>

      {/* Suggested Itineraries Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Lịch Trình Tour Gợi Ý
          </h3>
        </div>

        <div className="space-y-3">
          {TOURS.map((tour) => {
            const isExpanded = expandedTourId === tour.id;
            return (
              <div
                key={tour.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
              >
                <div
                  onClick={() => setExpandedTourId(isExpanded ? null : tour.id)}
                  className="p-4 cursor-pointer flex items-start justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      {tour.duration}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {tour.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Phù hợp: {tour.suitableFor}
                    </p>
                  </div>
                  <button className="p-1 rounded-full text-slate-400 hover:text-slate-600 shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-slate-100 space-y-4 text-xs animate-in fade-in duration-200">
                    {/* Highlights */}
                    <div>
                      <p className="font-bold text-slate-800 mb-1.5">Trải nghiệm cốt lõi:</p>
                      <div className="space-y-1">
                        {tour.highlights.map((h, i) => (
                          <div key={i} className="flex items-start space-x-1.5 text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <p className="font-bold text-slate-800 mb-2">Lịch trình chi tiết:</p>
                      <div className="space-y-2.5 border-l-2 border-emerald-200 ml-2 pl-3">
                        {tour.itinerary.map((step, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-white" />
                            <p className="font-bold text-emerald-800 text-[11px]">{step.time}</p>
                            <p className="text-slate-700 font-medium">{step.activity}</p>
                            <p className="text-slate-400 text-[11px]">📍 {step.location}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price and Advice */}
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 space-y-1">
                      <p className="text-emerald-900 font-semibold">
                        Chi phí ước tính: <span className="text-emerald-700 font-bold">{tour.priceEstimate}</span>
                      </p>
                      <p className="text-emerald-800 text-[11px]">
                        Lưu ý: {tour.advice}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lưu Trú & Glamping Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <BedDouble className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Nơi Nghỉ, Glamping & Homestay
          </h3>
        </div>

        <div className="space-y-3">
          {STAYS.map((stay) => (
            <div
              key={stay.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <span className="absolute top-2.5 left-2.5 bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {stay.typeLabel}
                </span>
                <span className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-white ml-1">{stay.rating}</span>
                </span>
                <span className="absolute bottom-2.5 left-2.5 text-white text-xs font-bold">
                  {stay.pricePerNight}
                </span>
              </div>

              <div className="p-3.5 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{stay.name}</h4>
                <p className="text-xs text-slate-500 flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                  <span className="truncate">{stay.address}</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {stay.amenities.slice(0, 3).map((am, i) => (
                    <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                      {am}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">{stay.phone}</span>
                  <button
                    onClick={() => makePhoneCall(stay.phone)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center active:scale-95 transition-all shadow-sm"
                  >
                    <PhoneCall className="w-3 h-3 mr-1" />
                    Đặt phòng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Tips */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Kinh Nghiệm Du Khách Cần Biết
          </h3>
        </div>

        <div className="space-y-2.5">
          {TRAVEL_TIPS.map((tip: { title: string; content: string }, idx: number) => (
            <div
              key={idx}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-1"
            >
              <h4 className="font-bold text-xs sm:text-sm text-emerald-800">
                {tip.title}
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                {tip.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts Directory */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <PhoneCall className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Danh Bạ Khẩn Cấp & Cứu Hộ
          </h3>
        </div>

        <div className="space-y-2">
          {EMERGENCY_CONTACTS.map((contact, idx) => (
            <div
              key={idx}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  {getEmergencyIcon(contact.iconName)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {contact.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {contact.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => makePhoneCall(contact.phone)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 font-bold text-xs flex items-center border border-emerald-200 transition-all shrink-0 ml-2"
              >
                <PhoneCall className="w-3.5 h-3.5 mr-1" />
                Gọi
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
