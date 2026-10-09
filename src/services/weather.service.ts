import { getCached, setCached } from './cache.service';

export interface DakSongWeatherData {
  locationName: string;
  temperature: number; // °C
  apparentTemperature: number; // Cảm nhận
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // °
  windLevelDescVi: string;
  windLevelDescEn: string;
  weatherCode: number;
  conditionVi: string;
  conditionEn: string;
  isDay: boolean;
  precipitation: number; // mm
  tempMax: number;
  tempMin: number;
  elevation: number; // mét
  updatedAt: string;
}

// Tọa độ trung tâm Huyện Đắk Song (Thị trấn Đức An, Đắk Nông)
export const DAK_SONG_COORDS = {
  latitude: 12.1827,
  longitude: 107.6167,
  nameVi: 'Huyện Đắk Song, Đắk Nông',
  nameEn: 'Dak Song District, Dak Nong'
};

const CACHE_KEY = 'daksong_weather_live_data';
const CACHE_TTL = 10 * 60 * 1000; // 10 phút

/**
 * Phân tích mã thời tiết WMO sang thông tin trực quan
 */
const parseWeatherCode = (code: number, isDay: boolean = true) => {
  switch (code) {
    case 0:
      return {
        vi: isDay ? 'Trời quang, nắng đẹp' : 'Đêm quang đãng, trời trong',
        en: isDay ? 'Clear sky, sunny' : 'Clear night'
      };
    case 1:
    case 2:
      return {
        vi: isDay ? 'Ít mây, trời nắng nhẹ' : 'Đêm ít mây, thoáng mát',
        en: isDay ? 'Mainly clear, sunny' : 'Mainly clear'
      };
    case 3:
      return {
        vi: 'Nhiều mây, trời râm mát',
        en: 'Overcast & cool'
      };
    case 45:
    case 48:
      return {
        vi: 'Sương mù cao nguyên',
        en: 'Highland foggy'
      };
    case 51:
    case 53:
    case 55:
      return {
        vi: 'Mưa phùn hạt nhỏ rải rác',
        en: 'Light drizzle showers'
      };
    case 61:
    case 63:
    case 65:
      return {
        vi: 'Có mưa rào cao nguyên',
        en: 'Rainy'
      };
    case 80:
    case 81:
    case 82:
      return {
        vi: 'Mưa rào từng cơn',
        en: 'Intermittent rain showers'
      };
    case 95:
    case 96:
    case 99:
      return {
        vi: 'Có dông sét rải rác',
        en: 'Thunderstorms'
      };
    default:
      return {
        vi: 'Khí hậu mát mẻ ôn hòa',
        en: 'Mild highland weather'
      };
  }
};

/**
 * Đánh giá sức gió Đắk Song phục vụ trải nghiệm du lịch & cánh đồng điện gió
 */
const parseWindSpeed = (speed: number) => {
  if (speed < 10) {
    return {
      vi: 'Gió nhẹ dịu êm',
      en: 'Gentle breeze'
    };
  }
  if (speed <= 20) {
    return {
      vi: 'Gió mát, lý tưởng du lịch',
      en: 'Pleasant wind, ideal tour'
    };
  }
  if (speed <= 35) {
    return {
      vi: 'Lộng gió, quạt gió quay đẹp',
      en: 'Breezy, great wind turbine view'
    };
  }
  return {
    vi: 'Gió mạnh, nên mang áo khoác',
    en: 'Strong winds, wear a jacket'
  };
};

/**
 * Lấy dữ liệu thời tiết thực tế từ trạm khí tượng địa phương Đắk Song
 * Sử dụng API mở WMO Open-Meteo có độ trễ thấp và độ phân giải cao tại tọa độ Đắk Song
 */
export const getDakSongWeather = async (
  latitude: number = DAK_SONG_COORDS.latitude,
  longitude: number = DAK_SONG_COORDS.longitude,
  forceRefresh: boolean = false
): Promise<DakSongWeatherData> => {
  const cacheKey = `${CACHE_KEY}_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

  if (!forceRefresh) {
    const cached = getCached<DakSongWeatherData>(cacheKey);
    if (cached) return cached;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather API returned status: ${res.status}`);
    }

    const data = await res.json();
    const cur = data.current || {};
    const daily = data.daily || {};

    const isDay = cur.is_day === 1;
    const weatherCode = cur.weather_code ?? 0;
    const cond = parseWeatherCode(weatherCode, isDay);
    const windSpeed = Number(cur.wind_speed_10m ?? 0);
    const windInfo = parseWindSpeed(windSpeed);

    const weatherData: DakSongWeatherData = {
      locationName: DAK_SONG_COORDS.nameVi,
      temperature: Math.round(Number(cur.temperature_2m ?? 24)),
      apparentTemperature: Math.round(Number(cur.apparent_temperature ?? 25)),
      humidity: Math.round(Number(cur.relative_humidity_2m ?? 75)),
      windSpeed: Math.round(windSpeed * 10) / 10,
      windDirection: Number(cur.wind_direction_10m ?? 0),
      windLevelDescVi: windInfo.vi,
      windLevelDescEn: windInfo.en,
      weatherCode,
      conditionVi: cond.vi,
      conditionEn: cond.en,
      isDay,
      precipitation: Number(cur.precipitation ?? 0),
      tempMax: Math.round(Number(daily.temperature_2m_max?.[0] ?? 28)),
      tempMin: Math.round(Number(daily.temperature_2m_min?.[0] ?? 19)),
      elevation: Math.round(Number(data.elevation ?? 816)),
      updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setCached(cacheKey, weatherData, CACHE_TTL);
    return weatherData;
  } catch (error) {
    console.error('Failed to fetch Dak Song weather:', error);
    // Dự phòng an toàn theo đặc trưng thực tế độ cao 800m của Đắk Song
    return {
      locationName: DAK_SONG_COORDS.nameVi,
      temperature: 24,
      apparentTemperature: 25,
      humidity: 80,
      windSpeed: 15.5,
      windDirection: 45,
      windLevelDescVi: 'Gió mát cao nguyên',
      windLevelDescEn: 'Pleasant highland wind',
      weatherCode: 2,
      conditionVi: 'Khí hậu mát mẻ quanh năm',
      conditionEn: 'Mild highland climate',
      isDay: true,
      precipitation: 0,
      tempMax: 27,
      tempMin: 19,
      elevation: 816,
      updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  }
};

