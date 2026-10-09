import React, { useEffect, useState } from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Droplets, 
  RefreshCw, 
  Thermometer, 
  Mountain,
  Moon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getDakSongWeather, DakSongWeatherData, DAK_SONG_COORDS } from '../../services/weather.service';

interface WeatherWidgetProps {
  language?: 'vi' | 'en';
  userCoords?: { latitude: number; longitude: number } | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  language = 'vi',
  userCoords
}) => {
  const isEn = language === 'en';
  // Mặc định khi vào thì ở dạng ẩn / thu gọn
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [weather, setWeather] = useState<DakSongWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Tính tọa độ sử dụng: Ưu tiên GPS người dùng nếu họ đang ở Đắk Song (<50km), ngược lại dùng TT Đức An
  const activeLat = userCoords && Math.abs(userCoords.latitude - DAK_SONG_COORDS.latitude) < 0.8
    ? userCoords.latitude
    : DAK_SONG_COORDS.latitude;
  const activeLng = userCoords && Math.abs(userCoords.longitude - DAK_SONG_COORDS.longitude) < 0.8
    ? userCoords.longitude
    : DAK_SONG_COORDS.longitude;

  const fetchWeather = async (force: boolean = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await getDakSongWeather(activeLat, activeLng, force);
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather(false);
  }, [activeLat, activeLng]);

  // Chọn icon phù hợp theo mã WMO code
  const renderWeatherIcon = (size: string = 'w-6 h-6') => {
    if (!weather) return <Sun className={`${size} text-amber-500 animate-pulse`} />;
    
    if (weather.weatherCode >= 95) {
      return <CloudLightning className={`${size} text-amber-500`} />;
    }
    if (weather.weatherCode >= 51) {
      return <CloudRain className={`${size} text-sky-500`} />;
    }
    if (weather.weatherCode >= 3) {
      return <Cloud className={`${size} text-stone-400`} />;
    }
    if (!weather.isDay) {
      return <Moon className={`${size} text-amber-300`} />;
    }
    return <Sun className={`${size} text-amber-500`} />;
  };

  return (
    <div className="px-3.5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/80 to-orange-50 border border-orange-200/90 shadow-sm transition-all duration-200">
        {/* Họa tiết quạt gió trang trí chìm ở góc */}
        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
          <Wind className="w-28 h-28 text-stone-900" />
        </div>

        {/* 1. THANH TÓM TẮT (Luôn hiển thị, bấm để mở rộng hoặc thu gọn) */}
        <div 
          onClick={() => setIsExpanded((prev) => !prev)}
          className="p-3 flex items-center justify-between cursor-pointer select-none active:bg-orange-100/50 transition-colors"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/90 border border-orange-200/80 shadow-xs flex items-center justify-center shrink-0">
              {renderWeatherIcon('w-5 h-5')}
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-tight truncate">
                  {isEn ? 'Dak Song Weather' : 'Thời Tiết Đắk Song'}
                </h4>
                <span className="inline-flex items-center text-[9px] font-bold text-stone-500 bg-white/80 px-1 py-0.2 rounded border border-stone-200/60 shrink-0">
                  <Mountain className="w-2.5 h-2.5 mr-0.5 text-stone-400" />
                  {weather ? `${weather.elevation}m` : '816m'}
                </span>
              </div>

              {/* Tóm tắt nhanh khi ở trạng thái ẩn */}
              <p className="text-[11px] text-stone-600 truncate mt-0.5">
                {weather ? (
                  <>
                    <span className="font-extrabold text-stone-800">{weather.temperature}°C</span>
                    <span className="mx-1 text-stone-400">•</span>
                    <span>{isEn ? weather.conditionEn : weather.conditionVi}</span>
                    <span className="mx-1 text-stone-400">•</span>
                    <span className="font-bold text-[#ff9600]">
                      <Wind className="w-2.5 h-2.5 inline mr-0.5" />
                      {weather.windSpeed} km/h
                    </span>
                  </>
                ) : (
                  <span>{isEn ? 'Highland weather & wind' : 'Khí hậu mát mẻ & lộng gió'}</span>
                )}
              </p>
            </div>
          </div>

          {/* Nút bấm chuyển đổi Mở ra / Thu gọn */}
          <div className="flex items-center space-x-1.5 shrink-0 pl-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#ff9600] text-xs font-black border border-orange-200/80 active:scale-95 transition-all flex items-center shadow-xs"
            >
              <span>{isExpanded ? (isEn ? 'Hide' : 'Ẩn') : (isEn ? 'Details' : 'Xem thời tiết')}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* 2. NỘI DUNG CHI TIẾT (Chỉ mở khi isExpanded = true) */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 border-t border-orange-200/60 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2.5">
            {loading && !weather ? (
              <div className="py-4 flex items-center justify-center space-x-2 text-xs text-stone-500">
                <RefreshCw className="w-4 h-4 animate-spin text-[#ff9600]" />
                <span>{isEn ? 'Reading weather station...' : 'Đang nạp dữ liệu trạm khí tượng...'}</span>
              </div>
            ) : weather ? (
              <>
                {/* Hàng 1: Nhiệt độ lớn, Cảm giác nhiệt và Nút Refresh */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-stone-900 tracking-tight">
                      {weather.temperature}°C
                    </span>
                    <span className="text-xs font-medium text-stone-500">
                      {isEn ? `Feels like ${weather.apparentTemperature}°C` : `Cảm giác như ${weather.apparentTemperature}°C`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right bg-white/70 px-2 py-0.5 rounded-lg border border-amber-200/60">
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-stone-700">
                        <Thermometer className="w-3 h-3 text-[#ff9600]" />
                        <span>{weather.tempMax}° / {weather.tempMin}°</span>
                      </div>
                    </div>

                    <button
                      onClick={() => fetchWeather(true)}
                      disabled={isRefreshing}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-400 hover:text-[#ff9600] border border-orange-200/60 active:scale-95 transition-all shadow-2xs"
                      title={isEn ? 'Update live weather' : 'Cập nhật lại'}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#ff9600]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Hàng 2: Lưới 3 ô thông số chi tiết (Sức gió, Độ ẩm, Khí hậu cao nguyên) */}
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Ô Sức gió */}
                  <div className="bg-white/90 rounded-xl p-2 border border-orange-200/60 shadow-2xs">
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-stone-500">
                      <Wind className="w-3 h-3 text-[#ff9600]" />
                      <span>{isEn ? 'Wind Speed' : 'Sức gió'}</span>
                    </div>
                    <div className="mt-0.5">
                      <span className="text-xs font-black text-stone-800">
                        {weather.windSpeed} <span className="text-[10px] font-normal text-stone-500">km/h</span>
                      </span>
                      <p className="text-[9px] font-bold text-emerald-600 line-clamp-1 leading-tight mt-0.5">
                        {isEn ? weather.windLevelDescEn : weather.windLevelDescVi}
                      </p>
                    </div>
                  </div>

                  {/* Ô Độ ẩm */}
                  <div className="bg-white/90 rounded-xl p-2 border border-orange-200/60 shadow-2xs">
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-stone-500">
                      <Droplets className="w-3 h-3 text-sky-500" />
                      <span>{isEn ? 'Humidity' : 'Độ ẩm'}</span>
                    </div>
                    <div className="mt-0.5">
                      <span className="text-xs font-black text-stone-800">
                        {weather.humidity}%
                      </span>
                      <p className="text-[9px] font-bold text-stone-500 line-clamp-1 leading-tight mt-0.5">
                        {weather.humidity > 80 ? (isEn ? 'Moist & cool' : 'Ẩm ướt se lạnh') : (isEn ? 'Dry & fresh' : 'Khô ráo thoáng')}
                      </p>
                    </div>
                  </div>

                  {/* Ô Khí hậu / Lượng mưa */}
                  <div className="bg-white/90 rounded-xl p-2 border border-orange-200/60 shadow-2xs">
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-stone-500">
                      <Mountain className="w-3 h-3 text-amber-600" />
                      <span>{isEn ? 'Highland' : 'Khí hậu'}</span>
                    </div>
                    <div className="mt-0.5">
                      <span className="text-xs font-black text-stone-800">
                        {weather.precipitation > 0 ? `${weather.precipitation} mm` : (isEn ? 'Dry' : 'Tạnh')}
                      </span>
                      <p className="text-[9px] font-bold text-stone-500 line-clamp-1 leading-tight mt-0.5">
                        {isEn ? 'Turbines ready' : 'Lý tưởng quạt gió'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-stone-400 text-right pr-0.5 font-medium">
                  {isEn 
                    ? `Live WMO station data • Updated at ${weather.updatedAt}` 
                    : `Dữ liệu trạm khí tượng WMO Đắk Song • Cập nhật lúc ${weather.updatedAt}`}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
