import React from 'react';
import { Newspaper, Eye, Heart } from 'lucide-react';
import { LivePortalPost } from '../../types';
import { t } from '../../services/translate.service';

interface FeaturedPostsSectionProps {
  posts: LivePortalPost[];
  isLoadingPosts: boolean;
  postError: string | null;
  selectedPostCategory: string;
  availableCategories: string[];
  language?: 'vi' | 'en';
  onSelectCategory: (cat: string) => void;
  onRetryPosts?: () => void;
  onOpenBlog: (post: LivePortalPost) => void;
  onExploreMore: () => void;
  savedIds?: string[];
  onToggleSave?: (id: string, e?: React.MouseEvent) => void;
}

export const FeaturedPostsSection: React.FC<FeaturedPostsSectionProps> = ({
  posts,
  isLoadingPosts,
  postError,
  selectedPostCategory,
  availableCategories,
  language = 'vi',
  onSelectCategory,
  onRetryPosts,
  onOpenBlog,
  onExploreMore,
  savedIds = [],
  onToggleSave
}) => {
  const filteredPosts = posts.filter((post) => {
    if (selectedPostCategory === 'all') return true;
    return post.categoryName.trim().toLowerCase().includes(selectedPostCategory.trim().toLowerCase());
  });

  const displayedPosts = filteredPosts.slice(0, 4);

  return (
    <div className="px-3.5 space-y-3">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-stone-900 text-sm flex items-center">
          <Newspaper className="w-4 h-4 mr-1.5 text-[#ff9600]" />
          {t('Tin Tức & Sự Kiện Mới Nhất', language)}
        </h3>
        <button
          onClick={onExploreMore}
          className="text-xs text-[#ff9600] font-bold hover:underline"
        >
          {t('Xem tất cả', language)}
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        {availableCategories.map((catKey) => {
          const label = catKey === 'all' 
            ? (language === 'en' ? 'All' : 'Tất cả') 
            : t(catKey, language);
          const isSelected = selectedPostCategory === catKey;

          return (
            <button
              key={catKey}
              onClick={() => onSelectCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center ${
                isSelected
                  ? 'bg-[#ff9600] text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Trạng thái Loading Live API */}
      {isLoadingPosts && (
        <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#ff9600] border-t-transparent"></div>
          <p className="text-xs font-semibold text-stone-700">
            {t('Đang tải dữ liệu trực tiếp từ máy chủ Đắk Song...', language)}
          </p>
          <p className="text-[10px] text-stone-500">Kết nối core-360.vnaapi.com (100% Live API)</p>
        </div>
      )}

      {/* Trạng thái Lỗi Kết Nối Live API */}
      {!isLoadingPosts && postError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-2">
          <p className="text-xs font-bold text-red-700">Không thể kết nối đến máy chủ dulichdaksong.vnasw.vn</p>
          <p className="text-[11px] text-red-600">{postError}</p>
          {onRetryPosts && (
            <button
              onClick={onRetryPosts}
              className="mt-1 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shadow hover:bg-red-700 active:scale-95 transition-all"
            >
              Thử lại kết nối
            </button>
          )}
        </div>
      )}

      {/* Trạng thái không có bài viết */}
      {!isLoadingPosts && !postError && displayedPosts.length === 0 && (
        <div className="bg-stone-50 rounded-2xl p-6 text-center text-xs text-stone-500">
          {language === 'en' ? 'No articles in this category.' : 'Không có bài viết nào trong danh mục này.'}
        </div>
      )}

      {/* List Live Posts giới hạn ở Trang chủ */}
      {!isLoadingPosts && !postError && displayedPosts.length > 0 && (
        <div className="space-y-2.5">
          {displayedPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onOpenBlog(post)}
              className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm flex space-x-3 items-center cursor-pointer hover:border-orange-300 transition-all active:scale-[0.99] group"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                <img
                  src={post.imageUrl}
                  alt={post.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {onToggleSave && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(post.id, e);
                    }}
                    className={`absolute bottom-1 right-1 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                      savedIds.includes(post.id)
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
                        : 'bg-black/50 text-white/80 hover:text-white'
                    }`}
                    title={savedIds.includes(post.id) ? (language === 'en' ? 'Remove from saved' : 'Bỏ lưu bài viết') : (language === 'en' ? 'Save article' : 'Lưu bài viết')}
                  >
                    <Heart className={`w-3.5 h-3.5 ${savedIds.includes(post.id) ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-full inline-block truncate max-w-[140px]">
                    {t(post.categoryName, language)}
                  </span>
                  <span className="text-[10px] text-stone-400 flex items-center shrink-0">
                    <Eye className="w-3 h-3 mr-1" />
                    {post.view.toLocaleString('vi-VN')}
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1 group-hover:text-[#ff9600] transition-colors">
                  {t(post.name, language)}
                </h4>

                <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                  {t(post.quote, language) || (language === 'en' ? 'Tap to view full article details...' : 'Nhấn để xem chi tiết bài viết đầy đủ...')}
                </p>
              </div>
            </div>
          ))}

          {/* Nút xem thêm khi còn bài viết */}
          {filteredPosts.length > displayedPosts.length && (
            <div className="pt-1">
              <button
                onClick={onExploreMore}
                className="w-full py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#ff9600] border border-orange-200/80 text-xs font-black flex items-center justify-center space-x-1.5 active:scale-[0.99] transition-all shadow-sm"
              >
                <span>{language === 'en' ? 'Explore more articles' : 'Xem thêm bài viết tại mục Khám phá'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

