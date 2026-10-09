import React, { useState } from 'react';
import { Globe2, Compass, ChevronRight, Sparkles } from 'lucide-react';
import { PortalBanner } from '../../types';

interface HomeHeroBannerProps {
  banners?: PortalBanner[];
  language?: 'vi' | 'en';
  onOpenVR360: () => void;
}

const DEFAULT_BANNER_IMAGE = 'https://static.dggv.edu.vn/360/1730690452343_z5997324418175_b447115dd96ccd7f7bd7b83f95a27101.jpg';
const BACKUP_HERO_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80';

export const HomeHeroBanner: React.FC<HomeHeroBannerProps> = ({
  banners,
  language = 'vi',
  onOpenVR360
}) => {
  const isEn = language === 'en';
  const banner = banners && banners.length > 0 ? banners[0] : null;

  const [imgSrc, setImgSrc] = useState<string>(
    banner?.fullImageUrl || banner?.url || DEFAULT_BANNER_IMAGE
  );

  const title = banner?.title || banner?.name || (isEn ? 'Dak Song 360° Virtual Tour' : 'Sa Bàn Thực Tế Ảo Đắk Song 360°');
  const subTitle = banner?.subTitle || (isEn ? 'Immerse into plateau wind turbines and pine hills' : 'Trải nghiệm không gian đồi điện gió & danh thắng đại ngàn');

  return (
    <div 
      onClick={onOpenVR360}
      className="relative mx-3.5 mt-3 rounded-3xl overflow-hidden shadow-lg border border-stone-200/80 bg-stone-900 h-56 sm:h-64 cursor-pointer group active:scale-[0.99] transition-all select-none"
      title={isEn ? 'Tap to explore full-screen VR 360° tour' : 'Chạm để mở Sa bàn VR 360° toàn màn hình'}
    >
      {/* Hình ảnh toàn cảnh Panorama sắc nét với hiệu ứng Zoom Parallax mượt mà */}
      <img
        src={imgSrc}
        alt={title}
        onError={() => {
          if (imgSrc !== BACKUP_HERO_IMAGE) {
            setImgSrc(BACKUP_HERO_IMAGE);
          }
        }}
        className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="eager"
      />

      {/* Lớp phủ chuyển sắc bảo đảm tương phản chữ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

      {/* Huy hiệu VR 360° LIVE ở góc trên trái */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-extrabold tracking-wide shadow-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Compass className="w-3 h-3 text-amber-400" />
        <span className="uppercase">{isEn ? 'VR 360° Panorama' : 'Không Gian VR 360°'}</span>
      </div>

      {/* Huy hiệu hiệu ứng góc trên phải */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 px-2.5 py-1 bg-amber-500/80 backdrop-blur-md rounded-full text-white text-[10px] font-bold shadow-sm">
        <Sparkles className="w-2.5 h-2.5" />
        <span>{isEn ? 'Interactive' : 'Tương tác 3D'}</span>
      </div>

      {/* Khối thông tin & Nút mở VR 360° ở góc dưới */}
      <div className="absolute bottom-3 left-3.5 right-3.5 z-10 flex items-end justify-between space-x-2">
        <div className="max-w-[62%] sm:max-w-[70%]">
          <h3 className="text-white font-black text-sm sm:text-base leading-snug drop-shadow-md line-clamp-1">
            {title}
          </h3>
          <p className="text-stone-300 text-[11px] leading-tight line-clamp-1 mt-0.5 drop-shadow-sm font-medium">
            {subTitle}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenVR360();
          }}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff9600] hover:from-amber-600 hover:to-[#e68400] text-white font-black text-xs flex items-center shadow-lg shadow-orange-500/40 active:scale-95 transition-all"
        >
          <Globe2 className="w-3.5 h-3.5 mr-1.5" />
          <span>{isEn ? 'Explore' : 'Khám phá'}</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
