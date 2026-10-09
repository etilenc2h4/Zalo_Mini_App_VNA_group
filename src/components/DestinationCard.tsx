import React from 'react';
import { Star, MapPin, Heart, ChevronRight, Eye } from 'lucide-react';
import { Destination } from '../types';

interface DestinationCardProps {
  item: Destination;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelect: (item: Destination) => void;
  layout?: 'vertical' | 'horizontal';
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  item,
  isSaved,
  onToggleSave,
  onSelect,
  layout = 'vertical'
}) => {
  if (layout === 'horizontal') {
    return (
      <div
        onClick={() => onSelect(item)}
        className="w-72 shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all cursor-pointer group active:scale-[0.98]"
      >
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Badge */}
          <span className="absolute top-2.5 left-2.5 bg-emerald-600/90 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            {item.categoryLabel}
          </span>

          {/* Heart button */}
          <button
            onClick={(e) => onToggleSave(item.id, e)}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white active:scale-90 transition-all shadow-sm"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Bottom badge on image */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
            <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{item.rating}</span>
              <span className="text-white/70 text-[10px]">({item.reviewsCount})</span>
            </div>
            <span className="text-[11px] font-medium bg-emerald-800/80 px-2 py-0.5 rounded-lg backdrop-blur-md">
              {item.ticketPrice}
            </span>
          </div>
        </div>

        <div className="p-3.5">
          <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {item.name}
          </h3>
          <p className="flex items-center text-slate-500 text-xs mt-1.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
            <span>{item.address}</span>
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold">{item.distance}</span>
            <span className="text-slate-400 flex items-center group-hover:text-emerald-600 transition-colors">
              Chi tiết <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all cursor-pointer group active:scale-[0.99] flex flex-col sm:flex-row"
    >
      <div className="relative h-44 sm:h-auto sm:w-44 shrink-0 overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:hidden" />
        <span className="absolute top-2.5 left-2.5 bg-emerald-600/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {item.categoryLabel}
        </span>
        <button
          onClick={(e) => onToggleSave(item.id, e)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-500 active:scale-90 transition-all shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700">{item.rating}</span>
              <span className="text-slate-400">({item.reviewsCount} đánh giá)</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {item.ticketPrice}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base mt-1.5 group-hover:text-emerald-700 transition-colors">
            {item.name}
          </h3>

          <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <p className="flex items-center text-slate-500 text-xs mt-2 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
            <span>{item.address}</span>
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-emerald-600 font-medium">{item.distance}</span>
          <button className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold flex items-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Eye className="w-3.5 h-3.5 mr-1" />
            Khám phá
          </button>
        </div>
      </div>
    </div>
  );
};

