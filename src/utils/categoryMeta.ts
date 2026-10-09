import React from 'react';
import {
  UtensilsCrossed,
  Hotel,
  Trees,
  Landmark,
  Building2,
  Sparkles,
  MapPin,
  Compass
} from 'lucide-react';

export interface CategoryDisplayInfo {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeBg: string;
}

/**
 * Chuẩn hóa tên danh mục và icon từ slug/mã API không dấu (ANUONG, LUUTRU, THANGCANH...)
 * sang tiếng Việt có dấu chuẩn cùng icon trực quan dễ nhận diện
 */
export const getCategoryDisplayInfo = (rawCategory: string = '', contentName: string = ''): CategoryDisplayInfo => {
  const raw = (rawCategory || '').trim().toUpperCase();
  const lower = (rawCategory + ' ' + contentName).toLowerCase();

  // 1. Ăn uống / Ẩm thực / Quán ăn
  if (
    raw === 'ANUONG' ||
    raw === 'AMTHUC' ||
    raw === 'NHAHANG' ||
    lower.includes('ăn uống') ||
    lower.includes('ẩm thực') ||
    lower.includes('quán ăn') ||
    lower.includes('quán') ||
    lower.includes('phở') ||
    lower.includes('cà phê') ||
    lower.includes('cơm')
  ) {
    return {
      label: 'Ăn uống',
      icon: UtensilsCrossed,
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-500'
    };
  }

  // 2. Cơ sở lưu trú / Khách sạn / Nhà nghỉ
  if (
    raw === 'LUUTRU' ||
    raw === 'KHACHSAN' ||
    raw === 'HOMESTAY' ||
    raw === 'NHANGHI' ||
    lower.includes('lưu trú') ||
    lower.includes('khách sạn') ||
    lower.includes('nhà nghỉ') ||
    lower.includes('homestay')
  ) {
    return {
      label: 'Lưu trú',
      icon: Hotel,
      colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badgeBg: 'bg-indigo-500'
    };
  }

  // 3. Danh lam thắng cảnh / Thác nước / Đồi núi
  if (
    raw === 'THANG_CANH' ||
    raw === 'THANGCANH' ||
    raw === 'THIENNHIEN' ||
    lower.includes('thắng cảnh') ||
    lower.includes('danh lam') ||
    lower.includes('thác') ||
    lower.includes('đồi gió') ||
    lower.includes('rừng') ||
    lower.includes('núi') ||
    lower.includes('thiên nhiên')
  ) {
    return {
      label: 'Thắng cảnh',
      icon: Trees,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeBg: 'bg-emerald-500'
    };
  }

  // 4. Di tích lịch sử / Văn hóa / Chùa chiền
  if (
    raw === 'DITICH' ||
    raw === 'LICHSU' ||
    raw === 'VANHOA' ||
    lower.includes('di tích') ||
    lower.includes('chùa') ||
    lower.includes('thiền viện') ||
    lower.includes('đền') ||
    lower.includes('lịch sử')
  ) {
    return {
      label: 'Di tích',
      icon: Landmark,
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeBg: 'bg-rose-500'
    };
  }

  // 5. Cơ quan hành chính / UBND
  if (
    raw === 'COQUAN' ||
    raw === 'HANHCHINH' ||
    raw === 'UBND' ||
    lower.includes('hành chính') ||
    lower.includes('cơ quan') ||
    lower.includes('ủy ban') ||
    lower.includes('huyện')
  ) {
    return {
      label: 'Hành chính',
      icon: Building2,
      colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
      badgeBg: 'bg-blue-500'
    };
  }

  // 6. Địa điểm giải trí / Vui chơi
  if (
    raw === 'GIAITRI' ||
    raw === 'CHECKIN' ||
    lower.includes('giải trí') ||
    lower.includes('vui chơi') ||
    lower.includes('checkin') ||
    lower.includes('glamping')
  ) {
    return {
      label: 'Giải trí',
      icon: Sparkles,
      colorClass: 'text-purple-700 bg-purple-50 border-purple-200',
      badgeBg: 'bg-purple-500'
    };
  }

  // Mặc định
  return {
    label: rawCategory && rawCategory !== 'all' ? rawCategory : 'Điểm đến',
    icon: MapPin,
    colorClass: 'text-orange-700 bg-orange-50 border-orange-200',
    badgeBg: 'bg-[#ff9600]'
  };
};

