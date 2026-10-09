import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface VR360TabProps {
  initialNodeId?: string;
  onBack?: () => void;
  language?: 'vi' | 'en';
}

export const VR360Tab: React.FC<VR360TabProps> = ({
  initialNodeId = '',
  onBack,
  language = 'vi'
}) => {
  const isEn = language === 'en';
  // Sử dụng trực tiếp URL Cloudflare Worker đã vá Leaflet và mở CORS
  const defaultProxyUrl = "https://daksong-vr360-proxy.truonghaithang.workers.dev/";
  const envProxyUrl = import.meta.env.VITE_VR360_PROXY_URL || '';
  const rawBaseUrl = envProxyUrl.trim() !== '' ? envProxyUrl.trim() : defaultProxyUrl;
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

  const currentUrl = initialNodeId && initialNodeId.trim() !== '' ? `${baseUrl}#${initialNodeId}` : baseUrl;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
      {/* Thanh Bar riêng biệt của Mini App - Tách biệt hoàn toàn, KHÔNG đè lên sa bàn VR */}
      <header className="h-11 bg-stone-900 border-b border-stone-800 px-3 flex items-center justify-between shrink-0 select-none">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-white transition-all border border-white/10 shadow-sm"
          title={isEn ? "Back to Mini App" : "Quay lại Mini App"}
        >
          <ArrowLeft className="w-4 h-4 text-[#ff9600]" />
          <span className="text-xs font-bold text-white">
            {isEn ? "Back to Mini App" : "Về Mini App"}
          </span>
        </button>

        <span className="text-xs font-semibold text-stone-300 tracking-wide">
          {isEn ? "Dak Song VR 360° Panorama" : "Sa bàn VR 360° Đắk Song"}
        </span>

        {/* Khoảng trống cân bằng hai bên */}
        <div className="w-20" />
      </header>

      {/* Khung sa bàn VR 360 chiếm trọn không gian bên dưới, hoàn toàn tự do 100% */}
      <div className="flex-1 w-full h-full relative bg-black">
        <iframe
          src={currentUrl}
          title="Du lịch Đắk Song VR 360"
          className="w-full h-full border-0 block"
          allow="accelerometer; gyroscope; magnetometer; xr-spatial-tracking; fullscreen; autoplay; camera; microphone; geolocation"
          loading="eager"
        />
      </div>
    </div>
  );
};

export default VR360Tab;
