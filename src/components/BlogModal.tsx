import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Share2, Eye, Star, Compass, AlertCircle, RefreshCw, Languages, Sparkles, Heart } from 'lucide-react';
import { LivePortalPost } from '../types';
import { shareApp } from '../services/zalo';
import { getLivePostDetail, increasePostView } from '../services/portalApi';
import { translateWithGoogle, translateHtmlContentWithGoogle } from '../services/translate.service';

interface BlogModalProps {
  post: LivePortalPost | null;
  isOpen: boolean;
  onClose: () => void;
  language?: 'vi' | 'en';
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({ 
  post, 
  isOpen, 
  onClose, 
  language = 'vi',
  isSaved = false,
  onToggleSave 
}) => {
  const [detailedContent, setDetailedContent] = useState<string>('');
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedQuote, setTranslatedQuote] = useState<string | null>(null);
  const [translatedHtml, setTranslatedHtml] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isTranslatingHtml, setIsTranslatingHtml] = useState<boolean>(false);
  const [showEnglish, setShowEnglish] = useState<boolean>(language === 'en');

  useEffect(() => {
    setShowEnglish(language === 'en');
  }, [language]);

  useEffect(() => {
    if (!post || !isOpen) {
      setTranslatedTitle(null);
      setTranslatedQuote(null);
      setTranslatedHtml(null);
      setIsTranslating(false);
      setIsTranslatingHtml(false);
      return;
    }

    if (showEnglish) {
      setIsTranslating(true);
      Promise.all([
        translateWithGoogle(post.name, 'en'),
        post.quote ? translateWithGoogle(post.quote, 'en') : Promise.resolve(null)
      ])
        .then(([titleEn, quoteEn]) => {
          setTranslatedTitle(titleEn);
          setTranslatedQuote(quoteEn);
        })
        .finally(() => setIsTranslating(false));
    }
  }, [post, isOpen, showEnglish]);

  // Tự động dịch toàn bộ nội dung HTML chi tiết của bài viết
  useEffect(() => {
    if (!detailedContent || !showEnglish) {
      setTranslatedHtml(null);
      return;
    }

    let isMounted = true;
    setIsTranslatingHtml(true);
    translateHtmlContentWithGoogle(detailedContent, 'en')
      .then((htmlEn) => {
        if (isMounted) {
          setTranslatedHtml(htmlEn);
        }
      })
      .finally(() => {
        if (isMounted) setIsTranslatingHtml(false);
      });

    return () => {
      isMounted = false;
    };
  }, [detailedContent, showEnglish]);

  useEffect(() => {
    if (!isOpen || !post) {
      setDetailedContent('');
      setIsLoadingDetail(false);
      setDetailError(null);
      return;
    }

    const targetSlug = post.slug || post.id;
    if (targetSlug) {
      // Ghi nhận view trên hệ thống như website gốc
      increasePostView(targetSlug);
    }

    // Nếu bài viết đã có sẵn content đầy đủ
    if (post.content && post.content.trim().length > 0) {
      setDetailedContent(post.content);
      setIsLoadingDetail(false);
      return;
    }

    // Ngược lại, gọi API chi tiết theo slug
    if (!targetSlug) {
      setDetailedContent('');
      return;
    }

    setIsLoadingDetail(true);
    setDetailError(null);
    console.log(`[BlogModal] Bắt đầu gọi API chi tiết cho slug: ${targetSlug}`);

    getLivePostDetail(targetSlug)
      .then((fullPost) => {
        console.log(`[BlogModal] Lấy nội dung chi tiết thành công (${fullPost.content?.length || 0} ký tự)`);
        setDetailedContent(fullPost.content || '');
        setIsLoadingDetail(false);
      })
      .catch((err) => {
        console.error('[BlogModal] Lỗi tải nội dung chi tiết bài viết:', err);
        setDetailError(err.message || 'Không thể tải nội dung chi tiết từ máy chủ.');
        setIsLoadingDetail(false);
      });
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const handleShare = () => {
    shareApp(
      post.name,
      post.quote || 'Cổng Văn Hóa Du Lịch - Đắk Song'
    );
  };

  const formattedDate = post.publishDate ? post.publishDate.slice(0, 10) : '2023-04-04';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover Image */}
        <div className="relative h-56 sm:h-64 w-full bg-stone-900 shrink-0">
          <img
            src={post.imageUrl}
            alt={post.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

          {/* Action buttons */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all shadow"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(post.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all shadow ${
                    isSaved ? 'bg-rose-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                  title={isSaved ? (language === 'en' ? 'Remove from saved' : 'Bỏ lưu bài viết') : (language === 'en' ? 'Save article' : 'Lưu bài viết')}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all shadow"
                title={language === 'en' ? 'Share' : 'Chia sẻ'}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 left-4 right-4 text-white z-10">
            <div className="flex items-center space-x-2 mb-1">
              <span className="inline-block bg-[#ff9600] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                {post.categoryName}
              </span>
              <span className="text-[11px] text-amber-200 flex items-center bg-black/40 px-2 py-0.5 rounded-full">
                <Eye className="w-3 h-3 mr-1" />
                {post.view.toLocaleString('vi-VN')} lượt xem
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black leading-snug drop-shadow-md">
              {showEnglish && translatedTitle ? translatedTitle : post.name}
            </h2>
          </div>
        </div>

        {/* Post Metadata & Translation bar */}
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-[#ff9600]" />
              <span className="font-semibold text-stone-700">{post.creator}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <button
            onClick={() => setShowEnglish(!showEnglish)}
            disabled={isTranslating}
            className="text-[11px] font-bold text-orange-700 bg-orange-100/70 hover:bg-orange-200/80 px-2 py-0.5 rounded-full flex items-center space-x-1 active:scale-95 transition-all"
          >
            <Languages className="w-3 h-3" />
            <span>{isTranslating ? 'Đang dịch...' : showEnglish ? '🇻🇳 Tiếng Việt' : '🌐 Google Dịch'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-stone-800 text-xs sm:text-sm leading-relaxed">
          {showEnglish && (
            <div className="text-[10px] text-amber-800 font-medium flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
              <span>🌐 Bản dịch tự động bởi Google Translate</span>
            </div>
          )}

          {/* Excerpt Lead */}
          {post.quote && (
            <div className="p-3 bg-orange-50/80 border-l-4 border-[#ff9600] rounded-r-xl text-stone-800 font-medium italic leading-relaxed">
              "{showEnglish && translatedQuote ? translatedQuote : post.quote}"
            </div>
          )}

          {/* Loading state */}
          {isLoadingDetail && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-stone-500">
              <div className="w-8 h-8 border-3 border-[#ff9600] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-stone-600">Đang tải nội dung chi tiết từ dulichdaksong.vnasw.vn...</p>
            </div>
          )}

          {/* Error state */}
          {!isLoadingDetail && detailError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
              <div className="flex items-center justify-center space-x-1.5 text-red-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Không thể tải chi tiết bài viết</span>
              </div>
              <p className="text-[11px] text-red-600">{detailError}</p>
            </div>
          )}

          {/* Translating HTML State */}
          {!isLoadingDetail && isTranslatingHtml && (
            <div className="py-2.5 px-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center space-x-2 text-amber-800 text-xs font-semibold animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Đang dịch toàn bộ nội dung bài viết bằng Google Translate...</span>
            </div>
          )}

          {/* Render Rich HTML Content from official portal */}
          {!isLoadingDetail && detailedContent ? (
            <div
              className="prose prose-sm max-w-none text-stone-700 space-y-3 font-normal leading-relaxed [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:my-3 [&_img]:w-full [&_img]:object-cover [&_p]:my-2 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: showEnglish && translatedHtml ? translatedHtml : detailedContent }}
            />
          ) : !isLoadingDetail && !detailError ? (
            <p className="text-stone-500 italic text-center py-6">
              {showEnglish ? 'Updating detailed article content...' : 'Đang cập nhật nội dung chi tiết bài viết...'}
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-stone-100 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-stone-400 truncate max-w-[200px]">
            {showEnglish ? 'Source: Dak Song Tourism & Culture Portal' : 'Nguồn: Cổng Văn Hóa Du Lịch Đắk Song'}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-orange-50 text-[#ff9600] font-bold text-xs hover:bg-orange-100 transition-colors"
            >
              {showEnglish ? 'Share' : 'Chia sẻ'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#ff9600] text-white font-bold text-xs hover:bg-[#e68400] transition-colors shadow-sm"
            >
              {showEnglish ? 'Close' : 'Đóng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
