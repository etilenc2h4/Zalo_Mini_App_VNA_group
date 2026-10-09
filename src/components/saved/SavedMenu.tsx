import React from 'react';
import {
  User,
  Heart,
  QrCode,
  CalendarRange,
  ShieldAlert,
  Phone,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Globe2,
  Pencil,
  Lock
} from 'lucide-react';
import { ZaloUserData, openExternalUrl, makePhoneCall } from '../../services/zalo';
import { t } from '../../services/translate.service';

interface SavedMenuProps {
  currentUser: ZaloUserData | null;
  isAuthenticating: boolean;
  authNotice: string | null;
  savedCount: number;
  language: 'vi' | 'en';
  onOpenLoginModal: (title: string, desc: string) => void;
  onLogout: () => void;
  onOpenEditNickname: () => void;
  onNavigateView: (view: 'bookmarks' | 'planner' | 'sos') => void;
  onScanQR: () => void;
  onChangeTab?: (tab: string) => void;
}

export const SavedMenu: React.FC<SavedMenuProps> = ({
  currentUser,
  isAuthenticating,
  authNotice,
  savedCount,
  language,
  onOpenLoginModal,
  onLogout,
  onOpenEditNickname,
  onNavigateView,
  onScanQR,
  onChangeTab
}) => {
  return (
    <div className="space-y-4">
      {/* Header Tiêu Đề */}
      <div>
        <h2 className="text-xl font-black text-stone-900 flex items-center">
          <span className="w-2 h-5 bg-[#ff9600] rounded-full inline-block mr-2" />
          {t('Tài Khoản & Tiện Ích', language)}
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          {t('Quản lý lịch trình, điểm yêu thích và thông tin cá nhân', language)}
        </p>
      </div>

      {/* Thẻ Hồ Sơ Người Dùng (Thiết kế Cam Vàng Tây Nguyên cao cấp) */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-[#ff9600] rounded-3xl p-4 text-white shadow-lg shadow-orange-500/15 border border-amber-300/30 space-y-2.5 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3 min-w-0">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/50 shadow-sm shrink-0 bg-white/20"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-sm">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-sm text-white truncate">
                  {currentUser ? currentUser.name : (language === 'en' ? 'Dak Song Visitor' : 'Khách Du Lịch Đắk Song')}
                </h3>
                {currentUser && (
                  <button
                    onClick={onOpenEditNickname}
                    className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90 shrink-0"
                    title={t('Đổi tên hiển thị', language)}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-amber-100 truncate mt-0.5">
                {currentUser 
                  ? `Zalo ID: ${currentUser.id.slice(0, 16)}`
                  : (language === 'en' ? 'Zalo account not linked' : 'Chưa liên kết tài khoản Zalo')}
              </p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30"
                title={t('Đăng xuất', language)}
              >
                {t('Đăng xuất', language)}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenLoginModal(
                  language === 'en' ? 'Connect Zalo Account' : 'Kết Nối Tài Khoản Zalo',
                  language === 'en'
                    ? 'Log in with 1-tap Zalo to save favorite spots and sync your tour itineraries.'
                    : 'Đăng nhập tài khoản Zalo với 1-chạm để lưu trữ địa điểm yêu thích và đồng bộ lịch trình tour của bạn.'
                );
              }}
              disabled={isAuthenticating}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 active:scale-95 shadow-sm bg-white text-orange-600 hover:bg-orange-50 disabled:opacity-75"
            >
              {isAuthenticating ? '...' : t('Đăng nhập Zalo', language)}
            </button>
          )}
        </div>

        {authNotice && (
          <div className="bg-white/20 backdrop-blur-md border border-white/40 text-white text-[11px] p-2 rounded-xl font-medium animate-fadeIn relative z-10">
            {authNotice}
          </div>
        )}
      </div>

      {/* NHÓM 1: CHUYẾN ĐI & TIỆN ÍCH CÁ NHÂN */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1">
          {t('Hành trình & Tiện ích', language)}
        </span>

        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm divide-y divide-stone-100 overflow-hidden">
          {/* Hàng 1: Lịch trình của tôi */}
          <div
            onClick={() => {
              if (!currentUser) {
                onOpenLoginModal(
                  language === 'en' ? 'Discovery Itinerary' : 'Lịch Trình Khám Phá',
                  language === 'en'
                    ? 'Log in with 1-tap Zalo to create, manage, and sync your personalized Dak Song discovery tours.'
                    : 'Đăng nhập Zalo 1-chạm để tạo, quản lý và đồng bộ các gợi ý tour khám phá Đắk Song của riêng bạn.'
                );
              } else {
                onNavigateView('planner');
              }
            }}
            className="p-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors active:bg-stone-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ff9600] flex items-center justify-center shrink-0">
                <CalendarRange className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-bold text-stone-900">{t('Lịch trình của tôi', language)}</h4>
                  {!currentUser && <Lock className="w-3 h-3 text-stone-400" />}
                </div>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {t('Gợi ý tour 1 - 2 ngày khám phá Đắk Song', language)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 shrink-0 text-stone-400">
              {!currentUser ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{language === 'en' ? 'Log in' : 'Đăng nhập'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-full">
                  {language === 'en' ? 'Suggestions' : 'Gợi ý hay'}
                </span>
              )}
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Hàng 2: Điểm đến đã lưu */}
          <div
            onClick={() => {
              if (!currentUser) {
                onOpenLoginModal(
                  language === 'en' ? 'Favorite Destinations' : 'Địa Điểm Yêu Thích',
                  language === 'en'
                    ? 'Log in with 1-tap Zalo to view, manage, and sync your saved destinations to cloud.'
                    : 'Đăng nhập Zalo 1-chạm để xem, quản lý và đồng bộ danh sách địa điểm bạn đã lưu vào đám mây.'
                );
              } else {
                onNavigateView('bookmarks');
              }
            }}
            className="p-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors active:bg-stone-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-bold text-stone-900">{t('Địa điểm đã lưu', language)}</h4>
                  {!currentUser && <Lock className="w-3 h-3 text-stone-400" />}
                </div>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {t('Điểm đến bạn quan tâm & yêu thích', language)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 shrink-0 text-stone-400">
              {!currentUser ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{language === 'en' ? 'Log in' : 'Đăng nhập'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                  {savedCount} {language === 'en' ? 'places' : 'điểm'}
                </span>
              )}
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Hàng 3: Quét mã QR */}
          <div
            onClick={onScanQR}
            className="p-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors active:bg-stone-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-stone-900">{t('Quét mã QR địa điểm', language)}</h4>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {t('Quét thông tin tại các điểm di tích', language)}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* NHÓM 2: HỖ TRỢ & ĐƯỜNG DÂY NÓNG KHẨN CẤP */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1">
          {language === 'en' ? 'Visitor Support' : 'Hỗ trợ du khách'}
        </span>

        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm divide-y divide-stone-100 overflow-hidden">
          {/* Hàng 4: Cứu hộ khẩn cấp SOS */}
          <div
            onClick={() => onNavigateView('sos')}
            className="p-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors active:bg-stone-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-stone-900">
                  {language === 'en' ? 'Emergency SOS Hotline' : 'Đường dây nóng Cứu hộ SOS'}
                </h4>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {language === 'en' ? 'Police, Medical & Emergency Rescue' : 'Công an, Y tế & Cứu hộ khẩn cấp'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 shrink-0 text-stone-400">
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                SOS 24/7
              </span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Hàng 5: Tổng đài hỗ trợ du khách */}
          <div
            onClick={() => makePhoneCall('02613781122')}
            className="p-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors active:bg-stone-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-stone-900">
                  {language === 'en' ? 'Dak Song District People’s Committee' : 'UBND Huyện Đắk Song'}
                </h4>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {language === 'en' ? 'Visitor support hotline: 0261 378 1122' : 'Hotline hỗ trợ du khách: 0261 378 1122'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl shrink-0">
              {language === 'en' ? 'Call now' : 'Gọi ngay'}
            </span>
          </div>
        </div>
      </div>

      {/* NHÓM 3: KHÁM PHÁ SỐ HÓA & THÔNG TIN */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider px-1">
          {language === 'en' ? 'Explore & Credits' : 'Khám phá & Bản quyền'}
        </span>

        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm divide-y divide-stone-100 overflow-hidden">
          {/* Hàng 6: Sa bàn VR 360 */}
          <div
            onClick={() => onChangeTab && onChangeTab('vr360')}
            className="p-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors active:bg-stone-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-stone-900">
                  {language === 'en' ? 'Virtual Reality 360° Tour' : 'Sa bàn thực tế ảo VR 360°'}
                </h4>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {language === 'en' ? 'Experience 65+ digitized 3D panoramic views' : 'Trải nghiệm toàn cảnh 65+ cảnh quan số hóa 3D'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
          </div>

          {/* Hàng 7: Cổng thông tin */}
          <div
            onClick={() => openExternalUrl('https://dulichdaksong.vnasw.vn')}
            className="p-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors active:bg-stone-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-stone-900">
                  {language === 'en' ? 'Dak Song Tourism & Culture Portal' : 'Cổng Văn Hóa Du Lịch Đắk Song'}
                </h4>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  dulichdaksong.vnasw.vn
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

