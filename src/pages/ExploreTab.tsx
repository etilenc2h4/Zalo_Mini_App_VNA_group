import React, { useState } from 'react';
import { Search, Filter, X, MapPin } from 'lucide-react';
import { Destination, CategoryType } from '../types';
import { DestinationCard } from '../components/DestinationCard';

interface ExploreTabProps {
  destinations: Destination[];
  savedIds: string[];
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectDestination: (item: Destination) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  destinations,
  savedIds,
  onToggleSave,
  onSelectDestination,
  selectedCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { key: CategoryType; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'windpower', label: 'Điện Gió' },
    { key: 'nature', label: 'Rừng & Thác' },
    { key: 'farmstay', label: 'Nông trại OCOP' },
    { key: 'culture', label: 'Bản sắc M\'Nông' },
  ];

  const filteredDestinations = destinations.filter((dest) => {
    const matchCategory =
      selectedCategory === 'all' || dest.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-4 pb-24 px-4 pt-3">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Khám Phá Địa Danh Đắk Song
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tổng hợp những cảnh sắc kỳ vĩ và điểm du lịch hấp dẫn nhất
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm: Điện gió, đồi thông, thác nước..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>Tìm thấy <strong className="text-emerald-700">{filteredDestinations.length}</strong> địa điểm</span>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-emerald-600 font-semibold hover:underline"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* List Destinations */}
      {filteredDestinations.length > 0 ? (
        <div className="space-y-3.5">
          {filteredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              item={dest}
              layout="vertical"
              isSaved={savedIds.includes(dest.id)}
              onToggleSave={onToggleSave}
              onSelect={onSelectDestination}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Không tìm thấy địa điểm phù hợp</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Vui lòng thử tìm từ khóa khác hoặc chuyển sang xem tất cả danh mục.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            Xem tất cả điểm đến
          </button>
        </div>
      )}
    </div>
  );
};

