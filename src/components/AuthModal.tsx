import React from 'react';
import { Heart, X, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogin: () => Promise<void> | void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  language?: 'vi' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogin,
  isLoading = false,
  title,
  description,
  language = 'vi'
}) => {
  if (!isOpen) return null;

  const displayTitle = title
    ? (language === 'en' && title.includes('Yêu Thích') ? 'Favorite Destinations' : language === 'en' && title.includes('Lịch Trình') ? 'Discovery Itinerary' : language === 'en' && title.includes('Tài Khoản') ? 'Connect Zalo Account' : title)
    : (language === 'en' ? 'Connect Zalo Account' : 'Kết Nối Tài Khoản Zalo');

  const displayDescription = description
    ? (language === 'en' && description.includes('1-chạm') 
        ? 'Log in with 1-tap Zalo to view, manage and sync your favorite destinations with the cloud.'
        : description)
    : (language === 'en' 
        ? 'Log in with 1-tap Zalo to save your favorite spots and sync your travel tour itinerary.'
        : 'Đăng nhập tài khoản Zalo với 1-chạm để lưu trữ địa điểm yêu thích và đồng bộ lịch trình tour của bạn.');

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop mờ nền */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Sheet Card chuẩn Mobile */}
      <div className="relative w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl z-10 space-y-4 border border-stone-200/80 animate-slideUp">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors"
          title={language === 'en' ? 'Close' : 'Đóng'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon nhận diện thương hiệu phát sáng */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-[#ff9600] flex items-center justify-center text-white shadow-xl shadow-orange-500/25 relative">
            <Heart className="w-8 h-8 fill-white" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
              <Sparkles className="w-3 h-3 text-[#ff9600]" />
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-black text-stone-900 mt-3.5 tracking-tight">
            {displayTitle}
          </h3>

          <p className="text-xs text-stone-500 leading-relaxed mt-1.5 px-2">
            {displayDescription}
          </p>
        </div>

        {/* Lợi ích khi đăng nhập */}
        <div className="bg-orange-50/70 border border-orange-200/60 rounded-2xl p-3 space-y-1.5">
          <div className="flex items-center space-x-2 text-[11px] text-stone-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff9600] shrink-0" />
            <span>{language === 'en' ? 'Personal data secured by Zalo ID' : 'Bảo mật dữ liệu cá nhân theo ID Zalo'}</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-stone-700 font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#ff9600] shrink-0" />
            <span>{language === 'en' ? 'Multi-device sync, preserve your itinerary' : 'Đồng bộ đa thiết bị, không lo mất lịch trình'}</span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onConfirmLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#ff9600] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all hover:opacity-95 disabled:opacity-75"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>
              {isLoading 
                ? (language === 'en' ? 'Connecting to Zalo...' : 'Đang kết nối Zalo...') 
                : (language === 'en' ? 'Log In with Zalo (1-Tap)' : 'Đăng Nhập Với Zalo (1-Chạm)')}
            </span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors"
          >
            {language === 'en' ? 'Maybe later' : 'Để sau'}
          </button>
        </div>
      </div>
    </div>
  );
};

