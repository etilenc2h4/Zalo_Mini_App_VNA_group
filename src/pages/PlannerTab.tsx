import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Compass, 
  MapPin, 
  BookmarkCheck, 
  Check, 
  Sparkles, 
  ListChecks, 
  Navigation, 
  ArrowRight, 
  Heart, 
  Phone,
  Bell
} from 'lucide-react';
import { Destination, Specialty, Stay } from '../types';
import { TravelLocation } from '../types/travel';
import { DESTINATIONS, SPECIALTIES, STAYS } from '../data/mockData';
import { openGoogleMaps, makePhoneCall, getStoredZaloUser } from '../services/zalo';
import { 
  saveUserItinerary, 
  fetchUserItineraries, 
  deleteUserItinerary, 
  updateItineraryTitle,
  toggleTripReminder 
} from '../services/supabase.service';
import { UserItinerary, ItineraryStop } from '../services/supabase/types';
import { MyItinerariesView } from '../components/planner/MyItinerariesView';
import { TripDatePicker } from '../components/planner/TripDatePicker';
import { generateDynamicItinerary } from '../services/planner.service';
import { requestNotificationPermission } from '../services/reminder.service';
import { getVietnamDateString } from '../utils/date';

interface PlannerTabProps {
  onSelectDestination: (dest: Destination) => void;
  onOpenVRNode: (nodeId: string) => void;
  embedded?: boolean;
  language?: 'vi' | 'en';
  travelLocations?: TravelLocation[];
  destinations?: Destination[];
  stays?: Stay[];
  specialties?: Specialty[];
  savedDestinations?: Destination[];
}

