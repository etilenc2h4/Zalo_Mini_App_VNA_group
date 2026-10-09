import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Layers } from 'lucide-react';
import { DESTINATIONS } from '../data/mockData';
import { Destination } from '../types';
import { openGoogleMaps } from '../services/zalo';

interface InteractiveMapProps {
  onSelectDestination: (dest: Destination) => void;
  onOpenVRNode: (nodeId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onSelectDestination,
  onOpenVRNode
}) => {
  const [selectedPin, setSelectedPin] = useState<Destination>(DESTINATIONS[0]);

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-4.5 bg-[#ff9600] rounded-full inline-block" />
          <h3 className="font-extrabold text-[#ff9600] text-sm uppercase tracking-wider">
            Bản Đồ Du Lịch Đắk Song
          </h3>
        </div>
        <span className="text-[11px] text-stone-400">Tọa độ GPS thực tế</span>
      </div>

      {/* Map Visual Container */}
      <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-200">
        {/* Map Background representation */}
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
          alt="Bản đồ Đắk Song"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30" />

        {/* Dynamic Pins */}
        <div className="absolute inset-0 p-4">
          <div className="relative w-full h-full">
            {DESTINATIONS.slice(0, 5).map((dest, i) => {
              // Simulated pin coordinates relative in box
              const positions = [
                { top: '25%', left: '30%' }, // Điện gió
                { top: '65%', left: '70%' }, // Thác Lưu Ly
                { top: '45%', left: '60%' }, // Thiền viện
                { top: '80%', left: '80%' }, // Nâm Nung
                { top: '40%', left: '35%' }, // M'nông
              ];
              const pos = positions[i] || { top: '50%', left: '50%' };
              const isSelected = selectedPin.id === dest.id;

              return (
                <button
                  key={dest.id}
                  onClick={() => setSelectedPin(dest)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                    isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-110 opacity-90'
                  }`}
                  title={dest.name}
                >
                  <div className={`p-1.5 rounded-full shadow-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#ff9600] text-white ring-4 ring-orange-300 animate-bounce'
                      : 'bg-white text-stone-800'
                  }`}>
                    <MapPin className="w-4 h-4 fill-current" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Destination Card Floating at Bottom */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30">
          <div className="bg-stone-900/95 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 shadow-xl flex items-center justify-between space-x-2">
            <div
              onClick={() => onSelectDestination(selectedPin)}
              className="flex items-center space-x-2.5 min-w-0 flex-1 cursor-pointer"
            >
              <img
                src={selectedPin.image}
                alt={selectedPin.name}
                className="w-11 h-11 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-amber-300 font-bold block truncate">
                  {selectedPin.categoryLabel}
                </span>
                <h4 className="font-bold text-xs text-white truncate">
                  {selectedPin.name}
                </h4>
                <p className="text-[10px] text-stone-300 truncate">
                  {selectedPin.address}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              {selectedPin.vrNodeId && (
                <button
                  onClick={() => onOpenVRNode(selectedPin.vrNodeId!)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-bold"
                  title="Xem 360"
                >
                  <Compass className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => openGoogleMaps(selectedPin.name, selectedPin.lat, selectedPin.lng, selectedPin.address)}
                className="px-3 py-2 rounded-xl bg-[#ff9600] text-white text-xs font-bold flex items-center space-x-1 hover:bg-[#e68400]"
                title="Mở Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Chỉ đường</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

