import React, { useState } from 'react';
import { X, MapPin, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { GALLERY_PHOTOS } from '../data/mockData';
import { GalleryItem } from '../types';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'vi' | 'en';
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ isOpen, onClose, language = 'vi' }) => {
  const isEn = language === 'en';
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isFullscreenView, setIsFullscreenView] = useState(false);

  if (!isOpen) return null;

  const currentPhoto = GALLERY_PHOTOS[selectedPhotoIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-stone-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-white">
          <div>
            <h3 className="font-bold text-sm text-white">{isEn ? 'Dak Song Photo Gallery' : 'Thư Viện Hình Ảnh Đắk Song'}</h3>
            <p className="text-[11px] text-stone-400">
              {selectedPhotoIndex + 1} / {GALLERY_PHOTOS.length} {isEn ? 'photos' : 'hình ảnh'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Preview Area */}
        <div className="relative h-64 sm:h-72 w-full bg-black flex items-center justify-center overflow-hidden">
          <img
            src={currentPhoto.image}
            alt={currentPhoto.title}
            className="w-full h-full object-contain"
          />

          {/* Navigation Arrows */}
          <button
            onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : GALLERY_PHOTOS.length - 1))}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSelectedPhotoIndex((prev) => (prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : 0))}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Caption */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
            <h4 className="font-bold text-xs sm:text-sm text-white">{currentPhoto.title}</h4>
            <p className="text-[11px] text-amber-300 flex items-center mt-0.5">
              <MapPin className="w-3 h-3 mr-1" />
              {currentPhoto.location}
            </p>
          </div>
        </div>

        {/* Thumbnails Row */}
        <div className="p-3 bg-stone-950 flex space-x-2 overflow-x-auto no-scrollbar">
          {GALLERY_PHOTOS.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhotoIndex(idx)}
              className={`w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedPhotoIndex === idx
                  ? 'border-[#ff9600] scale-105 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              <img src={photo.image} alt={photo.title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

