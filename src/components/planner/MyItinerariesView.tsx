import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Trash2, 
  Edit3, 
  Navigation, 
  ChevronRight, 
  Compass, 
  Cloud, 
  Clock, 
  BookmarkCheck,
  Check, 
  X, 
  PlusCircle, 
  Phone,
  Bell,
  BellOff,
  BellRing
} from 'lucide-react';
import { UserItinerary, ItineraryStop } from '../../services/supabase/types';
import { openGoogleMaps, makePhoneCall } from '../../services/zalo';
import { Destination } from '../../types';
import { 
  calculateTripDaysLeft, 
  findUpcomingTrip, 
  triggerTripNotification 
} from '../../services/reminder.service';

interface MyItinerariesViewProps {
  itineraries: UserItinerary[];
  language?: 'vi' | 'en';
  onDeleteItinerary: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onSelectDestination?: (dest: Destination) => void;
  onOpenVRNode: (nodeId: string) => void;
  onCreateNewTour: () => void;
  onToggleReminder?: (id: string, enabled: boolean) => void;
}

export const MyItinerariesView: React.FC<MyItinerariesViewProps> = ({
  itineraries,
  language = 'vi',
  onDeleteItinerary,
  onUpdateTitle,
  onOpenVRNode,
  onCreateNewTour,
  onToggleReminder
}) => {
  const isEn = language === 'en';
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');

  const activeItinerary = itineraries.find((item) => item.id === selectedItineraryId);

  // Tìm chuyến đi sắp tới gần nhất (0-3 ngày) để nhắc nhở
  const upcomingStatus = useMemo(() => findUpcomingTrip(itineraries), [itineraries]);

  // Tự động kiểm tra và bắn thông báo nhắc nhở 1 lần/ngày
  useEffect(() => {
    if (upcomingStatus) {
      triggerTripNotification(upcomingStatus);
    }
  }, [upcomingStatus]);

  const handleStartEdit = (item: UserItinerary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitleValue(item.title);
  };

  const handleSaveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitleValue.trim()) {
      onUpdateTitle(id, editTitleValue.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMsg = isEn 
      ? 'Are you sure you want to delete this itinerary?' 
      : 'Bạn có chắc chắn muốn xóa lịch trình này?';
    if (window.confirm(confirmMsg)) {
      if (selectedItineraryId === id) {
        setSelectedItineraryId(null);
      }
      onDeleteItinerary(id);
    }
  };

  const getStops = (item: UserItinerary): ItineraryStop[] => {
    if (!item.days || !Array.isArray(item.days)) return [];
    if (item.days.length > 0 && item.days[0].stops && Array.isArray(item.days[0].stops)) {
      return item.days.flatMap((d: any) => d.stops || []);
    }
    return item.days;
  };

  // Render badge ngày đếm ngược
  const renderCountdownBadge = (startDateStr?: string | null) => {
    const daysLeft = calculateTripDaysLeft(startDateStr);
    if (daysLeft === null) return null;

    if (daysLeft < 0) {
      return (
        <span className="text-[9px] font-semibold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full shrink-0">
          {isEn ? 'Completed' : 'Đã diễn ra'}
        </span>
      );
    }
    if (daysLeft === 0) {
      return (
        <span className="text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full shrink-0 animate-pulse shadow-2xs">
          {isEn ? '🎉 Today!' : '🎉 Hôm nay khởi hành!'}
        </span>
      );
    }
    if (daysLeft === 1) {
      return (
        <span className="text-[9px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
          {isEn ? '⏳ Tomorrow' : '⏳ Ngày mai đi'}
        </span>
      );
    }
    if (daysLeft <= 3) {
      return (
        <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
          {isEn ? `⏳ In ${daysLeft} days` : `⏳ Còn ${daysLeft} ngày`}
        </span>
      );
    }
    return (
      <span className="text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full shrink-0">
        📅 {new Date(startDateStr!).toLocaleDateString('vi-VN')}
      </span>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Banner Nhắc Nhở Chuyến Đi Sắp Khởi Hành (0 - 3 ngày) */}
      {!activeItinerary && upcomingStatus && (
        <div 
          onClick={() => setSelectedItineraryId(upcomingStatus.trip.id)}
          className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-2 border-[#ff9600]/40 rounded-3xl p-3.5 shadow-sm cursor-pointer hover:border-[#ff9600] transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#ff9600] text-white flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                <BellRing className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-[#ff9600] uppercase tracking-wider">
                {isEn ? 'Upcoming Trip Alert' : 'Nhắc Nhở Chuyến Đi Sắp Tới!'}
              </span>
            </div>
            {renderCountdownBadge(upcomingStatus.trip.start_date)}
          </div>

          <div className="pl-9">
            <h4 className="text-xs font-black text-stone-900 group-hover:text-[#ff9600] transition-colors truncate">
              {upcomingStatus.trip.title}
            </h4>
            <p className="text-[11px] text-stone-600 font-medium mt-0.5">
              {isEn ? upcomingStatus.statusTextEn : upcomingStatus.statusTextVi}
            </p>
          </div>
        </div>
      )}

      {/* Xem Chi Tiết 1 Lịch Trình */}
      {activeItinerary ? (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedItineraryId(null)}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#ff9600] text-xs font-bold flex items-center shadow-xs active:scale-95 transition-all"
            >
              ← {isEn ? 'Back to my list' : 'Quay lại danh sách'}
            </button>
            <span className="text-[11px] font-bold text-stone-500">
              {getStops(activeItinerary).length} {isEn ? 'stops' : 'chặng dừng'}
            </span>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="text-[10px] font-black text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-full inline-block uppercase">
                    {isEn ? 'Custom Travel Plan' : 'Kế Hoạch Du Lịch'}
                  </span>
                  {renderCountdownBadge(activeItinerary.start_date)}
                </div>
                <h3 className="font-black text-stone-900 text-sm sm:text-base mt-1">
                  {activeItinerary.title}
                </h3>
              </div>
              <button
                onClick={(e) => handleDelete(activeItinerary.id, e)}
                className="text-stone-400 hover:text-rose-500 p-1"
                title={isEn ? 'Delete plan' : 'Xóa lịch trình'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100 flex-wrap gap-2">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {isEn ? 'Departure:' : 'Khởi hành:'} {activeItinerary.start_date ? new Date(activeItinerary.start_date).toLocaleDateString('vi-VN') : (isEn ? 'Not set' : 'Chưa đặt')}
              </span>
              {onToggleReminder && (
                <button
                  onClick={() => onToggleReminder(activeItinerary.id, activeItinerary.reminder_enabled === false)}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    activeItinerary.reminder_enabled !== false 
                      ? 'text-[#ff9600] bg-orange-50 border border-orange-200/60'
                      : 'text-stone-400 bg-stone-100'
                  }`}
                >
                  {activeItinerary.reminder_enabled !== false ? <Bell className="w-3.5 h-3.5 fill-current text-[#ff9600]" /> : <BellOff className="w-3.5 h-3.5" />}
                  <span>{activeItinerary.reminder_enabled !== false ? (isEn ? 'Reminder On' : 'Nhắc nhở: Bật') : (isEn ? 'Reminder Off' : 'Nhắc nhở: Tắt')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Timeline các chặng */}
          <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-orange-200 pl-1">
            {getStops(activeItinerary).map((stop, idx) => (
              <div key={idx} className="relative flex items-start space-x-3 pl-2">
                <div className="w-7 h-7 rounded-full bg-[#ff9600] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm ring-4 ring-white z-10">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0 bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-full shrink-0">
                      {stop.time}
                    </span>
                    <span className="text-[10px] text-stone-400 flex items-center font-medium min-w-0 truncate">
                      <MapPin className="w-3 h-3 mr-0.5 text-stone-400 shrink-0" />
                      <span className="truncate">{stop.location}</span>
                    </span>
                  </div>

                  <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm leading-snug">
                    {stop.title}
                  </h4>

                  <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-3">
                    {stop.desc}
                  </p>

                  {stop.tip && (
                    <div className="pt-0.5">
                      <span className="inline-block text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold leading-relaxed">
                        💡 {stop.tip}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-end flex-wrap gap-1.5">
                    {stop.phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          makePhoneCall(stop.phone!);
                        }}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold flex items-center active:scale-95 transition-all shadow-2xs"
                        title={`Gọi: ${stop.phone}`}
                      >
                        <Phone className="w-3 h-3 mr-1 text-[#ff9600]" />
                        <span>{stop.phone}</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openGoogleMaps(stop.title, stop.lat, stop.lng, stop.location);
                      }}
                      className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-[#ff9600] rounded-lg text-[10px] font-bold flex items-center border border-orange-200/60 active:scale-95 transition-all shadow-2xs"
                    >
                      <Navigation className="w-3 h-3 mr-1 fill-current" />
                      <span>{isEn ? 'Directions' : 'Chỉ đường'}</span>
                    </button>

                    {stop.vrNodeId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVRNode(stop.vrNodeId!);
                        }}
                        className="px-2 py-1 bg-stone-900 text-[#ff9600] rounded-lg text-[10px] font-bold flex items-center border border-orange-500/30 active:scale-95 transition-all shadow-2xs"
                      >
                        <Compass className="w-3 h-3 mr-1 text-[#ff9600]" />
                        <span>VR 360°</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : itineraries.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#ff9600] flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-stone-900 text-sm">
              {isEn ? 'No saved itineraries yet' : 'Chưa có lịch trình nào được lưu'}
            </h4>
            <p className="text-stone-500 text-xs max-w-xs mx-auto leading-relaxed">
              {isEn 
                ? 'Create a customized tour using our smart suggestions or save an itinerary to track your journey.' 
                : 'Hãy sử dụng bộ gợi ý thông minh hoặc tạo chuyến đi để lưu giữ hành trình khám phá Đắk Song của bạn!'}
            </p>
          </div>
          <button
            onClick={onCreateNewTour}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-[#ff9600] text-white text-xs font-black shadow-md shadow-orange-500/20 active:scale-95 transition-all inline-flex items-center"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            {isEn ? 'Create Itinerary Now' : 'Tạo Lịch Trình Ngay'}
          </button>
        </div>
      ) : (
        /* Danh sách các lịch trình đã lưu */
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#ff9600]">
              {isEn ? `Saved Trips (${itineraries.length})` : `Chuyến Đi Đã Lưu (${itineraries.length})`}
            </span>
            <span className="text-[10px] text-stone-400 font-semibold flex items-center">
              <Cloud className="w-3 h-3 mr-1 text-sky-500" />
              {isEn ? 'Cloud Synced' : 'Đồng bộ Cloud'}
            </span>
          </div>

          {itineraries.map((item) => {
            const stops = getStops(item);
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItineraryId(item.id)}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/90 hover:border-orange-300 shadow-xs cursor-pointer group transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    {isEditing ? (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          className="text-xs font-bold px-2 py-1 border border-[#ff9600] rounded-lg w-full focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleSaveEdit(item.id, e)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-stone-400 hover:bg-stone-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h4 className="font-black text-stone-900 text-xs sm:text-sm group-hover:text-[#ff9600] transition-colors truncate">
                        {item.title}
                      </h4>
                    )}

                    <div className="flex items-center space-x-2 text-[10px] text-stone-400 mt-1 flex-wrap gap-y-1">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-amber-500" />
                        {stops.length} {isEn ? 'stops' : 'chặng'}
                      </span>
                      {renderCountdownBadge(item.start_date)}
                    </div>
                  </div>

                  {/* Nhóm nút tác vụ: Bật/tắt chuông nhắc, Đổi tên, Xóa */}
                  <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {onToggleReminder && (
                      <button
                        onClick={() => onToggleReminder(item.id, item.reminder_enabled === false)}
                        className={`p-1.5 rounded-lg transition-all ${
                          item.reminder_enabled !== false
                            ? 'text-[#ff9600] bg-orange-50 hover:bg-orange-100'
                            : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
                        }`}
                        title={item.reminder_enabled !== false ? (isEn ? 'Reminder On' : 'Đang bật nhắc nhở') : (isEn ? 'Reminder Off' : 'Đang tắt nhắc nhở')}
                      >
                        {item.reminder_enabled !== false ? <Bell className="w-3.5 h-3.5 fill-current" /> : <BellOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {!isEditing && (
                      <button
                        onClick={(e) => handleStartEdit(item, e)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                        title={isEn ? 'Rename' : 'Đổi tên'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg"
                      title={isEn ? 'Delete' : 'Xóa'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-1 text-stone-300 group-hover:text-[#ff9600]">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Danh sách nhãn nhanh các điểm đến trong chuyến đi */}
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-1">
                  {stops.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md whitespace-nowrap"
                    >
                      {s.title.length > 20 ? `${s.title.slice(0, 20)}...` : s.title}
                    </span>
                  ))}
                  {stops.length > 4 && (
                    <span className="text-[9px] font-bold text-[#ff9600] px-1">
                      +{stops.length - 4}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
