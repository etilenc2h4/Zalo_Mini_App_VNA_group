import React, { useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Bell, 
  Check, 
  ChevronRight,
  Sun,
  Compass
} from 'lucide-react';
import { calculateTripDaysLeft } from '../../services/reminder.service';
import { getVietnamDateString } from '../../utils/date';

interface TripDatePickerProps {
  startDate: string;
  onChangeStartDate: (date: string) => void;
  reminderEnabled: boolean;
  onToggleReminder: () => void;
  language?: 'vi' | 'en';
}

export const TripDatePicker: React.FC<TripDatePickerProps> = ({
  startDate,
  onChangeStartDate,
  reminderEnabled,
  onToggleReminder,
  language = 'vi'
}) => {
  const isEn = language === 'en';

  // Định dạng ngày hiển thị đẹp mắt theo chuẩn Travel App
  const formattedDateInfo = useMemo(() => {
    if (!startDate) return { weekday: '', dateStr: '', daysLeftBadge: null };

    const dateObj = new Date(startDate);
    if (isNaN(dateObj.getTime())) return { weekday: '', dateStr: '', daysLeftBadge: null };

    const daysOfWeekVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const daysOfWeekEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const weekday = isEn ? daysOfWeekEn[dateObj.getDay()] : daysOfWeekVi[dateObj.getDay()];
    const dateStr = dateObj.toLocaleDateString(isEn ? 'en-US' : 'vi-VN', {
      day: '2-digit',
      month: isEn ? 'short' : '2-digit',
      year: 'numeric'
    });

    const daysLeft = calculateTripDaysLeft(startDate);

    return { weekday, dateStr, daysLeft };
  }, [startDate, isEn]);

  // Các nút chọn nhanh (Quick presets) theo giờ Việt Nam
  const quickPresets = useMemo(() => {
    const todayStr = getVietnamDateString();
    const tomorrowStr = getVietnamDateString(new Date(Date.now() + 86400000));

    // Thứ 7 gần nhất
    const sat = new Date();
    const currentDay = sat.getDay();
    const daysUntilSat = (6 - currentDay + 7) % 7 || 7;
    sat.setDate(sat.getDate() + (currentDay === 6 ? 7 : daysUntilSat));
    const satStr = getVietnamDateString(sat);

    return [
      { key: 'today', label: isEn ? 'Today' : 'Hôm nay', val: todayStr, icon: '⚡' },
      { key: 'tomorrow', label: isEn ? 'Tomorrow' : 'Ngày mai', val: tomorrowStr, icon: '🌅' },
      { key: 'weekend', label: isEn ? 'This Weekend' : 'Cuối tuần này', val: satStr, icon: '🏕️' }
    ];
  }, [isEn]);

  return (
    <div className="pt-2 border-t border-stone-100 space-y-3">
      {/* Tiêu đề & Chọn nhanh */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-stone-800 flex items-center tracking-tight">
          <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-[#ff9600]" />
          {isEn ? 'Trip Departure Date' : 'Thời Gian Khởi Hành'}
        </span>
        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold flex items-center">
          <Sparkles className="w-2.5 h-2.5 mr-1 text-[#ff9600]" />
          {isEn ? 'Easy schedule' : 'Lên lịch linh hoạt'}
        </span>
      </div>

      {/* Preset Chips: Chọn nhanh Hôm nay / Ngày mai / Cuối tuần */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        {quickPresets.map((preset) => {
          const isSelected = startDate === preset.val;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => onChangeStartDate(preset.val)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center space-x-1 transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-[#ff9600] text-white shadow-xs shadow-orange-500/20 ring-2 ring-orange-200'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/80'
              }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Thẻ Card Chọn Ngày Du Lịch Phong Cách Hiện Đại (Custom Travel Date Card) */}
      <div className="relative group rounded-2xl p-3 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-stone-50 border border-orange-200/80 hover:border-[#ff9600] shadow-2xs transition-all">
        {/* Input ẩn overlay kích hoạt Date Picker native của hệ điều hành / thiết bị */}
        <input
          type="date"
          value={startDate}
          min={getVietnamDateString()}
          onChange={(e) => onChangeStartDate(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
          title={isEn ? 'Tap to choose departure date' : 'Chạm để đổi ngày khởi hành'}
        />

        <div className="flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Lịch Icon Badge */}
            <div className="w-10 h-10 rounded-xl bg-white border border-orange-200/70 shadow-xs flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-[9px] font-black uppercase text-[#ff9600] leading-none">
                {startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short' }) : 'DAY'}
              </span>
              <span className="text-sm font-black text-stone-900 leading-tight">
                {startDate ? new Date(startDate).getDate() : '--'}
              </span>
            </div>

            {/* Thông tin ngày và thứ */}
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-stone-900 truncate">
                  {formattedDateInfo.weekday || (isEn ? 'Select date' : 'Chọn ngày')}
                </span>
                {/* Badge đếm ngược ngày */}
                {formattedDateInfo.daysLeft !== null && formattedDateInfo.daysLeft !== undefined && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none ${
                    formattedDateInfo.daysLeft === 0
                      ? 'bg-rose-500 text-white animate-pulse'
                      : formattedDateInfo.daysLeft === 1
                      ? 'bg-amber-500 text-white'
                      : 'bg-orange-100 text-[#ff9600]'
                  }`}>
                    {formattedDateInfo.daysLeft === 0
                      ? (isEn ? 'Today' : 'Hôm nay')
                      : formattedDateInfo.daysLeft === 1
                      ? (isEn ? 'Tomorrow' : 'Ngày mai')
                      : (isEn ? `In ${formattedDateInfo.daysLeft} days` : `Còn ${formattedDateInfo.daysLeft} ngày`)}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-stone-500 block truncate mt-0.5">
                {formattedDateInfo.dateStr}
              </span>
            </div>
          </div>

          {/* Nút giả lập đổi ngày */}
          <div className="flex items-center space-x-1 text-[11px] font-bold text-[#ff9600] bg-white px-2.5 py-1 rounded-xl border border-orange-200/80 shadow-2xs group-hover:bg-orange-50 transition-colors shrink-0">
            <span>{isEn ? 'Change' : 'Đổi ngày'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Hộp Bật/Tắt Chuông Nhắc Nhở Chuyến Đi Thiết Kế Hiện Đại */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-200 shadow-2xs transition-all">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            reminderEnabled 
              ? 'bg-orange-50 text-[#ff9600] ring-1 ring-orange-200' 
              : 'bg-stone-100 text-stone-400'
          }`}>
            <Bell className={`w-4 h-4 ${reminderEnabled ? 'fill-current' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-stone-900 leading-tight">
                {isEn ? 'Departure Reminder' : 'Nhắc Nhở Ngày Khởi Hành'}
              </span>
              {reminderEnabled && (
                <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded leading-normal border border-emerald-200">
                  {isEn ? 'Active' : 'Đã bật'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-400 font-medium block mt-0.5 leading-snug">
              {isEn ? 'Alerts 1-2 days before trip to pack luggage' : 'Tự động báo trước 1-2 ngày để chuẩn bị hành lý'}
            </span>
          </div>
        </div>

        {/* Nút Switch Bật/Tắt Mượt Mà Chuẩn iOS */}
        <button
          type="button"
          onClick={onToggleReminder}
          className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
            reminderEnabled ? 'bg-[#ff9600]' : 'bg-stone-300'
          }`}
          title={reminderEnabled ? (isEn ? 'Turn off reminder' : 'Tắt nhắc nhở') : (isEn ? 'Turn on reminder' : 'Bật nhắc nhở')}
        >
          <div
            className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
              reminderEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

