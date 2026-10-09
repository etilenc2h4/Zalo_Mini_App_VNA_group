import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ExternalLink,
  Crosshair
} from 'lucide-react';
import { TravelCategory, TravelLocation } from '../types/travel';
import { Destination } from '../types';
import { getAllTravelCategoriesAndLocations, recordTravelLocationView } from '../services/travel.service';
import { openGoogleMaps, getUserLocation } from '../services/zalo';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { getCategoryDisplayInfo } from '../utils/categoryMeta';
import { MapFilterHeader } from '../components/map/MapFilterHeader';
import { MapLocationSheet } from '../components/map/MapLocationSheet';
import { MapLocationsList } from '../components/map/MapLocationsList';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapTabProps {
  onSelectDestination?: (dest: Destination) => void;
  onOpenVRNode?: (nodeId: string) => void;
  language?: 'vi' | 'en';
  travelLocations?: TravelLocation[];
  savedIds?: string[];
  onToggleSave?: (id: string, e?: React.MouseEvent) => void;
}

export const MapTab: React.FC<MapTabProps> = ({ 
  onSelectDestination, 
  onOpenVRNode, 
  language = 'vi',
  travelLocations,
  savedIds = [],
  onToggleSave
}) => {
  const [categories, setCategories] = useState<TravelCategory[]>([]);
  const [allLocations, setAllLocations] = useState<TravelLocation[]>(travelLocations || []);
  const [selectedLocation, setSelectedLocation] = useState<TravelLocation | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Tự động đồng bộ địa điểm đã dịch khi prop travelLocations từ App.tsx thay đổi
  useEffect(() => {
    if (travelLocations && travelLocations.length > 0) {
      setAllLocations(travelLocations);
    }
  }, [travelLocations]);

  // References cho bản đồ Leaflet chạy 100% Native trong DOM
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const markersLayerRef = React.useRef<L.LayerGroup | null>(null);

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.2285, 107.6723], // Trung tâm huyện Đắk Song
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri © OpenStreetMap',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      ro.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Load danh mục & địa điểm thật từ API travel-category/all/DAKNONG-2-29
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getAllTravelCategoriesAndLocations()
      .then((cats) => {
        if (!isMounted) return;
        setCategories(cats);

        if (!travelLocations || travelLocations.length === 0) {
          const locs: TravelLocation[] = [];
          cats.forEach((c) => {
            c.travelLocations.forEach((loc) => {
              if (!locs.some((existing) => existing.id === loc.id)) {
                locs.push(loc);
              }
            });
          });

          setAllLocations(locs);
          if (locs.length > 0) {
            setSelectedLocation(locs[0]);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi tải danh mục bản đồ:', err);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter Locations theo Category & Search Query
  const filteredLocations = allLocations.filter((loc) => {
    const matchCategory = selectedCategoryId === 'all' || loc.travelCategoryId === selectedCategoryId;
    const matchSearch =
      searchQuery.trim() === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (loc.content && loc.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  // Tự động sắp xếp theo khoảng cách GPS nếu đã có vị trí người dùng
  const sortedLocations = React.useMemo(() => {
    if (!userCoords) return filteredLocations;
    return [...filteredLocations].sort((a, b) => {
      if (!a.lat || !a.lng) return 1;
      if (!b.lat || !b.lng) return -1;
      const distA = calculateDistanceKm(userCoords.latitude, userCoords.longitude, a.lat, a.lng);
      const distB = calculateDistanceKm(userCoords.latitude, userCoords.longitude, b.lat, b.lng);
      return distA - distB;
    });
  }, [filteredLocations, userCoords]);

  // Cập nhật Markers lên Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // 1. Marker vị trí người dùng (chấm xanh radar)
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-pos-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(markersLayer)
        .bindPopup(`<b>${language === 'en' ? 'Your Location' : 'Vị trí của bạn'}</b>`);
    }

    // 2. Markers các địa điểm
    filteredLocations.forEach((loc) => {
      if (!loc.lat || !loc.lng) return;

      const isSelected = selectedLocation?.id === loc.id;
      const meta = getCategoryDisplayInfo(loc.travelCategoryIcon || '', loc.name);

      const customIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: `
          <div class="cursor-pointer transform hover:scale-110 transition-transform ${isSelected ? 'scale-125 z-50' : ''}">
            <div class="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white ${
              isSelected ? 'bg-stone-900 text-[#ff9600] ring-4 ring-orange-500/30' : 'bg-[#ff9600] text-white'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

      marker.on('click', () => {
        handleSelectLocation(loc);
      });

      marker.addTo(markersLayer);
    });
  }, [filteredLocations, selectedLocation, userCoords, language]);

  const handleGetLocation = async () => {
    setIsLocating(true);
    const coords = await getUserLocation();
    setIsLocating(false);
    if (coords) {
      setUserCoords(coords);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([coords.latitude, coords.longitude], 14, {
          animate: true,
          duration: 1.2,
        });
      }
    }
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
  };

  const handleSelectLocation = (loc: TravelLocation) => {
    setSelectedLocation(loc);
    if (mapInstanceRef.current && loc.lat && loc.lng) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 15, { animate: true, duration: 0.8 });
    }
  };

  const handleOpenDetail = (loc: TravelLocation) => {
    setSelectedLocation(loc);
    recordTravelLocationView(loc);
    if (onSelectDestination) {
      const meta = getCategoryDisplayInfo(loc.travelCategoryIcon || '', loc.name + ' ' + (loc.content || ''));
      onSelectDestination({
        id: loc.id,
        name: loc.name,
        category: 'nature',
        categoryLabel: meta.label,
        rating: 5,
        reviewsCount: 15,
        address: loc.address || 'Đắk Song, Đắk Nông',
        distance: userCoords && loc.lat && loc.lng 
          ? formatDistance(calculateDistanceKm(userCoords.latitude, userCoords.longitude, loc.lat, loc.lng)) 
          : 'Đang cập nhật',
        ticketPrice: 'Miễn phí',
        openHours: 'Cả ngày',
        image: loc.imageUrl,
        gallery: [loc.imageUrl],
        description: loc.content || loc.name,
        phone: loc.phone || undefined,
        lat: loc.lat || undefined,
        lng: loc.lng || undefined,
        googleMapsUrl: loc.link || undefined,
        highlights: ['Điểm đến nổi bật trên Cổng Du Lịch Đắk Song', 'Cảnh quan thiên nhiên thơ mộng vùng cao nguyên'],
        tips: ['Nên ghé thăm vào buổi sáng hoặc hoàng hôn', 'Liên hệ trước để được hỗ trợ chu đáo nhất']
      });
    }
  };

  return (
    <div className="space-y-4 pb-24 px-3.5 pt-3">
      {/* 1. Header & Bộ lọc danh mục */}
      <MapFilterHeader
        language={language}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        userCoords={userCoords}
        isLocating={isLocating}
        onGetLocation={handleGetLocation}
        categories={categories}
        allLocationsCount={allLocations.length}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Khung Bản đồ Native Leaflet */}
      <div className="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-sm z-0">
        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

        {/* Badge thông tin địa điểm đang hiển thị trên bản đồ */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none" style={{ zIndex: 1000 }}>
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-stone-200/80 flex items-center space-x-1.5 pointer-events-auto">
            <MapPin className="w-3.5 h-3.5 text-[#ff9600] shrink-0" />
            <span className="text-xs font-black text-stone-800 truncate max-w-[180px]">
              {selectedLocation ? selectedLocation.name : (language === 'en' ? 'Dak Song District Map' : 'Bản đồ Huyện Đắk Song')}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 pointer-events-auto">
            {userCoords && (
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([userCoords.latitude, userCoords.longitude], 15, { animate: true, duration: 0.8 });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1.5 rounded-xl shadow-md backdrop-blur-md active:scale-95 transition-all flex items-center"
                title={language === 'en' ? 'Your Location' : 'Vị trí của bạn'}
              >
                <Crosshair className="w-3 h-3 mr-1" />
                {language === 'en' ? 'You' : 'Vị trí bạn'}
              </button>
            )}

            <button
              onClick={() => {
                setSelectedLocation(null);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([12.2285, 107.6723], 12, { animate: true, duration: 0.8 });
                }
              }}
              className="bg-black/75 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-md backdrop-blur-md active:scale-95 transition-all"
            >
              {language === 'en' ? 'All District' : 'Toàn huyện'}
            </button>
          </div>
        </div>

        {/* Nút mở ứng dụng Google Maps trực tiếp */}
        <div className="absolute bottom-3 right-3 pointer-events-auto" style={{ zIndex: 1000 }}>
          <button
            onClick={() => {
              if (selectedLocation) {
                openGoogleMaps(
                  selectedLocation.name,
                  selectedLocation.lat || undefined,
                  selectedLocation.lng || undefined,
                  selectedLocation.address || undefined
                );
              } else {
                openGoogleMaps('Huyện Đắk Song, Đắk Nông', 12.2285, 107.6723);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-stone-800 text-[11px] font-extrabold shadow-md border border-stone-200 flex items-center active:scale-95 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#ff9600]" />
            {language === 'en' ? 'Open Google Maps' : 'Mở Google Maps'}
          </button>
        </div>
      </div>

      {/* 3. Card chi tiết địa điểm được chọn */}
      {selectedLocation && (
        <MapLocationSheet
          selectedLocation={selectedLocation}
          userCoords={userCoords}
          language={language}
          onOpenDetail={handleOpenDetail}
          isSaved={savedIds.includes(selectedLocation.id)}
          onToggleSave={onToggleSave}
        />
      )}

      {/* 4. Danh sách các địa điểm sắp xếp theo khoảng cách GPS */}
      <MapLocationsList
        sortedLocations={sortedLocations}
        selectedLocationId={selectedLocation?.id}
        userCoords={userCoords}
        language={language}
        onOpenDetail={handleOpenDetail}
      />
    </div>
  );
};
