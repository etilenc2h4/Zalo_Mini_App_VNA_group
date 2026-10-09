import React from 'react';
import { X, Heart, Trash2, ArrowRight, BookOpen, Phone } from 'lucide-react';
import { Destination } from '../types';
import { makePhoneCall } from '../services/zalo';
import { t } from '../services/translate.service';

interface SavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDestinations: Destination[];
  onRemoveSave: (id: string) => void;
  onSelectDestination: (dest: Destination) => void;
  language?: 'vi' | 'en';
}

export const SavedModal: React.FC<SavedModalProps> = ({
  isOpen,
  onClose,
  savedDestinations,
  onRemoveSave,
  onSelectDestination,
  language = 'vi',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{language === 'en' ? 'Saved Items' : 'Mục Đã Lưu'}</h3>
              <p className="text-[11px] text-slate-400">
                {language === 'en'
                  ? `${savedDestinations.length} of your favorite spots & articles`
                  : `${savedDestinations.length} địa điểm & bài viết bạn quan tâm`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDestinations.length > 0 ? (
            savedDestinations.map((dest) => {
              const isArticle = Boolean(
                dest.extra_data?.isPost ||
                dest.extra_data?.target_type === 'post' ||
                dest.categoryLabel === 'Bài viết' ||
                dest.distance === 'Bài viết'
              );
              const phone = dest.phone || dest.extra_data?.phone || dest.extra_data?.hotline;

              return (
                <div
                  key={dest.id}
                  className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm flex items-center justify-between space-x-3 hover:border-orange-200 transition-all"
                >
                  <div
                    onClick={() => {
                      onClose();
                      onSelectDestination(dest);
                    }}
                    className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                      {isArticle && (
                        <div className="absolute top-1 left-1 p-0.5 rounded bg-stone-900/70 text-[#ff9600]">
                          <BookOpen className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-md font-semibold">
                        {t(dest.categoryLabel, language)}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate mt-0.5">
                        {t(dest.name, language)}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {dest.address ? t(dest.address, language) : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {phone && !isArticle && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          makePhoneCall(phone);
                        }}
                        className="p-2 text-stone-600 hover:text-[#ff9600] rounded-lg active:scale-95 transition-colors"
                        title={language === 'en' ? `Call: ${phone}` : `Gọi: ${phone}`}
                      >
                        <Phone className="w-4 h-4 text-[#ff9600]" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveSave(dest.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg active:scale-95"
                      title={language === 'en' ? 'Remove from saved' : 'Xóa khỏi đã lưu'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectDestination(dest);
                      }}
                      className="p-2 text-[#ff9600] hover:text-orange-600 rounded-lg"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700 text-sm">
                {language === 'en' ? 'No saved destinations yet' : 'Chưa có địa điểm nào được lưu'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {language === 'en'
                  ? 'Tap the heart icon on any destination to save it for your itinerary.'
                  : 'Hãy nhấn vào biểu tượng trái tim ở các địa điểm du lịch để lưu lại lịch trình của bạn.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