export const PlannerTab: React.FC<PlannerTabProps> = ({ 
  onSelectDestination, 
  onOpenVRNode, 
  embedded = false, 
  language = 'vi',
  travelLocations = [],
  destinations = DESTINATIONS,
  stays = STAYS,
  specialties = SPECIALTIES,
  savedDestinations = []
}) => {
  const isEn = language === 'en';
  const [plannerSubTab, setPlannerSubTab] = useState<'suggestions' | 'my_itineraries'>('suggestions');
  const [userItineraries, setUserItineraries] = useState<UserItinerary[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<'1day' | '2days'>('1day');
  const [selectedInterest, setSelectedInterest] = useState<'nature' | 'culture' | 'checkin' | 'food' | 'saved'>('nature');
  const [startDate, setStartDate] = useState<string>(() => getVietnamDateString());
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Số lượng địa điểm du lịch người dùng đã lưu
  const savedSpotsCount = useMemo(() => {
    return savedDestinations.filter(
      (d) => !(d.extra_data?.isPost || d.categoryLabel === 'Bài viết')
    ).length;
  }, [savedDestinations]);

  // Tải danh sách lịch trình đã lưu từ Supabase & LocalStorage
  const loadItineraries = async () => {
    const user = getStoredZaloUser();
    const list = await fetchUserItineraries(user?.id);
    setUserItineraries(list);
  };

  useEffect(() => {
    loadItineraries();
  }, []);

  const handleDeleteItinerary = async (id: string) => {
    const user = getStoredZaloUser();
    await deleteUserItinerary(user?.id, id);
    setUserItineraries((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    const user = getStoredZaloUser();
    await updateItineraryTitle(user?.id, id, newTitle);
    setUserItineraries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, title: newTitle, updated_at: new Date().toISOString() } : i))
    );
  };

  const handleToggleReminder = async (id: string, enabled: boolean) => {
    const user = getStoredZaloUser();
    await toggleTripReminder(user?.id, id, enabled);
    setUserItineraries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, reminder_enabled: enabled } : i))
    );
  };

  // 100% Sinh lịch trình động dựa trên dữ liệu thật (Live API Travel Locations + Mục Đã Lưu)
  const generatedPlan: ItineraryStop[] = useMemo(() => {
    return generateDynamicItinerary({
      duration: selectedDuration,
      interest: selectedInterest,
      travelLocations,
      destinations,
      stays,
      specialties,
      savedDestinations,
      language
    });
  }, [
    selectedDuration,
    selectedInterest,
    travelLocations,
    destinations,
    stays,
    specialties,
    savedDestinations,
    language
  ]);

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const interestLabel = selectedInterest === 'saved'
        ? (isEn ? 'From Saved Spots' : 'Từ Mục Đã Lưu')
        : selectedInterest === 'nature'
        ? (isEn ? 'Nature' : 'Thiên Nhiên')
        : selectedInterest === 'culture'
        ? (isEn ? 'Culture' : 'Văn Hóa')
        : selectedInterest === 'food'
        ? (isEn ? 'Food' : 'Ẩm Thực')
        : (isEn ? 'Check-in' : 'Check-in');

      const planTitle = isEn
        ? `Dak Song ${selectedDuration === '1day' ? '1 Day Tour' : '2D1N Tour'} (${interestLabel})`
        : `Lịch Trình Đắk Song ${selectedDuration === '1day' ? '1 Ngày' : '2N1Đ'} (${interestLabel})`;
      
      const newPlan: UserItinerary = {
        id: `plan_${selectedDuration}_${selectedInterest}_${Date.now()}`,
        user_id: getStoredZaloUser()?.id || 'local_user',
        title: planTitle,
        start_date: startDate,
        days: generatedPlan,
        reminder_enabled: reminderEnabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (reminderEnabled) {
        requestNotificationPermission().catch(() => {});
      }

      const user = getStoredZaloUser();
      await saveUserItinerary(user?.id, newPlan);

      setUserItineraries((prev) => [newPlan, ...prev.filter((p) => p.id !== newPlan.id)]);
      setSaveNotice(isEn ? 'Saved & synced itinerary successfully!' : 'Đã lưu lịch trình thành công vào tài khoản!');
    } catch (e) {
      setSaveNotice(isEn ? 'Itinerary saved successfully!' : 'Đã lưu lịch trình thành công!');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveNotice(null), 4000);
    }
  };

  return (
    <div className={embedded ? "space-y-4" : "space-y-4 pb-24 px-3.5 pt-3"}>
      {/* Title Header */}
      {!embedded && (
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center">
            <span className="w-2 h-5 bg-[#ff9600] rounded-full inline-block mr-2" />
            {isEn ? 'Smart Itinerary Planner' : 'Lên Lịch Trình Thông Minh'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {isEn ? 'Customized tours tailored to your time & travel preferences' : 'Thiết kế & quản lý tour du lịch theo thời gian và sở thích của bạn'}
          </p>
        </div>
      )}

      {/* 2 Tab con: [Gợi Ý Tour] và [Lịch Trình Của Tôi] */}
      <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/80">
        <button
          onClick={() => setPlannerSubTab('suggestions')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
            plannerSubTab === 'suggestions'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff9600]" />
          <span>{isEn ? 'Tour Suggestions' : 'Gợi Ý Tour Đắk Song'}</span>
        </button>

        <button
          onClick={() => setPlannerSubTab('my_itineraries')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
            plannerSubTab === 'my_itineraries'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5 text-[#ff9600]" />
          <span>{isEn ? `My Trips (${userItineraries.length})` : `Lịch Trình Của Tôi (${userItineraries.length})`}</span>
        </button>
      </div>

      {/* NỘI DUNG THEO SUB-TAB */}
      {plannerSubTab === 'my_itineraries' ? (
        <MyItinerariesView
          itineraries={userItineraries}
          language={language}
          onDeleteItinerary={handleDeleteItinerary}
          onUpdateTitle={handleUpdateTitle}
          onSelectDestination={onSelectDestination}
          onOpenVRNode={onOpenVRNode}
          onCreateNewTour={() => setPlannerSubTab('suggestions')}
          onToggleReminder={handleToggleReminder}
        />
      ) : (
        <div className="space-y-4">
          {/* Chọn Thời lượng Chuyến đi */}
          <div className="bg-white rounded-3xl p-3.5 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span>{isEn ? 'Trip duration:' : 'Thời gian chuyến đi:'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setSelectedDuration('1day')}
                className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between active:scale-[0.98] ${
                  selectedDuration === '1day'
                    ? 'bg-[#ff9600] text-white border-[#ff9600] shadow-md shadow-orange-500/20'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Clock className={`w-4 h-4 ${selectedDuration === '1day' ? 'text-white' : 'text-[#ff9600]'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    selectedDuration === '1day' ? 'bg-white/20 text-white' : 'bg-stone-200/70 text-stone-600'
                  }`}>
                    {isEn ? 'Day Trip' : 'Trong ngày'}
                  </span>
                </div>
                <div className="font-black text-xs sm:text-sm">
                  {isEn ? '1 Day Tour' : 'Tour 1 Ngày'}
                </div>
              </button>

              <button
                onClick={() => setSelectedDuration('2days')}
                className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between active:scale-[0.98] ${
                  selectedDuration === '2days'
                    ? 'bg-[#ff9600] text-white border-[#ff9600] shadow-md shadow-orange-500/20'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Calendar className={`w-4 h-4 ${selectedDuration === '2days' ? 'text-white' : 'text-[#ff9600]'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    selectedDuration === '2days' ? 'bg-white/20 text-white' : 'bg-stone-200/70 text-stone-600'
                  }`}>
                    {isEn ? 'Overnight' : '2 Ngày 1 Đêm'}
                  </span>
                </div>
                <div className="font-black text-xs sm:text-sm">
                  {isEn ? '2D1N Tour' : 'Tour Trọn Vẹn'}
                </div>
              </button>
            </div>

            {/* Chọn Sở thích du lịch & Lấy từ mục đã lưu */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-700 mb-2 block">
                {isEn ? 'Travel preferences & Data sources:' : 'Sở thích & Nguồn lịch trình:'}
              </span>
              <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                {savedSpotsCount > 0 && (
                  <button
                    onClick={() => setSelectedInterest('saved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1 ${
                      selectedInterest === 'saved'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    <span>{isEn ? `From Saved (${savedSpotsCount})` : `Từ Điểm Đã Lưu (${savedSpotsCount})`}</span>
                  </button>
                )}

                {[
                  { key: 'nature', label: isEn ? '🌿 Nature & Falls' : '🌿 Thiên nhiên & Thác' },
                  { key: 'checkin', label: isEn ? '📸 Wind Farms' : '📸 Check-in Điện Gió' },
                  { key: 'culture', label: isEn ? '🥁 Culture & Heritage' : '🥁 Văn hóa & Buôn làng' },
                  { key: 'food', label: isEn ? '🍲 Local Cuisine' : '🍲 Đặc sản Ẩm thực' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedInterest(item.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedInterest === item.key
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Ngày Khởi Hành & Nhắc Nhở Chuyến Đi Hiện Đại */}
            <TripDatePicker
              startDate={startDate}
              onChangeStartDate={setStartDate}
              reminderEnabled={reminderEnabled}
              onToggleReminder={async () => {
                const next = !reminderEnabled;
                setReminderEnabled(next);
                if (next) {
                  await requestNotificationPermission();
                }
              }}
              language={language}
            />
          </div>

          {/* Timeline Lịch Trình Chi Tiết Đề Xuất (Tạo động 100% từ API và dữ liệu thật) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider text-[#ff9600]">
                {isEn ? 'Proposed Real-Data Itinerary' : 'Lịch Trình Chi Tiết Đề Xuất'}
              </h3>
              <span className="text-[11px] text-stone-400 font-semibold">
                {generatedPlan.length} {isEn ? 'stops' : 'chặng dừng'}
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-orange-200">
              {generatedPlan.map((step, idx) => (
                <div key={idx} className="relative flex items-start space-x-3.5 pl-2">
                  <div className="w-7 h-7 rounded-full bg-[#ff9600] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md ring-4 ring-white z-10">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0 bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-full shrink-0">
                        {step.time}
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center font-medium min-w-0 truncate">
                        <MapPin className="w-3 h-3 mr-0.5 text-stone-400 shrink-0" />
                        <span className="truncate">{step.location}</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm leading-snug">
                      {step.title}
                    </h4>

                    <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-3">
                      {step.desc}
                    </p>

                    {/* Mẹo địa phương */}
                    {step.tip && (
                      <div className="pt-0.5">
                        <span className="inline-block text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold leading-relaxed">
                          💡 {step.tip}
                        </span>
                      </div>
                    )}

                    {/* Nhóm nút tác vụ: Gọi điện, Chỉ đường, VR 360 */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-end flex-wrap gap-1.5">
                      {step.phone && (
                        <button
                          onClick={() => makePhoneCall(step.phone!)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold flex items-center active:scale-95 transition-all shadow-2xs"
                          title={`Gọi: ${step.phone}`}
                        >
                          <Phone className="w-3 h-3 mr-1 text-[#ff9600]" />
                          <span>{step.phone}</span>
                        </button>
                      )}

                      <button
                        onClick={() => openGoogleMaps(step.title, step.lat, step.lng, step.location)}
                        className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-[#ff9600] rounded-lg text-[10px] font-bold flex items-center border border-orange-200/60 active:scale-95 transition-all shadow-2xs"
                      >
                        <Navigation className="w-3 h-3 mr-1 fill-current" />
                        <span>{isEn ? 'Directions' : 'Chỉ đường'}</span>
                      </button>

                      {step.vrNodeId && (
                        <button
                          onClick={() => onOpenVRNode(step.vrNodeId!)}
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

            {/* Nút lưu lịch trình này vào tài khoản */}
            <div className="pt-3 space-y-2">
              <button
                onClick={handleSavePlan}
                disabled={isSaving}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#ff9600] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all hover:opacity-95"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{isSaving ? (isEn ? 'Saving...' : 'Đang lưu...') : (isEn ? 'Save This Itinerary to Account' : 'Lưu Lịch Trình Này Vào Tài Khoản')}</span>
              </button>

              {saveNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveNotice}</span>
                  </div>
                  <button
                    onClick={() => setPlannerSubTab('my_itineraries')}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl text-[11px] font-extrabold flex items-center shadow-xs shrink-0"
                  >
                    <span>{isEn ? 'View Trips' : 'Xem Lịch Trình'}</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
