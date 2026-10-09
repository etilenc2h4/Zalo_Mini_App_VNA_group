import React, { useState } from 'react';
import { Heart, ArrowLeft, Trash2, Navigation, Compass, BookOpen, Phone } from 'lucide-react';
import { Destination } from '../../types';
import { ZaloUserData, openGoogleMaps, makePhoneCall } from '../../services/zalo';
import { t } from '../../services/translate.service';

interface BookmarksViewProps {
  currentUser: ZaloUserData | null;
  savedList: Destination[];
  language: 'vi' | 'en';
  isAuthenticating: boolean;
  onBack: () => void;
  onOpenLoginModal: (title: string, desc: string) => void;
  onSelectDestination: (dest: Destination) => void;
  onToggleSave: (id: string, e?: React.MouseEvent) => void;
  onOpenVRNode: (nodeId: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  currentUser,
  savedList,
  language,
  isAuthenticating,
  onBack,
  onOpenLoginModal,
  onSelectDestination,
  onToggleSave,
  onOpenVRNode
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredList = savedList.filter((item) => {
    const isArticle = Boolean(
      item.extra_data?.isPost || 
      item.extra_data?.target_type === 'post' || 
      item.categoryLabel === 'Bài viết' || 
      item.distance === 'Bài viết' || 
      item.extra_data?.slug
    );

    if (activeCategory === 'all') return true;
    if (activeCategory === 'post') return isArticle;
    if (isArticle) return false; // Không đưa bài viết vào các tab địa điểm

    const cat = (item.categoryLabel || '').toLowerCase();
    if (activeCategory === 'nature') return cat.includes('thiên nhiên') || cat.includes('thắng cảnh') || cat.includes('di tích') || cat.includes('nature');
    if (activeCategory === 'food') return cat.includes('ẩm thực') || cat.includes('đặc sản') || cat.includes('food') || cat.includes('quán');
    if (activeCategory === 'stay') return cat.includes('lưu trú') || cat.includes('khách sạn') || cat.includes('homestay') || cat.includes('stay');
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#ff9600] text-xs font-bold flex items-center shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            {language === 'en' ? 'Back' : 'Quay lại'}
          </button>
          <h3 className="text-sm font-black text-stone-900">
            {language === 'en' ? `Saved Items (${savedList.length})` : `Mục Đã Lưu (${savedList.length})`}
          </h3>
        </div>
      </div>

      {!currentUser ? (
        <div className="bg-white rounded-3xl p-8 border border-stone-200/90 text-center space-y-3.5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#ff9600] flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-stone-900 text-sm">
              {language === 'en' ? 'Account Login Required' : 'Cần Đăng Nhập Tài Khoản'}
            </h4>
            <p className="text-stone-500 text-xs leading-relaxed max-w-xs mx-auto">
              {language === 'en'
                ? 'Please connect Zalo to view, sync and manage your favorite destinations and articles.'
                : 'Vui lòng kết nối Zalo để xem, đồng bộ và quản lý danh sách địa điểm và bài viết yêu thích của bạn.'}
            </p>
          </div>
          <button
            onClick={() => {
              onOpenLoginModal(
                language === 'en' ? 'Favorites & Wishlist' : 'Mục Yêu Thích & Đã Lưu',
                language === 'en'
                  ? 'Log in with 1-tap Zalo to save and sync beautiful spots and articles in Dak Song.'
                  : 'Đăng nhập Zalo 1-chạm để lưu và đồng bộ danh sách điểm đến và bài viết hay tại Đắk Song.'
              );
            }}
            disabled={isAuthenticating}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-[#ff9600] text-white text-xs font-black shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            {language === 'en' ? 'Log in with Zalo' : 'Đăng nhập với Zalo'}
          </button>
        </div>
      ) : savedList.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#ff9600] flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-stone-900 text-sm">
              {language === 'en' ? 'No saved items yet' : 'Chưa có mục nào được lưu'}
            </h4>
            <p className="text-stone-500 text-xs">
              {language === 'en'
                ? 'Tap the heart icon on any destination or article to build your travel list!'
                : 'Hãy nhấn biểu tượng trái tim ở các điểm du lịch hoặc bài viết để lưu lại xem sau!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Bộ lọc nhanh danh mục khi có từ 2 mục trở lên */}
          {savedList.length >= 2 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', labelVi: 'Tất cả', labelEn: 'All' },
                { id: 'nature', labelVi: 'Thắng cảnh', labelEn: 'Attractions' },
                { id: 'post', labelVi: 'Bài viết', labelEn: 'Articles' },
                { id: 'food', labelVi: 'Ẩm thực', labelEn: 'Food' },
                { id: 'stay', labelVi: 'Lưu trú', labelEn: 'Stays' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveCategory(filter.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeCategory === filter.id
                      ? 'bg-[#ff9600] text-white shadow-sm'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {language === 'en' ? filter.labelEn : filter.labelVi}
                </button>
              ))}
            </div>
          )}

          {filteredList.map((item) => {
            const isArticle = Boolean(
              item.extra_data?.isPost || 
              item.extra_data?.target_type === 'post' || 
              item.categoryLabel === 'Bài viết' || 
              item.distance === 'Bài viết' || 
              item.extra_data?.slug
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-stone-200 shadow-sm flex space-x-3 items-center group"
              >
                <div
                  onClick={() => onSelectDestination(item)}
                  className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {isArticle && (
                    <div className="absolute top-1 left-1 p-1 rounded-md bg-stone-900/70 text-[#ff9600] backdrop-blur-xs">
                      <BookOpen className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-full uppercase">
                      {t(item.categoryLabel, language)}
                    </span>
                    <button
                      onClick={(e) => onToggleSave(item.id, e)}
                      className="text-stone-400 hover:text-rose-500 p-1"
                      title={language === 'en' ? 'Remove from saved' : 'Xóa khỏi danh sách'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4
                    onClick={() => onSelectDestination(item)}
                    className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1 mt-1 cursor-pointer group-hover:text-[#ff9600] transition-colors"
                  >
                    {t(item.name, language)}
                  </h4>

                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {item.address ? t(item.address, language) : ''}
                  </p>

                  <div className="mt-2 flex items-center space-x-2">
                    {isArticle ? (
                      <button
                        onClick={() => onSelectDestination(item)}
                        className="px-2.5 py-1 bg-stone-900 text-[#ff9600] rounded-lg text-[10px] font-bold flex items-center shadow-sm border border-orange-500/30"
                      >
                        <BookOpen className="w-3 h-3 mr-1 text-[#ff9600]" />
                        {language === 'en' ? 'Read article' : 'Đọc bài viết'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => openGoogleMaps(item.name, item.lat, item.lng, item.address)}
                          className="px-2 py-1 bg-[#ff9600] text-white rounded-lg text-[10px] font-bold flex items-center shadow-sm active:scale-95 transition-all"
                        >
                          <Navigation className="w-3 h-3 mr-1 fill-current" />
                          {language === 'en' ? 'Directions' : 'Chỉ đường'}
                        </button>

                        {(item.phone || item.extra_data?.phone || item.extra_data?.hotline) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              makePhoneCall(item.phone || item.extra_data?.phone || item.extra_data?.hotline);
                            }}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold flex items-center shadow-xs border border-stone-200/80 active:scale-95 transition-all"
                            title={
                              language === 'en'
                                ? `Call: ${item.phone || item.extra_data?.phone || item.extra_data?.hotline}`
                                : `Gọi: ${item.phone || item.extra_data?.phone || item.extra_data?.hotline}`
                            }
                          >
                            <Phone className="w-3 h-3 mr-1 text-[#ff9600] fill-[#ff9600]/20" />
                            <span>{item.phone || item.extra_data?.phone || item.extra_data?.hotline}</span>
                          </button>
                        )}
                      </>
                    )}

                    {item.vrNodeId && (
                      <button
                        onClick={() => onOpenVRNode(item.vrNodeId!)}
                        className="px-2 py-1 bg-stone-900 text-[#ff9600] rounded-lg text-[10px] font-bold flex items-center border border-orange-500/30"
                      >
                        <Compass className="w-3 h-3 mr-1 text-[#ff9600]" />
                        VR 360°
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && savedList.length > 0 && (
            <div className="bg-stone-50 rounded-2xl p-6 text-center text-xs text-stone-500 font-medium">
              {language === 'en' ? 'No items in this category' : 'Không có mục nào thuộc danh mục này'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
