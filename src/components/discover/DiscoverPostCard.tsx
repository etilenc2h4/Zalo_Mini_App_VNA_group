import React from 'react';
import { Eye, Heart } from 'lucide-react';
import { PortalPostItem } from '../../types/post';
import { t } from '../../services/translate.service';

interface DiscoverPostCardProps {
  post: PortalPostItem;
  language?: 'vi' | 'en';
  onOpenBlog: (post: PortalPostItem) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string, e?: React.MouseEvent) => void;
}

export const DiscoverPostCard: React.FC<DiscoverPostCardProps> = ({
  post,
  language = 'vi',
  onOpenBlog,
  isSaved = false,
  onToggleSave
}) => {
  return (
    <div
      onClick={() => onOpenBlog(post)}
      className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-sm flex space-x-3 items-center cursor-pointer hover:border-orange-300 transition-all active:scale-[0.99] group relative"
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

        {/* Nút lưu bài viết yêu thích */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(post.id, e);
            }}
            className={`absolute bottom-1 right-1 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isSaved
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
                : 'bg-black/50 text-white/80 hover:text-white'
            }`}
            title={isSaved ? (language === 'en' ? 'Remove from saved' : 'Bỏ lưu bài viết') : (language === 'en' ? 'Save article' : 'Lưu bài viết')}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-full truncate max-w-[140px]">
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
  );
};
